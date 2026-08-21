import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DuplicateGroup, FileItem } from '../src/types/file';
import { ScanOptions, ScanProgressState } from '../src/types/scan';
import { categorizeFile, formatPermissions } from './filesystem';

export class RealFilesystemScanner {
  private activeScan: {
    options: ScanOptions;
    progress: ScanProgressState;
    isCancelled: boolean;
    isPaused: boolean;
    duplicateGroups: DuplicateGroup[];
  } | null = null;

  public getProgress(): ScanProgressState | null {
    return this.activeScan ? { ...this.activeScan.progress } : null;
  }

  public getResults(): DuplicateGroup[] {
    return this.activeScan ? [...this.activeScan.duplicateGroups] : [];
  }

  public cancelScan() {
    if (this.activeScan) {
      this.activeScan.isCancelled = true;
      this.activeScan.progress.status = 'cancelled';
    }
  }

  public pauseScan() {
    if (this.activeScan) {
      this.activeScan.isPaused = true;
      this.activeScan.progress.status = 'paused';
    }
  }

  public resumeScan() {
    if (this.activeScan) {
      this.activeScan.isPaused = false;
      this.activeScan.progress.status = 'scanning';
    }
  }

  public async startScan(options: ScanOptions, onProgress?: (p: ScanProgressState) => void): Promise<DuplicateGroup[]> {
    const startedAt = Date.now();
    const progress: ScanProgressState = {
      status: 'scanning',
      percent: 0,
      currentFolder: options.targetPath || process.cwd(),
      currentFile: 'Initializing indexer...',
      filesScanned: 0,
      foldersScanned: 0,
      bytesScanned: 0,
      duplicateGroupsFound: 0,
      recoverableBytes: 0,
      startedAt,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 0,
      currentPhase: 'indexing',
    };

    this.activeScan = {
      options,
      progress,
      isCancelled: false,
      isPaused: false,
      duplicateGroups: [],
    };

    const targetDir = options.targetPath && fs.existsSync(options.targetPath) ? options.targetPath : process.cwd();
    const filesBySize: Map<number, string[]> = new Map();
    let totalFiles = 0;
    let totalFolders = 0;
    let totalBytes = 0;

    // Phase 1: Indexing & Size gathering
    const walk = (dir: string, depth: number) => {
      if (this.activeScan?.isCancelled) return;
      if (depth > 12) return;

      totalFolders++;
      progress.foldersScanned = totalFolders;
      progress.currentFolder = dir;

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (this.activeScan?.isCancelled) return;

          if (options.ignoreHidden && entry.name.startsWith('.')) continue;
          if (entry.name === '.git') continue;

          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            if (options.includeSubfolders) {
              walk(fullPath, depth + 1);
            }
          } else if (entry.isFile()) {
            try {
              const stat = fs.statSync(fullPath);
              totalFiles++;
              totalBytes += stat.size;
              progress.filesScanned = totalFiles;
              progress.bytesScanned = totalBytes;
              progress.currentFile = entry.name;

              if (stat.size >= (options.minSizeBytes || 1024)) {
                const list = filesBySize.get(stat.size) || [];
                list.push(fullPath);
                filesBySize.set(stat.size, list);
              }
            } catch {
              // Ignore file read error
            }
          }
        }
      } catch {
        // Ignore unreadable dir
      }
    };

    walk(targetDir, 0);

    if (this.activeScan.isCancelled) return [];

    // Phase 2: Size Filtering & Phase 3: Hashing
    progress.currentPhase = 'hashing';
    progress.percent = 40;
    if (onProgress) onProgress({ ...progress });

    // Filter candidate sizes that have > 1 file
    const sizeCandidates: [number, string[]][] = [];
    for (const [size, paths] of filesBySize.entries()) {
      if (paths.length > 1) {
        sizeCandidates.push([size, paths]);
      }
    }

    const hashMap: Map<string, { size: number; paths: string[] }> = new Map();
    let hashedCount = 0;
    const totalCandidateFiles = sizeCandidates.reduce((acc, [, paths]) => acc + paths.length, 0);

    for (const [size, paths] of sizeCandidates) {
      if (this.activeScan.isCancelled) return [];

      for (const filePath of paths) {
        if (this.activeScan.isCancelled) return [];

        try {
          progress.currentFile = path.basename(filePath);
          progress.currentFolder = path.dirname(filePath);

          const hash = crypto.createHash(options.hashAlgorithm === 'md5' ? 'md5' : 'sha256');
          const fileBuffer = fs.readFileSync(filePath);
          hash.update(fileBuffer);
          const digest = hash.digest('hex');

          const group = hashMap.get(digest) || { size, paths: [] };
          group.paths.push(filePath);
          hashMap.set(digest, group);
        } catch {
          // Ignore
        }

        hashedCount++;
        const pct = Math.min(95, 40 + Math.round((hashedCount / (totalCandidateFiles || 1)) * 50));
        progress.percent = pct;
        progress.elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
        if (onProgress) onProgress({ ...progress });
      }
    }

    // Phase 4: Analyzing & Forming Duplicate Groups
    progress.currentPhase = 'analyzing';
    const duplicateGroups: DuplicateGroup[] = [];
    let groupIdx = 1;

    for (const [hash, { size, paths }] of hashMap.entries()) {
      if (paths.length > 1) {
        const files: FileItem[] = paths.map((fPath, fIdx) => {
          let stat: fs.Stats;
          try {
            stat = fs.statSync(fPath);
          } catch {
            stat = { size, mtime: new Date(), birthtime: new Date(), mode: 33188, ino: fIdx } as any;
          }

          const fname = path.basename(fPath);
          return {
            id: `dup-${groupIdx}-file-${fIdx + 1}`,
            name: fname,
            path: fPath,
            size: stat.size,
            type: path.extname(fname).replace('.', '') || 'bin',
            category: categorizeFile(fname),
            modifiedAt: stat.mtime.toISOString(),
            createdAt: stat.birthtime.toISOString(),
            hash,
            permissions: formatPermissions(stat.mode),
            mimeType: 'application/octet-stream',
            isOriginal: fIdx === 0,
            isSelected: fIdx > 0, // auto select copies
          };
        });

        duplicateGroups.push({
          id: `group-${groupIdx++}`,
          hash,
          category: files[0].category,
          files,
          totalSize: size * files.length,
          recoverableSize: size * (files.length - 1),
          originalFileId: files[0].id,
        });
      }
    }

    // Calculate totals
    const recoverableBytes = duplicateGroups.reduce((acc, g) => acc + g.recoverableSize, 0);

    progress.percent = 100;
    progress.status = 'completed';
    progress.currentPhase = 'done';
    progress.duplicateGroupsFound = duplicateGroups.length;
    progress.recoverableBytes = recoverableBytes;
    progress.elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    progress.estimatedRemainingSeconds = 0;

    this.activeScan.duplicateGroups = duplicateGroups;
    this.activeScan.progress = progress;
    if (onProgress) onProgress({ ...progress });

    return duplicateGroups;
  }
}

export const realScanner = new RealFilesystemScanner();
