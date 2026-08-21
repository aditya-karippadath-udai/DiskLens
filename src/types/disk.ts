import { FileCategory } from './file';

export interface DiskNode {
  name: string;
  path: string;
  size: number;
  percentage: number;
  type: 'folder' | 'file';
  category?: FileCategory;
  filesCount?: number;
  children?: DiskNode[];
  modifiedAt?: string;
}

export interface StorageDrive {
  id: string;
  name: string;
  mountPoint: string;
  devicePath: string; // e.g. "/dev/nvme0n1p2"
  filesystem: string; // e.g. "ext4", "btrfs", "zfs", "vfat"
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  type: 'internal' | 'external' | 'root';
  isMounted: boolean;
}

export interface DiskStats {
  usedBytes: number;
  freeBytes: number;
  totalBytes: number;
  duplicateBytes: number;
  largeFileBytes: number;
  trashBytes: number;
}
