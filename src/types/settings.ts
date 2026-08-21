import { HashAlgorithm } from './scan';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  startMinimized: boolean;
  confirmBeforeDeletion: boolean;
  defaultMoveToTrash: boolean;
  allowPermanentDelete: boolean;
  showHiddenFiles: boolean;
  followSymlinks: boolean;
  scanSubdirectories: boolean;
  defaultMinSizeMB: number;
  hashAlgorithm: HashAlgorithm;
  parallelWorkers: number;
  ignoredPaths: string[];
  enableDebugLogging: boolean;
  enableSoundEffects: boolean;
  autoCheckUpdates: boolean;
}
