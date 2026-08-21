import { DiskNode } from '../types/disk';
import { DuplicateGroup, FileItem, FileCategory } from '../types/file';
import { ScanProgressState } from '../types/scan';

export function categorizeBrowserFile(filename: string): FileCategory {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'];
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'ico', 'raw'];
  const archiveExts = ['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar', 'zst', 'tgz'];
  const isoExts = ['iso', 'img', 'vmdk', 'qcow2', 'vdi', 'dmg'];
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv', 'rtf'];
  const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'rs', 'go', 'c', 'cpp', 'h', 'hpp', 'java', 'html', 'css', 'json', 'yaml', 'yml', 'sh', 'sql', 'toml', 'xml'];

  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (imageExts.includes(ext)) return 'image';
  if (archiveExts.includes(ext)) return 'archive';
  if (isoExts.includes(ext)) return 'iso';
  if (docExts.includes(ext)) return 'document';
  if (codeExts.includes(ext)) return 'code';
  return 'other';
}

async function computeBrowserFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `hash-${file.name}-${file.size}-${file.lastModified}`;
  }
}

export interface BrowserScanResult {
  tree: DiskNode;
  largeFiles: FileItem[];
  duplicates: DuplicateGroup[];
  totalBytes: number;
  totalFiles: number;
}

/**
 * Traverses a FileSystemDirectoryHandle (Chrome/Edge/Modern browsers) or FileList
 */
export async function scanBrowserDirectoryHandle(
  dirHandle: any,
  onProgress?: (progress: Partial<ScanProgressState>) => void
): Promise<BrowserScanResult> {
  let totalFiles = 0;
  let totalBytes = 0;
  const filesList: { file: File; fullPath: string }[] = [];

  async function walk(handle: any, currentPath: string): Promise<DiskNode> {
    let folderSize = 0;
    let folderFilesCount = 0;
    const children: DiskNode[] = [];

    for await (const entry of handle.values()) {
      const entryPath = `${currentPath}/${entry.name}`;

      if (entry.kind === 'directory') {
        const subNode = await walk(entry, entryPath);
        children.push(subNode);
        folderSize += subNode.size;
        folderFilesCount += subNode.filesCount || 0;
      } else if (entry.kind === 'file') {
        try {
          const file = await entry.getFile();
          totalFiles++;
          totalBytes += file.size;
          folderSize += file.size;
          folderFilesCount++;

          filesList.push({ file, fullPath: entryPath });

          if (onProgress) {
            onProgress({
              currentFile: file.name,
              currentFolder: currentPath,
              filesScanned: totalFiles,
              bytesScanned: totalBytes,
            });
          }

          children.push({
            name: file.name,
            path: entryPath,
            size: file.size,
            percentage: 0,
            type: 'file',
            category: categorizeBrowserFile(file.name),
            filesCount: 1,
          });
        } catch {
          // Ignore
        }
      }
    }

    for (const c of children) {
      c.percentage = folderSize > 0 ? parseFloat(((c.size / folderSize) * 100).toFixed(1)) : 0;
    }
    children.sort((a, b) => b.size - a.size);

    return {
      name: handle.name || currentPath,
      path: currentPath,
      size: folderSize,
      percentage: 100,
      type: 'folder',
      filesCount: folderFilesCount,
      children,
    };
  }

  const rootTree = await walk(dirHandle, `/${dirHandle.name || 'Local Folder'}`);

  // Find Large Files (>1 MB)
  const largeFiles: FileItem[] = filesList
    .filter(f => f.file.size >= 1024 * 1024)
    .sort((a, b) => b.file.size - a.file.size)
    .map((item, idx) => ({
      id: `browser-large-${idx + 1}`,
      name: item.file.name,
      path: item.fullPath,
      size: item.file.size,
      type: item.file.name.split('.').pop() || 'bin',
      category: categorizeBrowserFile(item.file.name),
      modifiedAt: new Date(item.file.lastModified).toISOString(),
      createdAt: new Date(item.file.lastModified).toISOString(),
      permissions: '-rw-r--r--',
      mimeType: item.file.type || 'application/octet-stream',
    }));

  // Find Duplicates by size first then hash
  const filesBySize = new Map<number, { file: File; fullPath: string }[]>();
  for (const item of filesList) {
    if (item.file.size >= 1024) {
      const list = filesBySize.get(item.file.size) || [];
      list.push(item);
      filesBySize.set(item.file.size, list);
    }
  }

  const duplicateGroups: DuplicateGroup[] = [];
  const hashMap = new Map<string, { size: number; items: { file: File; fullPath: string }[] }>();

  for (const [size, items] of filesBySize.entries()) {
    if (items.length > 1) {
      for (const item of items) {
        const hash = await computeBrowserFileHash(item.file);
        const g = hashMap.get(hash) || { size, items: [] };
        g.items.push(item);
        hashMap.set(hash, g);
      }
    }
  }

  let groupCount = 1;
  for (const [hash, { size, items }] of hashMap.entries()) {
    if (items.length > 1) {
      const files: FileItem[] = items.map((item, idx) => ({
        id: `browser-dup-${groupCount}-file-${idx + 1}`,
        name: item.file.name,
        path: item.fullPath,
        size: item.file.size,
        type: item.file.name.split('.').pop() || 'bin',
        category: categorizeBrowserFile(item.file.name),
        modifiedAt: new Date(item.file.lastModified).toISOString(),
        createdAt: new Date(item.file.lastModified).toISOString(),
        hash,
        permissions: '-rw-r--r--',
        mimeType: item.file.type || 'application/octet-stream',
        isOriginal: idx === 0,
        isSelected: idx > 0,
      }));

      duplicateGroups.push({
        id: `browser-group-${groupCount++}`,
        hash,
        category: files[0]?.category || 'other',
        files,
        totalSize: size * files.length,
        recoverableSize: size * (files.length - 1),
        originalFileId: files[0]?.id || '',
      });
    }
  }

  return {
    tree: rootTree,
    largeFiles,
    duplicates: duplicateGroups,
    totalBytes,
    totalFiles,
  };
}
