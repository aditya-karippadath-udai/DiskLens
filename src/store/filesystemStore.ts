import { create } from 'zustand';
import { StorageDrive, DiskNode, DiskStats } from '../types/disk';
import { FileItem, FileCategory } from '../types/file';
import { filesystemService } from '../services/filesystemService';
import { BrowserScanResult } from '../services/browserScanner';

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
  isLoading: boolean;

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
  loadBrowserScanResult: (result: BrowserScanResult) => void;
}

const DEFAULT_ROOT_TREE: DiskNode = {
  name: 'System Workspace',
  path: '/',
  size: 0,
  percentage: 100,
  type: 'folder',
  filesCount: 0,
  children: [],
};

const DEFAULT_DISK_STATS: DiskStats = {
  totalBytes: 500 * 1024 * 1024 * 1024,
  usedBytes: 150 * 1024 * 1024 * 1024,
  freeBytes: 350 * 1024 * 1024 * 1024,
  duplicateBytes: 0,
  largeFileBytes: 0,
  trashBytes: 0,
};

export const useFilesystemStore = create<FilesystemState>((set, get) => ({
  drives: [
    {
      id: 'drive-main',
      name: 'System Root',
      mountPoint: '/',
      devicePath: '/dev/root',
      filesystem: 'ext4',
      totalBytes: 500 * 1024 * 1024 * 1024,
      usedBytes: 150 * 1024 * 1024 * 1024,
      freeBytes: 350 * 1024 * 1024 * 1024,
      type: 'root',
      isMounted: true,
    },
  ],
  selectedDriveId: 'drive-main',
  diskStats: DEFAULT_DISK_STATS,
  rootTree: DEFAULT_ROOT_TREE,
  currentTreemapNode: DEFAULT_ROOT_TREE,
  pathBreadcrumbs: [{ name: '/', path: '/' }],
  largeFiles: [],
  largeFilesThresholdMB: 10,
  largeFilesCategoryFilter: 'all',
  largeFilesSortBy: 'size_desc',
  selectedFileItem: null,
  lastTrashedPaths: [],
  isLoading: false,

  setSelectedDriveId: (id) => {
    set({ selectedDriveId: id });
    const { drives } = get();
    const drive = drives.find(d => d.id === id);
    if (drive) {
      get().refreshDiskData();
    }
  },

  drillDownNode: (node) => {
    if (node.type !== 'folder' || !node.children || node.children.length === 0) return;

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
    set({ isLoading: true });
    try {
      const [drives, stats, tree, largeFiles] = await Promise.all([
        filesystemService.getStorageDrives(),
        filesystemService.getDiskStats(),
        filesystemService.getDiskTree(),
        filesystemService.getLargeFiles(1024 * 1024),
      ]);

      const selectedId = drives[0]?.id || 'drive-main';

      set({
        drives,
        selectedDriveId: selectedId,
        diskStats: stats,
        rootTree: tree,
        currentTreemapNode: tree,
        pathBreadcrumbs: [{ name: '/', path: '/' }],
        largeFiles,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadBrowserScanResult: (result: BrowserScanResult) => {
    const total = result.totalBytes || 100 * 1024 * 1024;
    set({
      rootTree: result.tree,
      currentTreemapNode: result.tree,
      pathBreadcrumbs: [{ name: result.tree.name, path: result.tree.path }],
      largeFiles: result.largeFiles,
      diskStats: {
        totalBytes: total * 1.5,
        usedBytes: total,
        freeBytes: total * 0.5,
        duplicateBytes: result.duplicates.reduce((acc, g) => acc + g.recoverableSize, 0),
        largeFileBytes: result.largeFiles.reduce((acc, f) => acc + f.size, 0),
        trashBytes: 0,
      },
    });
  },
}));
