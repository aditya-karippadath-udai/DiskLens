import { create } from 'zustand';
import { StorageDrive, DiskNode, DiskStats } from '../types/disk';
import { FileItem, FileCategory } from '../types/file';
import {
  initialDrives,
  initialFilesystemTree,
  initialLargeFiles,
  initialDiskStats,
} from '../data/mockData';
import { filesystemService } from '../services/filesystemService';

interface FilesystemState {
  drives: StorageDrive[];
  selectedDriveId: string;
  diskStats: DiskStats;
  rootTree: DiskNode;
  currentTreemapNode: DiskNode;
  pathBreadcrumbs: { name: string; path: string }[];
  largeFiles: FileItem[];
  largeFilesThresholdMB: number;
  largeFilesCategoryFilter: FileCategory | 'all';
  largeFilesSortBy: 'size_desc' | 'size_asc' | 'date_desc' | 'date_asc' | 'name_asc' | 'type_asc';
  selectedFileItem: FileItem | null;
  lastTrashedPaths: string[];

  // Actions
  setSelectedDriveId: (id: string) => void;
  drillDownNode: (node: DiskNode) => void;
  navigateToBreadcrumb: (path: string) => void;
  setLargeFilesThresholdMB: (mb: number) => void;
  setLargeFilesCategoryFilter: (cat: FileCategory | 'all') => void;
  setLargeFilesSortBy: (sort: FilesystemState['largeFilesSortBy']) => void;
  setSelectedFileItem: (file: FileItem | null) => void;
  deleteLargeFile: (fileId: string) => void;
  setLastTrashedPaths: (paths: string[]) => void;
  refreshDiskData: () => Promise<void>;
}

export const useFilesystemStore = create<FilesystemState>((set, get) => ({
  drives: initialDrives,
  selectedDriveId: 'drive-main',
  diskStats: initialDiskStats,
  rootTree: initialFilesystemTree,
  currentTreemapNode: initialFilesystemTree,
  pathBreadcrumbs: [{ name: '/', path: '/' }],
  largeFiles: initialLargeFiles,
  largeFilesThresholdMB: 500,
  largeFilesCategoryFilter: 'all',
  largeFilesSortBy: 'size_desc',
  selectedFileItem: null,
  lastTrashedPaths: [],

  setSelectedDriveId: (id) => set({ selectedDriveId: id }),

  drillDownNode: (node) => {
    if (node.type !== 'folder' || !node.children || node.children.length === 0) return;
    
    // Build path breadcrumbs
    const parts = node.path.split('/').filter(Boolean);
    const breadcrumbs: { name: string; path: string }[] = [{ name: '/', path: '/' }];
    let accPath = '';
    for (const part of parts) {
      accPath += `/${part}`;
      breadcrumbs.push({ name: part, path: accPath });
    }

    set({
      currentTreemapNode: node,
      pathBreadcrumbs: breadcrumbs,
    });
  },

  navigateToBreadcrumb: (targetPath) => {
    const { rootTree } = get();

    if (targetPath === '/' || !targetPath) {
      set({
        currentTreemapNode: rootTree,
        pathBreadcrumbs: [{ name: '/', path: '/' }],
      });
      return;
    }

    const findNode = (node: DiskNode, p: string): DiskNode | null => {
      if (node.path === p) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, p);
          if (found) return found;
        }
      }
      return null;
    };

    const targetNode = findNode(rootTree, targetPath);
    if (targetNode) {
      const parts = targetPath.split('/').filter(Boolean);
      const breadcrumbs: { name: string; path: string }[] = [{ name: '/', path: '/' }];
      let accPath = '';
      for (const part of parts) {
        accPath += `/${part}`;
        breadcrumbs.push({ name: part, path: accPath });
      }

      set({
        currentTreemapNode: targetNode,
        pathBreadcrumbs: breadcrumbs,
      });
    }
  },

  setLargeFilesThresholdMB: (mb) => set({ largeFilesThresholdMB: mb }),
  setLargeFilesCategoryFilter: (cat) => set({ largeFilesCategoryFilter: cat }),
  setLargeFilesSortBy: (sort) => set({ largeFilesSortBy: sort }),
  setSelectedFileItem: (file) => set({ selectedFileItem: file }),

  deleteLargeFile: (fileId) => {
    set((state) => {
      const fileToDelete = state.largeFiles.find((f) => f.id === fileId);
      const updated = state.largeFiles.filter((f) => f.id !== fileId);
      const reclaimed = fileToDelete ? fileToDelete.size : 0;
      return {
        largeFiles: updated,
        lastTrashedPaths: fileToDelete ? [fileToDelete.path] : state.lastTrashedPaths,
        diskStats: {
          ...state.diskStats,
          usedBytes: Math.max(0, state.diskStats.usedBytes - reclaimed),
          freeBytes: state.diskStats.freeBytes + reclaimed,
          largeFileBytes: Math.max(0, state.diskStats.largeFileBytes - reclaimed),
          trashBytes: state.diskStats.trashBytes + reclaimed,
        },
      };
    });
  },

  setLastTrashedPaths: (paths) => set({ lastTrashedPaths: paths }),

  refreshDiskData: async () => {
    const drives = await filesystemService.getStorageDrives();
    const stats = await filesystemService.getDiskStats();
    set({ drives, diskStats: stats });
  },
}));
