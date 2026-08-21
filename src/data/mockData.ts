import { DiskNode, StorageDrive, DiskStats } from '../types/disk';
import { DuplicateGroup, FileItem } from '../types/file';
import { ScanHistoryItem } from '../types/scan';

// Format Helpers
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string | number): string {
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Fallback Default Data Structures
export const initialDrives: StorageDrive[] = [
  {
    id: 'drive-main',
    name: 'Root Filesystem',
    mountPoint: '/',
    devicePath: '/dev/root',
    filesystem: 'ext4',
    totalBytes: 500 * 1024 * 1024 * 1024,
    usedBytes: 180 * 1024 * 1024 * 1024,
    freeBytes: 320 * 1024 * 1024 * 1024,
    type: 'root',
    isMounted: true,
  },
];

export const initialDiskStats: DiskStats = {
  totalBytes: 500 * 1024 * 1024 * 1024,
  usedBytes: 180 * 1024 * 1024 * 1024,
  freeBytes: 320 * 1024 * 1024 * 1024,
  duplicateBytes: 0,
  largeFileBytes: 0,
  trashBytes: 0,
};

export const initialFilesystemTree: DiskNode = {
  name: '/',
  path: '/',
  size: 180 * 1024 * 1024 * 1024,
  percentage: 100,
  type: 'folder',
  filesCount: 1200,
  children: [],
};

export const initialLargeFiles: FileItem[] = [];
export const initialDuplicateGroups: DuplicateGroup[] = [];
export const initialScanHistory: ScanHistoryItem[] = [];
