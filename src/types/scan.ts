import { FileCategory, DuplicateGroup } from './file';

export type ScanTargetType = 'home' | 'root' | 'external' | 'custom';
export type ScanStatus = 'idle' | 'scanning' | 'paused' | 'completed' | 'cancelled' | 'error';
export type HashAlgorithm = 'sha256' | 'md5' | 'blake3' | 'xxhash';

export interface ScanOptions {
  targetPath: string;
  targetType: ScanTargetType;
  includeSubfolders: boolean;
  followSymlinks: boolean;
  ignoreHidden: boolean;
  minSizeBytes: number; // e.g. 1024 * 1024 (1MB)
  fileCategories: FileCategory[];
  hashAlgorithm: HashAlgorithm;
}

export interface ScanProgressState {
  status: ScanStatus;
  percent: number;
  currentFolder: string;
  currentFile: string;
  filesScanned: number;
  foldersScanned: number;
  bytesScanned: number;
  duplicateGroupsFound: number;
  recoverableBytes: number;
  startedAt: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  currentPhase: 'indexing' | 'size_filtering' | 'hashing' | 'analyzing' | 'done';
}

export interface ScanResult {
  id: string;
  path: string;
  targetName: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  filesScanned: number;
  foldersScanned: number;
  bytesScanned: number;
  duplicateGroups: DuplicateGroup[];
  recoverableSpace: number;
  status: 'completed' | 'cancelled' | 'failed';
}

export interface ScanHistoryItem {
  id: string;
  name: string;
  path: string;
  timestamp: number;
  durationSeconds: number;
  filesScanned: number;
  bytesScanned: number;
  duplicateGroupsCount: number;
  recoverableBytes: number;
  status: 'completed' | 'cancelled' | 'failed';
}
