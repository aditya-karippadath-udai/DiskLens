import { create } from 'zustand';
import {
  ScanOptions,
  ScanProgressState,
  ScanHistoryItem,
  ScanTargetType,
} from '../types/scan';
import { DuplicateGroup } from '../types/file';
import { initialDuplicateGroups, initialScanHistory } from '../data/mockData';
import { scanService } from '../services/scanService';
import { duplicateService, DuplicateSelectionStrategy } from '../services/duplicateService';

interface ScanStoreState {
  // Active Scan Configuration & State
  scanOptions: ScanOptions;
  scanProgress: ScanProgressState;
  duplicateGroups: DuplicateGroup[];
  scanHistory: ScanHistoryItem[];
  selectedGroupForDetail: DuplicateGroup | null;
  isDeleteDialogOpen: boolean;
  pendingDeleteFiles: { count: number; bytes: number; paths: string[] };

  // Actions
  setScanOptions: (options: Partial<ScanOptions>) => void;
  setTargetType: (target: ScanTargetType, customPath?: string) => void;
  startScan: () => void;
  pauseScan: () => void;
  resumeScan: () => void;
  cancelScan: () => void;
  resetScan: () => void;
  
  // Duplicate File Selection Actions
  applyDuplicateStrategy: (strategy: DuplicateSelectionStrategy) => void;
  toggleFileSelection: (groupId: string, fileId: string) => void;
  setOriginalFile: (groupId: string, fileId: string) => void;
  setSelectedGroupForDetail: (group: DuplicateGroup | null) => void;

  // Safe Deletion Workflow
  openDeleteDialog: () => void;
  closeDeleteDialog: () => void;
  confirmDeletion: (permanent: boolean) => Promise<{ count: number; bytes: number; paths: string[] }>;
  restoreDeleted: (paths: string[]) => void;

  // History Actions
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  targetPath: '/home/aditya',
  targetType: 'home',
  includeSubfolders: true,
  followSymlinks: false,
  ignoreHidden: true,
  minSizeBytes: 1024 * 1024, // 1 MB
  fileCategories: ['video', 'audio', 'image', 'archive', 'document', 'iso', 'code', 'other'],
  hashAlgorithm: 'sha256',
};

const INITIAL_SCAN_PROGRESS: ScanProgressState = {
  status: 'idle',
  percent: 0,
  currentFolder: '',
  currentFile: '',
  filesScanned: 0,
  foldersScanned: 0,
  bytesScanned: 0,
  duplicateGroupsFound: 0,
  recoverableBytes: 0,
  startedAt: 0,
  elapsedSeconds: 0,
  estimatedRemainingSeconds: 0,
  currentPhase: 'indexing',
};

