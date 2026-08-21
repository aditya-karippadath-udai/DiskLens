import { StorageDrive, DiskNode, DiskStats } from '../types/disk';
import { FileItem, FileCategory } from '../types/file';
import {
  initialDrives,
  initialFilesystemTree,
  initialLargeFiles,
  initialDiskStats,
} from '../data/mockData';

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  reclaimedBytes: number;
  paths: string[];
  isTrash: boolean;
  error?: string;
}

/**
 * Filesystem Service
 * 
 * Provides an abstraction layer for interacting with the underlying Linux filesystem.
 * In production with Tauri/Rust, each method connects via `invoke('cmd_name', { ... })`.
 */
export const filesystemService = {
  /**
   * Retrieves list of mounted storage devices and filesystems
   * TODO (Tauri Backend): invoke('get_storage_drives')
   */
  async getStorageDrives(): Promise<StorageDrive[]> {
    await new Promise((res) => setTimeout(res, 80));
    return [...initialDrives];
  },

  /**
   * Retrieves hierarchical disk usage tree for treemap visualization
   * TODO (Tauri Backend): invoke('get_disk_tree', { path })
   */
  async getDiskTree(targetPath: string = '/'): Promise<DiskNode> {
    await new Promise((res) => setTimeout(res, 120));
    if (targetPath === '/' || !targetPath) {
      return JSON.parse(JSON.stringify(initialFilesystemTree));
    }
    // Return node for specific path if drilling down
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
    const found = findNode(initialFilesystemTree, targetPath);
    return found ? JSON.parse(JSON.stringify(found)) : JSON.parse(JSON.stringify(initialFilesystemTree));
  },

  /**
   * Retrieves overall disk statistics
   * TODO (Tauri Backend): invoke('get_disk_stats')
   */
  async getDiskStats(): Promise<DiskStats> {
    await new Promise((res) => setTimeout(res, 60));
    return { ...initialDiskStats };
  },

  /**
   * Queries large files with size threshold and category filters
   * TODO (Tauri Backend): invoke('get_large_files', { min_bytes: thresholdBytes, category })
   */
  async getLargeFiles(thresholdBytes: number = 100 * 1024 * 1024, category?: FileCategory | 'all'): Promise<FileItem[]> {
    await new Promise((res) => setTimeout(res, 100));
    let files = initialLargeFiles.filter((f) => f.size >= thresholdBytes);
    if (category && category !== 'all') {
      files = files.filter((f) => f.category === category);
    }
    return [...files];
  },

  /**
   * Reveals a file or directory in the native Linux file manager (e.g. Nautilus, Dolphin, Thunar)
   * TODO (Tauri Backend): invoke('reveal_in_file_manager', { path })
   */
  async revealFile(path: string): Promise<{ success: boolean; message: string }> {
    console.log(`[Tauri Native Hook] Opening native file manager highlighting: ${path}`);
    await new Promise((res) => setTimeout(res, 150));
    return { success: true, message: `Revealed ${path} in system file manager` };
  },

  /**
   * Opens the file with default desktop handler (xdg-open)
   * TODO (Tauri Backend): invoke('open_file_default', { path })
   */
  async openFile(path: string): Promise<{ success: boolean; message: string }> {
    console.log(`[Tauri Native Hook] xdg-open: ${path}`);
    await new Promise((res) => setTimeout(res, 150));
    return { success: true, message: `Opened ${path}` };
  },

  /**
   * Fetches detailed file attributes, SHA-256 hash, and inode info
   * TODO (Tauri Backend): invoke('get_file_stat', { path })
   */
  async getFileDetails(path: string): Promise<FileItem | null> {
    await new Promise((res) => setTimeout(res, 80));
    const allKnown = [...initialLargeFiles];
    const match = allKnown.find((f) => f.path === path);
    if (match) return { ...match };
    
    // Fallback constructed file info
    const fileName = path.split('/').pop() || 'unknown';
    return {
      id: `file-${Date.now()}`,
      name: fileName,
      path,
      size: 2.4 * 1024 * 1024 * 1024,
      type: fileName.split('.').pop() || 'bin',
      category: 'video',
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      hash: 'a9c78f142b9981e5df4690ea38f72a450c4871e8bf53267d3e918c5e065582f1',
      permissions: '-rw-r--r--',
      mimeType: 'application/octet-stream',
    };
  },

  /**
   * Deletes files by either moving them to ~/.local/share/Trash or permanently unlinking them
   * TODO (Tauri Backend): invoke('delete_files', { paths, permanent })
   */
  async deleteFiles(paths: string[], permanent: boolean = false, totalBytes: number = 0): Promise<DeleteResult> {
    console.log(`[Tauri Native Hook] Delete request for ${paths.length} items. Permanent: ${permanent}`);
    await new Promise((res) => setTimeout(res, 350));
    return {
      success: true,
      deletedCount: paths.length,
      reclaimedBytes: totalBytes || paths.length * (1.2 * 1024 * 1024 * 1024),
      paths,
      isTrash: !permanent,
    };
  },

  /**
   * Restores items from Trash back to their original path
   * TODO (Tauri Backend): invoke('restore_trash', { paths })
   */
  async restoreTrash(paths: string[]): Promise<boolean> {
    console.log(`[Tauri Native Hook] Restoring from trash:`, paths);
    await new Promise((res) => setTimeout(res, 250));
    return true;
  }
};
