import { ScanOptions, ScanProgressState, ScanResult } from '../types/scan';
import { DuplicateGroup } from '../types/file';
import { initialDuplicateGroups } from '../data/mockData';

export type ScanEventListener = (progress: ScanProgressState) => void;

class ScanService {
  private activeScan: {
    options: ScanOptions;
    progress: ScanProgressState;
    timer?: any;
    listeners: Set<ScanEventListener>;
    isPaused: boolean;
  } | null = null;

  /**
   * Starts a realistic simulated filesystem scan
   * TODO (Tauri Backend): invoke('start_filesystem_scan', { options })
   * with Tauri event listener: listen('scan-progress', (event) => ...)
   */
  startScan(options: ScanOptions, onUpdate: ScanEventListener): () => void {
    if (this.activeScan?.timer) {
      clearInterval(this.activeScan.timer);
    }

    const progress: ScanProgressState = {
      status: 'scanning',
      percent: 0,
      currentFolder: options.targetPath,
      currentFile: 'indexing directory tree...',
      filesScanned: 0,
      foldersScanned: 0,
      bytesScanned: 0,
      duplicateGroupsFound: 0,
      recoverableBytes: 0,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 45,
      currentPhase: 'indexing',
    };

    const listeners = new Set<ScanEventListener>([onUpdate]);

    this.activeScan = {
      options,
      progress,
      listeners,
      isPaused: false,
    };

    const sampleFolders = [
      `${options.targetPath}/Documents`,
      `${options.targetPath}/Downloads`,
      `${options.targetPath}/Videos`,
      `${options.targetPath}/Projects/rust-disk-analyzer`,
      `${options.targetPath}/Pictures/Raw-Camera-Imports-2026`,
      `${options.targetPath}/.cache/cargo-target-cache`,
      `${options.targetPath}/.local/share`,
      `${options.targetPath}/Music/FLAC Lossless Library`,
    ];

    const sampleFiles = [
      'movie.mp4',
      'Ubuntu-24.04-desktop-amd64.iso',
      'node_modules_heavy_backup.tar.gz',
      'Iceland_Landscape_Panorama_8K.raw',
      'Machine-Learning-Compendium-2026.pdf',
      'Orchestral-Symphony-No9-24bit-192khz.flac',
      'main.rs',
      'cargo.lock',
      'index.html',
      'wayland-session.log',
    ];

    let ticks = 0;
    const totalTicks = 50; // ~15 seconds total scan simulation for interactive feel

    const timer = setInterval(() => {
      if (!this.activeScan || this.activeScan.isPaused) return;

      ticks++;
      const current = this.activeScan.progress;
      const elapsed = Math.floor((Date.now() - current.startedAt) / 1000);
      const percent = Math.min(100, Math.round((ticks / totalTicks) * 100));

      const folderIdx = Math.floor((ticks / totalTicks) * sampleFolders.length) % sampleFolders.length;
      const fileIdx = ticks % sampleFiles.length;

      let phase: ScanProgressState['currentPhase'] = 'indexing';
      if (percent > 20 && percent <= 50) phase = 'size_filtering';
      else if (percent > 50 && percent <= 85) phase = 'hashing';
      else if (percent > 85 && percent < 100) phase = 'analyzing';
      else if (percent >= 100) phase = 'done';

      const dupsCount = Math.min(6, Math.floor((percent / 100) * 6));
      const recoverable = (dupsCount * 3.06 * 1024 * 1024 * 1024);

      const updatedProgress: ScanProgressState = {
        ...current,
        percent,
        elapsedSeconds: elapsed,
        estimatedRemainingSeconds: Math.max(0, Math.round(((totalTicks - ticks) / (ticks || 1)) * elapsed)),
        currentPhase: phase,
        currentFolder: sampleFolders[folderIdx],
        currentFile: sampleFiles[fileIdx],
        filesScanned: Math.floor((percent / 100) * 412850),
        foldersScanned: Math.floor((percent / 100) * 18420),
        bytesScanned: Math.floor((percent / 100) * (412 * 1024 * 1024 * 1024)),
        duplicateGroupsFound: dupsCount,
        recoverableBytes: recoverable,
        status: percent >= 100 ? 'completed' : 'scanning',
      };

      this.activeScan.progress = updatedProgress;
      this.notifyListeners(updatedProgress);

      if (percent >= 100) {
        clearInterval(timer);
      }
    }, 280);

    this.activeScan.timer = timer;

    return () => {
      if (this.activeScan?.timer) {
        clearInterval(this.activeScan.timer);
      }
    };
  }

  pauseScan(): void {
    if (this.activeScan) {
      this.activeScan.isPaused = true;
      this.activeScan.progress.status = 'paused';
      this.notifyListeners(this.activeScan.progress);
    }
  }

  resumeScan(): void {
    if (this.activeScan) {
      this.activeScan.isPaused = false;
      this.activeScan.progress.status = 'scanning';
      this.notifyListeners(this.activeScan.progress);
    }
  }

  cancelScan(): void {
    if (this.activeScan) {
      if (this.activeScan.timer) {
        clearInterval(this.activeScan.timer);
      }
      this.activeScan.progress.status = 'cancelled';
      this.notifyListeners(this.activeScan.progress);
      this.activeScan = null;
    }
  }

  private notifyListeners(progress: ScanProgressState): void {
    if (!this.activeScan) return;
    for (const listener of this.activeScan.listeners) {
      listener(progress);
    }
  }

  getMockResults(): DuplicateGroup[] {
    return JSON.parse(JSON.stringify(initialDuplicateGroups));
  }
}

export const scanService = new ScanService();