export const useScanStore = create<ScanStoreState>((set, get) => ({
  scanOptions: DEFAULT_SCAN_OPTIONS,
  scanProgress: INITIAL_SCAN_PROGRESS,
  duplicateGroups: initialDuplicateGroups,
  scanHistory: initialScanHistory,
  selectedGroupForDetail: null,
  isDeleteDialogOpen: false,
  pendingDeleteFiles: duplicateService.getSelectedStats(initialDuplicateGroups),

  setScanOptions: (options) =>
    set((state) => ({
      scanOptions: { ...state.scanOptions, ...options },
    })),

  setTargetType: (target, customPath) => {
    let path = '/home/aditya';
    if (target === 'root') path = '/';
    else if (target === 'external') path = '/media/aditya/Samsung_T7';
    else if (target === 'custom' && customPath) path = customPath;

    set((state) => ({
      scanOptions: {
        ...state.scanOptions,
        targetType: target,
        targetPath: path,
      },
    }));
  },

  startScan: () => {
    const { scanOptions } = get();
    
    set({
      scanProgress: {
        ...INITIAL_SCAN_PROGRESS,
        status: 'scanning',
        startedAt: Date.now(),
        currentFolder: scanOptions.targetPath,
      },
    });

    scanService.startScan(scanOptions, (progress) => {
      set({ scanProgress: progress });

      if (progress.status === 'completed') {
        const results = scanService.getMockResults();
        const pending = duplicateService.getSelectedStats(results);

        // Append to history
        const newHistory: ScanHistoryItem = {
          id: `scan-hist-${Date.now()}`,
          name: `${scanOptions.targetType === 'home' ? 'Home' : scanOptions.targetType === 'root' ? 'Root Filesystem' : scanOptions.targetType === 'external' ? 'External Drive' : 'Custom Folder'} Scan`,
          path: scanOptions.targetPath,
          timestamp: Date.now(),
          durationSeconds: progress.elapsedSeconds,
          filesScanned: progress.filesScanned,
          bytesScanned: progress.bytesScanned,
          duplicateGroupsCount: results.length,
          recoverableBytes: pending.bytes,
          status: 'completed',
        };

        set((state) => ({
          duplicateGroups: results,
          pendingDeleteFiles: pending,
          scanHistory: [newHistory, ...state.scanHistory],
        }));
      }
    });
  },

  pauseScan: () => {
    scanService.pauseScan();
    set((state) => ({
      scanProgress: { ...state.scanProgress, status: 'paused' },
    }));
  },

  resumeScan: () => {
    scanService.resumeScan();
    set((state) => ({
      scanProgress: { ...state.scanProgress, status: 'scanning' },
    }));
  },

  cancelScan: () => {
    scanService.cancelScan();
    set((state) => ({
      scanProgress: { ...state.scanProgress, status: 'cancelled' },
    }));
  },

  resetScan: () => {
    scanService.cancelScan();
    set({ scanProgress: INITIAL_SCAN_PROGRESS });
  },

  applyDuplicateStrategy: (strategy) => {
    const { duplicateGroups } = get();
    const updated = duplicateService.applySelectionStrategy(duplicateGroups, strategy);
    const pending = duplicateService.getSelectedStats(updated);
    set({
      duplicateGroups: updated,
      pendingDeleteFiles: pending,
    });
  },

  toggleFileSelection: (groupId, fileId) => {
    const { duplicateGroups } = get();
    const updated = duplicateService.toggleFileSelection(duplicateGroups, groupId, fileId);
    const pending = duplicateService.getSelectedStats(updated);
    set({
      duplicateGroups: updated,
      pendingDeleteFiles: pending,
    });
  },

  setOriginalFile: (groupId, fileId) => {
    const { duplicateGroups } = get();
    const updated = duplicateService.setGroupOriginal(duplicateGroups, groupId, fileId);
    const pending = duplicateService.getSelectedStats(updated);
    set({
      duplicateGroups: updated,
      pendingDeleteFiles: pending,
    });
  },

  setSelectedGroupForDetail: (group) => set({ selectedGroupForDetail: group }),

  openDeleteDialog: () => {
    const { duplicateGroups } = get();
    const pending = duplicateService.getSelectedStats(duplicateGroups);
    set({ isDeleteDialogOpen: true, pendingDeleteFiles: pending });
  },

  closeDeleteDialog: () => set({ isDeleteDialogOpen: false }),

  confirmDeletion: async (permanent) => {
    const { duplicateGroups, pendingDeleteFiles } = get();
    const deletedPaths = [...pendingDeleteFiles.paths];
    const totalBytes = pendingDeleteFiles.bytes;
    const count = pendingDeleteFiles.count;

    // Purge deleted files from duplicate groups list
    const updatedGroups = duplicateService.purgeDeletedFiles(duplicateGroups, deletedPaths);
    const nextPending = duplicateService.getSelectedStats(updatedGroups);

    set({
      duplicateGroups: updatedGroups,
      pendingDeleteFiles: nextPending,
      isDeleteDialogOpen: false,
    });

    return { count, bytes: totalBytes, paths: deletedPaths };
  },

  restoreDeleted: (paths) => {
    // If undo is triggered, reload mock dataset or restore items
    set({
      duplicateGroups: initialDuplicateGroups,
      pendingDeleteFiles: duplicateService.getSelectedStats(initialDuplicateGroups),
    });
  },

  clearHistory: () => set({ scanHistory: [] }),

  deleteHistoryItem: (id) =>
    set((state) => ({
      scanHistory: state.scanHistory.filter((item) => item.id !== id),
    })),
}));
