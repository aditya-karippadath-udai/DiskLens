import { DiskNode, StorageDrive, DiskStats } from '../types/disk';
import { DuplicateGroup, FileItem, FileCategory } from '../types/file';
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

// Storage Drives
export const initialDrives: StorageDrive[] = [
  {
    id: 'drive-main',
    name: 'Root Filesystem',
    mountPoint: '/',
    devicePath: '/dev/nvme0n1p2',
    filesystem: 'ext4',
    totalBytes: 1000 * 1024 * 1024 * 1024, // 1000 GB (~1TB)
    usedBytes: 638 * 1024 * 1024 * 1024,  // 638 GB
    freeBytes: 362 * 1024 * 1024 * 1024,  // 362 GB
    type: 'root',
    isMounted: true,
  },
  {
    id: 'drive-home',
    name: 'Home Directory',
    mountPoint: '/home/aditya',
    devicePath: '/dev/nvme0n1p3',
    filesystem: 'btrfs',
    totalBytes: 512 * 1024 * 1024 * 1024,
    usedBytes: 412 * 1024 * 1024 * 1024,
    freeBytes: 100 * 1024 * 1024 * 1024,
    type: 'internal',
    isMounted: true,
  },
  {
    id: 'drive-samsung-t7',
    name: 'Samsung T7 Touch (External SSD)',
    mountPoint: '/media/aditya/Samsung_T7',
    devicePath: '/dev/sda1',
    filesystem: 'exfat',
    totalBytes: 2000 * 1024 * 1024 * 1024, // 2 TB
    usedBytes: 1240 * 1024 * 1024 * 1024,
    freeBytes: 760 * 1024 * 1024 * 1024,
    type: 'external',
    isMounted: true,
  },
];

export const initialDiskStats: DiskStats = {
  totalBytes: 1000 * 1024 * 1024 * 1024,
  usedBytes: 638 * 1024 * 1024 * 1024,
  freeBytes: 362 * 1024 * 1024 * 1024,
  duplicateBytes: 18.4 * 1024 * 1024 * 1024,
  largeFileBytes: 73.2 * 1024 * 1024 * 1024,
  trashBytes: 4.8 * 1024 * 1024 * 1024,
};

// Hierarchical Linux Filesystem Tree for Treemap
export const initialFilesystemTree: DiskNode = {
  name: '/',
  path: '/',
  size: 638 * 1024 * 1024 * 1024,
  percentage: 100,
  type: 'folder',
  filesCount: 684201,
  children: [
    {
      name: 'home',
      path: '/home',
      size: 412 * 1024 * 1024 * 1024,
      percentage: 64.5,
      type: 'folder',
      filesCount: 412850,
      children: [
        {
          name: 'aditya',
          path: '/home/aditya',
          size: 412 * 1024 * 1024 * 1024,
          percentage: 100,
          type: 'folder',
          filesCount: 412850,
          children: [
            {
              name: 'Videos',
              path: '/home/aditya/Videos',
              size: 114 * 1024 * 1024 * 1024,
              percentage: 27.6,
              type: 'folder',
              category: 'video',
              filesCount: 1420,
              children: [
                {
                  name: 'screencasts',
                  path: '/home/aditya/Videos/screencasts',
                  size: 48 * 1024 * 1024 * 1024,
                  percentage: 42.1,
                  type: 'folder',
                  category: 'video',
                  filesCount: 380,
                  children: [
                    { name: 'rust-kernel-tutorial-ep1-4k.mp4', path: '/home/aditya/Videos/screencasts/rust-kernel-tutorial-ep1-4k.mp4', size: 12.4 * 1024 * 1024 * 1024, percentage: 25.8, type: 'file', category: 'video' },
                    { name: 'wayland-compositor-demo.mkv', path: '/home/aditya/Videos/screencasts/wayland-compositor-demo.mkv', size: 8.7 * 1024 * 1024 * 1024, percentage: 18.1, type: 'file', category: 'video' },
                    { name: 'podcast-recording-session-raw.mp4', path: '/home/aditya/Videos/screencasts/podcast-recording-session-raw.mp4', size: 14.2 * 1024 * 1024 * 1024, percentage: 29.5, type: 'file', category: 'video' },
                    { name: 'obs-backup-stream-2026.mp4', path: '/home/aditya/Videos/screencasts/obs-backup-stream-2026.mp4', size: 12.7 * 1024 * 1024 * 1024, percentage: 26.6, type: 'file', category: 'video' },
                  ]
                },
                {
                  name: 'Movies',
                  path: '/home/aditya/Videos/Movies',
                  size: 42 * 1024 * 1024 * 1024,
                  percentage: 36.8,
                  type: 'folder',
                  category: 'video',
                  filesCount: 18,
                  children: [
                    { name: 'SciFi-Documentary-4K-Remaster.mkv', path: '/home/aditya/Videos/Movies/SciFi-Documentary-4K-Remaster.mkv', size: 18.5 * 1024 * 1024 * 1024, percentage: 44.0, type: 'file', category: 'video' },
                    { name: 'Blender-Open-Movie-Spring.mp4', path: '/home/aditya/Videos/Movies/Blender-Open-Movie-Spring.mp4', size: 9.8 * 1024 * 1024 * 1024, percentage: 23.3, type: 'file', category: 'video' },
                    { name: 'Cosmos-Deep-Space-Series.mkv', path: '/home/aditya/Videos/Movies/Cosmos-Deep-Space-Series.mkv', size: 13.7 * 1024 * 1024 * 1024, percentage: 32.7, type: 'file', category: 'video' },
                  ]
                },
                {
                  name: 'Drone Footage',
                  path: '/home/aditya/Videos/Drone Footage',
                  size: 24 * 1024 * 1024 * 1024,
                  percentage: 21.1,
                  type: 'folder',
                  category: 'video',
                  filesCount: 42
                }
              ]
            },
            {
              name: 'Downloads',
              path: '/home/aditya/Downloads',
              size: 88 * 1024 * 1024 * 1024,
              percentage: 21.3,
              type: 'folder',
              filesCount: 4890,
              children: [
                { name: 'ubuntu-24.04-desktop-amd64.iso', path: '/home/aditya/Downloads/ubuntu-24.04-desktop-amd64.iso', size: 5.8 * 1024 * 1024 * 1024, percentage: 6.6, type: 'file', category: 'iso' },
                { name: 'Fedora-Workstation-Live-x86_64-40.iso', path: '/home/aditya/Downloads/Fedora-Workstation-Live-x86_64-40.iso', size: 4.2 * 1024 * 1024 * 1024, percentage: 4.8, type: 'file', category: 'iso' },
                { name: 'archlinux-2026.03.01-x86_64.iso', path: '/home/aditya/Downloads/archlinux-2026.03.01-x86_64.iso', size: 1.1 * 1024 * 1024 * 1024, percentage: 1.25, type: 'file', category: 'iso' },
                { name: 'UnrealEngine-5.4-Linux-Source.tar.xz', path: '/home/aditya/Downloads/UnrealEngine-5.4-Linux-Source.tar.xz', size: 28.5 * 1024 * 1024 * 1024, percentage: 32.4, type: 'file', category: 'archive' },
                { name: 'android-studio-bundle.tar.gz', path: '/home/aditya/Downloads/android-studio-bundle.tar.gz', size: 1.8 * 1024 * 1024 * 1024, percentage: 2.0, type: 'file', category: 'archive' },
                { name: 'Dataset-Satellite-Geospatial-2026.zip', path: '/home/aditya/Downloads/Dataset-Satellite-Geospatial-2026.zip', size: 16.4 * 1024 * 1024 * 1024, percentage: 18.6, type: 'file', category: 'archive' },
                { name: 'ollama-models-llama3-70b.bin', path: '/home/aditya/Downloads/ollama-models-llama3-70b.bin', size: 30.2 * 1024 * 1024 * 1024, percentage: 34.3, type: 'file', category: 'other' },
              ]
            },
            {
              name: 'Projects',
              path: '/home/aditya/Projects',
              size: 76 * 1024 * 1024 * 1024,
              percentage: 18.4,
              type: 'folder',
              category: 'code',
              filesCount: 284000,
              children: [
                { name: 'linux-kernel-fork', path: '/home/aditya/Projects/linux-kernel-fork', size: 24.5 * 1024 * 1024 * 1024, percentage: 32.2, type: 'folder', category: 'code', filesCount: 94000 },
                { name: 'rust-disk-analyzer', path: '/home/aditya/Projects/rust-disk-analyzer', size: 14.8 * 1024 * 1024 * 1024, percentage: 19.5, type: 'folder', category: 'code', filesCount: 52000 },
                { name: 'tauri-desktop-clients', path: '/home/aditya/Projects/tauri-desktop-clients', size: 18.2 * 1024 * 1024 * 1024, percentage: 23.9, type: 'folder', category: 'code', filesCount: 68000 },
                { name: 'ml-vision-embeddings', path: '/home/aditya/Projects/ml-vision-embeddings', size: 18.5 * 1024 * 1024 * 1024, percentage: 24.4, type: 'folder', category: 'code', filesCount: 70000 },
              ]
            },
            {
              name: '.cache',
              path: '/home/aditya/.cache',
              size: 54 * 1024 * 1024 * 1024,
              percentage: 13.1,
              type: 'folder',
              filesCount: 82000,
              children: [
                { name: 'yarn', path: '/home/aditya/.cache/yarn', size: 12.4 * 1024 * 1024 * 1024, percentage: 23.0, type: 'folder', filesCount: 24000 },
                { name: 'cargo-target-cache', path: '/home/aditya/.cache/cargo-target-cache', size: 22.1 * 1024 * 1024 * 1024, percentage: 41.0, type: 'folder', filesCount: 38000 },
                { name: 'google-chrome', path: '/home/aditya/.cache/google-chrome', size: 8.6 * 1024 * 1024 * 1024, percentage: 15.9, type: 'folder', filesCount: 9400 },
                { name: 'thumbnails', path: '/home/aditya/.cache/thumbnails', size: 4.2 * 1024 * 1024 * 1024, percentage: 7.8, type: 'folder', filesCount: 6200 },
                { name: 'mesa_shader_cache', path: '/home/aditya/.cache/mesa_shader_cache', size: 6.7 * 1024 * 1024 * 1024, percentage: 12.3, type: 'folder', filesCount: 4400 },
              ]
            },
            {
              name: 'Pictures',
              path: '/home/aditya/Pictures',
              size: 38 * 1024 * 1024 * 1024,
              percentage: 9.2,
              type: 'folder',
              category: 'image',
              filesCount: 19400,
              children: [
                { name: 'Raw-Camera-Imports-2026', path: '/home/aditya/Pictures/Raw-Camera-Imports-2026', size: 28.2 * 1024 * 1024 * 1024, percentage: 74.2, type: 'folder', category: 'image', filesCount: 4200 },
                { name: 'Wallpapers-4K-Nordic', path: '/home/aditya/Pictures/Wallpapers-4K-Nordic', size: 5.4 * 1024 * 1024 * 1024, percentage: 14.2, type: 'folder', category: 'image', filesCount: 680 },
                { name: 'Screenshots', path: '/home/aditya/Pictures/Screenshots', size: 4.4 * 1024 * 1024 * 1024, percentage: 11.6, type: 'folder', category: 'image', filesCount: 14520 },
              ]
            },
            {
              name: 'Documents',
              path: '/home/aditya/Documents',
              size: 26 * 1024 * 1024 * 1024,
              percentage: 6.3,
              type: 'folder',
              category: 'document',
              filesCount: 12400,
              children: [
                { name: 'Research Papers & Ebooks', path: '/home/aditya/Documents/Research Papers & Ebooks', size: 14.5 * 1024 * 1024 * 1024, percentage: 55.8, type: 'folder', category: 'document', filesCount: 1400 },
                { name: 'Work Backups', path: '/home/aditya/Documents/Work Backups', size: 9.2 * 1024 * 1024 * 1024, percentage: 35.4, type: 'folder', category: 'document', filesCount: 480 },
                { name: 'Tax & Receipts', path: '/home/aditya/Documents/Tax & Receipts', size: 2.3 * 1024 * 1024 * 1024, percentage: 8.8, type: 'folder', category: 'document', filesCount: 10520 },
              ]
            },
            {
              name: 'Music',
              path: '/home/aditya/Music',
              size: 16 * 1024 * 1024 * 1024,
              percentage: 3.9,
              type: 'folder',
              category: 'audio',
              filesCount: 8800,
              children: [
                { name: 'FLAC Lossless Library', path: '/home/aditya/Music/FLAC Lossless Library', size: 12.8 * 1024 * 1024 * 1024, percentage: 80.0, type: 'folder', category: 'audio', filesCount: 620 },
                { name: 'Podcasts Archive', path: '/home/aditya/Music/Podcasts Archive', size: 3.2 * 1024 * 1024 * 1024, percentage: 20.0, type: 'folder', category: 'audio', filesCount: 8180 },
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'usr',
      path: '/usr',
      size: 96 * 1024 * 1024 * 1024,
      percentage: 15.0,
      type: 'folder',
      filesCount: 142000,
      children: [
        { name: 'lib', path: '/usr/lib', size: 48 * 1024 * 1024 * 1024, percentage: 50.0, type: 'folder', filesCount: 62000 },
        { name: 'share', path: '/usr/share', size: 28 * 1024 * 1024 * 1024, percentage: 29.2, type: 'folder', filesCount: 54000 },
        { name: 'bin', path: '/usr/bin', size: 14 * 1024 * 1024 * 1024, percentage: 14.6, type: 'folder', filesCount: 4200 },
        { name: 'local', path: '/usr/local', size: 6 * 1024 * 1024 * 1024, percentage: 6.2, type: 'folder', filesCount: 21800 },
      ]
    },
    {
      name: 'var',
      path: '/var',
      size: 58 * 1024 * 1024 * 1024,
      percentage: 9.1,
      type: 'folder',
      filesCount: 64000,
      children: [
        { name: 'lib', path: '/var/lib', size: 36 * 1024 * 1024 * 1024, percentage: 62.1, type: 'folder', filesCount: 42000 },
        { name: 'log', path: '/var/log', size: 12 * 1024 * 1024 * 1024, percentage: 20.7, type: 'folder', filesCount: 8400 },
        { name: 'cache', path: '/var/cache', size: 8 * 1024 * 1024 * 1024, percentage: 13.8, type: 'folder', filesCount: 11200 },
        { name: 'tmp', path: '/var/tmp', size: 2 * 1024 * 1024 * 1024, percentage: 3.4, type: 'folder', filesCount: 2400 },
      ]
    },
    {
      name: 'opt',
      path: '/opt',
      size: 31 * 1024 * 1024 * 1024,
      percentage: 4.9,
      type: 'folder',
      filesCount: 28000,
      children: [
        { name: 'google-chrome', path: '/opt/google-chrome', size: 6.2 * 1024 * 1024 * 1024, percentage: 20.0, type: 'folder', filesCount: 4200 },
        { name: 'docker', path: '/opt/docker', size: 14.8 * 1024 * 1024 * 1024, percentage: 47.7, type: 'folder', filesCount: 16000 },
        { name: 'jetbrains', path: '/opt/jetbrains', size: 8.4 * 1024 * 1024 * 1024, percentage: 27.1, type: 'folder', filesCount: 6800 },
        { name: 'containerd', path: '/opt/containerd', size: 1.6 * 1024 * 1024 * 1024, percentage: 5.2, type: 'folder', filesCount: 1000 },
      ]
    },
    {
      name: 'other',
      path: '/other',
      size: 41 * 1024 * 1024 * 1024,
      percentage: 6.5,
      type: 'folder',
      filesCount: 37351,
      children: [
        { name: 'etc', path: '/etc', size: 1.2 * 1024 * 1024 * 1024, percentage: 2.9, type: 'folder', filesCount: 8200 },
        { name: 'boot', path: '/boot', size: 1.8 * 1024 * 1024 * 1024, percentage: 4.4, type: 'folder', filesCount: 120 },
        { name: 'root', path: '/root', size: 18.2 * 1024 * 1024 * 1024, percentage: 44.4, type: 'folder', filesCount: 14200 },
        { name: 'tmp', path: '/tmp', size: 19.8 * 1024 * 1024 * 1024, percentage: 48.3, type: 'folder', filesCount: 14831 },
      ]
    }
  ]
};

// Initial Realistic Duplicate Groups
export const initialDuplicateGroups: DuplicateGroup[] = [
  {
    id: 'dup-grp-1',
    hash: 'a9c78f142b9981e5df4690ea38f72a450c4871e8bf53267d3e918c5e065582f1',
    category: 'video',
    totalSize: 7.2 * 1024 * 1024 * 1024, // 3 copies of 2.4 GB
    recoverableSize: 4.8 * 1024 * 1024 * 1024, // 2 copies = 4.8 GB
    originalFileId: 'dup-1-1',
    files: [
      {
        id: 'dup-1-1',
        name: 'movie.mp4',
        path: '/home/aditya/Videos/movie.mp4',
        size: 2.4 * 1024 * 1024 * 1024,
        type: 'mp4',
        category: 'video',
        modifiedAt: '2026-06-12T14:22:00Z',
        createdAt: '2026-06-12T14:20:00Z',
        hash: 'a9c78f142b9981e5df4690ea38f72a450c4871e8bf53267d3e918c5e065582f1',
        permissions: '-rw-r--r--',
        mimeType: 'video/mp4',
        isOriginal: true,
        isSelected: false,
      },
      {
        id: 'dup-1-2',
        name: 'movie.mp4',
        path: '/home/aditya/Downloads/movie.mp4',
        size: 2.4 * 1024 * 1024 * 1024,
        type: 'mp4',
        category: 'video',
        modifiedAt: '2026-07-01T09:15:00Z',
        createdAt: '2026-07-01T09:15:00Z',
        hash: 'a9c78f142b9981e5df4690ea38f72a450c4871e8bf53267d3e918c5e065582f1',
        permissions: '-rw-r--r--',
        mimeType: 'video/mp4',
        isOriginal: false,
        isSelected: true,
      },
      {
        id: 'dup-1-3',
        name: 'movie.mp4',
        path: '/mnt/storage/backup/movie.mp4',
        size: 2.4 * 1024 * 1024 * 1024,
        type: 'mp4',
        category: 'video',
        modifiedAt: '2026-07-10T19:40:00Z',
        createdAt: '2026-07-10T19:40:00Z',
        hash: 'a9c78f142b9981e5df4690ea38f72a450c4871e8bf53267d3e918c5e065582f1',
        permissions: '-rw-r--r--',
        mimeType: 'video/mp4',
        isOriginal: false,
        isSelected: true,
      },
    ],
  },
  {
    id: 'dup-grp-2',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    category: 'iso',
    totalSize: 11.6 * 1024 * 1024 * 1024, // 2 copies of 5.8 GB
    recoverableSize: 5.8 * 1024 * 1024 * 1024,
    originalFileId: 'dup-2-1',
    files: [
      {
        id: 'dup-2-1',
        name: 'Ubuntu-24.04-desktop-amd64.iso',
        path: '/home/aditya/ISOs/Ubuntu-24.04-desktop-amd64.iso',
        size: 5.8 * 1024 * 1024 * 1024,
        type: 'iso',
        category: 'iso',
        modifiedAt: '2026-05-18T11:00:00Z',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        permissions: '-rwxr-xr-x',
        mimeType: 'application/x-iso9660-image',
        isOriginal: true,
        isSelected: false,
      },
      {
        id: 'dup-2-2',
        name: 'Ubuntu-24.04-desktop-amd64 (1).iso',
        path: '/home/aditya/Downloads/Ubuntu-24.04-desktop-amd64 (1).iso',
        size: 5.8 * 1024 * 1024 * 1024,
        type: 'iso',
        category: 'iso',
        modifiedAt: '2026-06-04T18:22:00Z',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        permissions: '-rw-r--r--',
        mimeType: 'application/x-iso9660-image',
        isOriginal: false,
        isSelected: true,
      },
    ],
  },
  {
    id: 'dup-grp-3',
    hash: '7d35b18f08f88c6b2df48e895111979b002ebc8397a7a5a87b8d4f40f0c058a9',
    category: 'archive',
    totalSize: 6.4 * 1024 * 1024 * 1024, // 2 copies of 3.2 GB
    recoverableSize: 3.2 * 1024 * 1024 * 1024,
    originalFileId: 'dup-3-1',
    files: [
      {
        id: 'dup-3-1',
        name: 'node_modules_heavy_backup.tar.gz',
        path: '/home/aditya/Projects/archive/node_modules_heavy_backup.tar.gz',
        size: 3.2 * 1024 * 1024 * 1024,
        type: 'tar.gz',
        category: 'archive',
        modifiedAt: '2026-04-10T16:04:00Z',
        hash: '7d35b18f08f88c6b2df48e895111979b002ebc8397a7a5a87b8d4f40f0c058a9',
        permissions: '-rw-r--r--',
        mimeType: 'application/gzip',
        isOriginal: true,
        isSelected: false,
      },
      {
        id: 'dup-3-2',
        name: 'node_modules_heavy_backup.tar.gz',
        path: '/home/aditya/Downloads/node_modules_heavy_backup.tar.gz',
        size: 3.2 * 1024 * 1024 * 1024,
        type: 'tar.gz',
        category: 'archive',
        modifiedAt: '2026-05-02T12:30:00Z',
        hash: '7d35b18f08f88c6b2df48e895111979b002ebc8397a7a5a87b8d4f40f0c058a9',
        permissions: '-rw-r--r--',
        mimeType: 'application/gzip',
        isOriginal: false,
        isSelected: true,
      },
    ],
  },
  {
    id: 'dup-grp-4',
    hash: '5f4dcc3b5aa765d61d8327deb882cf992b9699aaf18b760a5e8f4c2c589b2184',
    category: 'image',
    totalSize: 4.2 * 1024 * 1024 * 1024, // 3 copies of 1.4 GB
    recoverableSize: 2.8 * 1024 * 1024 * 1024,
    originalFileId: 'dup-4-1',
    files: [
      {
        id: 'dup-4-1',
        name: 'Iceland_Landscape_Panorama_8K.raw',
        path: '/home/aditya/Pictures/Raw-Camera-Imports-2026/Iceland_Landscape_Panorama_8K.raw',
        size: 1.4 * 1024 * 1024 * 1024,
        type: 'raw',
        category: 'image',
        modifiedAt: '2026-07-15T08:12:00Z',
        hash: '5f4dcc3b5aa765d61d8327deb882cf992b9699aaf18b760a5e8f4c2c589b2184',
        permissions: '-rw-r--r--',
        mimeType: 'image/x-panasonic-raw',
        isOriginal: true,
        isSelected: false,
      },
      {
        id: 'dup-4-2',
        name: 'Iceland_Landscape_Panorama_8K.raw',
        path: '/home/aditya/Documents/Design Assets/Iceland_Landscape_Panorama_8K.raw',
        size: 1.4 * 1024 * 1024 * 1024,
        type: 'raw',
        category: 'image',
        modifiedAt: '2026-07-22T14:45:00Z',
        hash: '5f4dcc3b5aa765d61d8327deb882cf992b9699aaf18b760a5e8f4c2c589b2184',
        permissions: '-rw-r--r--',
        mimeType: 'image/x-panasonic-raw',
        isOriginal: false,
        isSelected: true,
      },
      {
        id: 'dup-4-3',
        name: 'Iceland_Landscape_Panorama_8K_copy.raw',
        path: '/home/aditya/Desktop/Iceland_Landscape_Panorama_8K_copy.raw',
        size: 1.4 * 1024 * 1024 * 1024,
        type: 'raw',
        category: 'image',
        modifiedAt: '2026-07-25T11:00:00Z',
        hash: '5f4dcc3b5aa765d61d8327deb882cf992b9699aaf18b760a5e8f4c2c589b2184',
        permissions: '-rw-r--r--',
        mimeType: 'image/x-panasonic-raw',
        isOriginal: false,
        isSelected: true,
      },
    ],
  },
  {
    id: 'dup-grp-5',
    hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    category: 'document',
    totalSize: 2.8 * 1024 * 1024 * 1024, // 2 copies of 1.4 GB
    recoverableSize: 1.4 * 1024 * 1024 * 1024,
    originalFileId: 'dup-5-1',
    files: [
      {
        id: 'dup-5-1',
        name: 'Machine-Learning-Compendium-2026.pdf',
        path: '/home/aditya/Documents/Research Papers & Ebooks/Machine-Learning-Compendium-2026.pdf',
        size: 1.4 * 1024 * 1024 * 1024,
        type: 'pdf',
        category: 'document',
        modifiedAt: '2026-05-10T10:14:00Z',
        hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        permissions: '-rw-r--r--',
        mimeType: 'application/pdf',
        isOriginal: true,
        isSelected: false,
      },
      {
        id: 'dup-5-2',
        name: 'Machine-Learning-Compendium-2026 (Copy).pdf',
        path: '/home/aditya/Downloads/Machine-Learning-Compendium-2026 (Copy).pdf',
        size: 1.4 * 1024 * 1024 * 1024,
        type: 'pdf',
        category: 'document',
        modifiedAt: '2026-06-15T16:32:00Z',
        hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        permissions: '-rw-r--r--',
        mimeType: 'application/pdf',
        isOriginal: false,
        isSelected: true,
      },
    ],
  },
  {
    id: 'dup-grp-6',
    hash: '3d8a4f938b813fbfb534e62243d67b7e3f89e472659345758368547285a81e9f',
    category: 'audio',
    totalSize: 1.6 * 1024 * 1024 * 1024,
    recoverableSize: 800 * 1024 * 1024,
    originalFileId: 'dup-6-1',
    files: [
      {
        id: 'dup-6-1',
        name: 'Orchestral-Symphony-No9-24bit-192khz.flac',
        path: '/home/aditya/Music/FLAC Lossless Library/Orchestral-Symphony-No9-24bit-192khz.flac',
        size: 800 * 1024 * 1024,
        type: 'flac',
        category: 'audio',
        modifiedAt: '2026-03-20T19:00:00Z',
        hash: '3d8a4f938b813fbfb534e62243d67b7e3f89e472659345758368547285a81e9f',
        permissions: '-rw-r--r--',
        mimeType: 'audio/flac',
        isOriginal: true,
        isSelected: false,
      },
      {
        id: 'dup-6-2',
        name: 'Orchestral-Symphony-No9-24bit-192khz.flac',
        path: '/home/aditya/Downloads/Music/Orchestral-Symphony-No9-24bit-192khz.flac',
        size: 800 * 1024 * 1024,
        type: 'flac',
        category: 'audio',
        modifiedAt: '2026-04-12T11:45:00Z',
        hash: '3d8a4f938b813fbfb534e62243d67b7e3f89e472659345758368547285a81e9f',
        permissions: '-rw-r--r--',
        mimeType: 'audio/flac',
        isOriginal: false,
        isSelected: true,
      },
    ],
  },
];

// Large Files Demo Data
export const initialLargeFiles: FileItem[] = [
  {
    id: 'lf-1',
    name: 'ollama-models-llama3-70b.bin',
    path: '/home/aditya/Downloads/ollama-models-llama3-70b.bin',
    size: 30.2 * 1024 * 1024 * 1024,
    type: 'bin',
    category: 'other',
    modifiedAt: '2026-08-02T17:15:00Z',
    hash: 'fa2094c1e40283d6a4597d3328bb7c89f5466408285514f77a8dc7b94121087e',
    permissions: '-rw-r--r--',
    mimeType: 'application/octet-stream',
  },
  {
    id: 'lf-2',
    name: 'UnrealEngine-5.4-Linux-Source.tar.xz',
    path: '/home/aditya/Downloads/UnrealEngine-5.4-Linux-Source.tar.xz',
    size: 28.5 * 1024 * 1024 * 1024,
    type: 'tar.xz',
    category: 'archive',
    modifiedAt: '2026-07-28T09:40:00Z',
    hash: 'bb59a38f71295b9c054f0a0d9e7ec1e57c66cb1e8f2375a06d8591ef5220c812',
    permissions: '-rw-r--r--',
    mimeType: 'application/x-xz',
  },
  {
    id: 'lf-3',
    name: 'SciFi-Documentary-4K-Remaster.mkv',
    path: '/home/aditya/Videos/Movies/SciFi-Documentary-4K-Remaster.mkv',
    size: 18.5 * 1024 * 1024 * 1024,
    type: 'mkv',
    category: 'video',
    modifiedAt: '2026-08-11T20:10:00Z',
    hash: '96b1b22e7d3c0a5991823700b01c383e74b3f88f2923769c0d456740b6158223',
    permissions: '-rw-r--r--',
    mimeType: 'video/x-matroska',
  },
  {
    id: 'lf-4',
    name: 'Dataset-Satellite-Geospatial-2026.zip',
    path: '/home/aditya/Downloads/Dataset-Satellite-Geospatial-2026.zip',
    size: 16.4 * 1024 * 1024 * 1024,
    type: 'zip',
    category: 'archive',
    modifiedAt: '2026-06-30T13:20:00Z',
    hash: '2c5a08945d8209863a948e77a28e3bcf856b3e9447477c7d4e3391789c09c951',
    permissions: '-rw-r--r--',
    mimeType: 'application/zip',
  },
  {
    id: 'lf-5',
    name: 'podcast-recording-session-raw.mp4',
    path: '/home/aditya/Videos/screencasts/podcast-recording-session-raw.mp4',
    size: 14.2 * 1024 * 1024 * 1024,
    type: 'mp4',
    category: 'video',
    modifiedAt: '2026-08-15T15:45:00Z',
    hash: '6d84a7e9301b38f88c6792374e5087114df630718c6422896f6c7704128509ef',
    permissions: '-rw-r--r--',
    mimeType: 'video/mp4',
  },
  {
    id: 'lf-6',
    name: 'Cosmos-Deep-Space-Series.mkv',
    path: '/home/aditya/Videos/Movies/Cosmos-Deep-Space-Series.mkv',
    size: 13.7 * 1024 * 1024 * 1024,
    type: 'mkv',
    category: 'video',
    modifiedAt: '2026-07-19T22:30:00Z',
    hash: 'f0c058a98c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2a',
    permissions: '-rw-r--r--',
    mimeType: 'video/x-matroska',
  },
  {
    id: 'lf-7',
    name: 'obs-backup-stream-2026.mp4',
    path: '/home/aditya/Videos/screencasts/obs-backup-stream-2026.mp4',
    size: 12.7 * 1024 * 1024 * 1024,
    type: 'mp4',
    category: 'video',
    modifiedAt: '2026-08-05T18:00:00Z',
    hash: '1a7e9301b38f88c6792374e5087114df630718c6422896f6c7704128509ef6d8',
    permissions: '-rw-r--r--',
    mimeType: 'video/mp4',
  },
  {
    id: 'lf-8',
    name: 'rust-kernel-tutorial-ep1-4k.mp4',
    path: '/home/aditya/Videos/screencasts/rust-kernel-tutorial-ep1-4k.mp4',
    size: 12.4 * 1024 * 1024 * 1024,
    type: 'mp4',
    category: 'video',
    modifiedAt: '2026-08-01T12:00:00Z',
    hash: '4128509ef6d84a7e9301b38f88c6792374e5087114df630718c6422896f6c770',
    permissions: '-rw-r--r--',
    mimeType: 'video/mp4',
  },
  {
    id: 'lf-9',
    name: 'Ubuntu-24.04-desktop-amd64.iso',
    path: '/home/aditya/Downloads/ubuntu-24.04-desktop-amd64.iso',
    size: 5.8 * 1024 * 1024 * 1024,
    type: 'iso',
    category: 'iso',
    modifiedAt: '2026-05-18T11:00:00Z',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    permissions: '-rw-r--r--',
    mimeType: 'application/x-iso9660-image',
  },
  {
    id: 'lf-10',
    name: 'Fedora-Workstation-Live-x86_64-40.iso',
    path: '/home/aditya/Downloads/Fedora-Workstation-Live-x86_64-40.iso',
    size: 4.2 * 1024 * 1024 * 1024,
    type: 'iso',
    category: 'iso',
    modifiedAt: '2026-05-22T09:12:00Z',
    hash: '8f2375a06d8591ef5220c812bb59a38f71295b9c054f0a0d9e7ec1e57c66cb1e',
    permissions: '-rw-r--r--',
    mimeType: 'application/x-iso9660-image',
  },
  {
    id: 'lf-11',
    name: 'node_modules_heavy_backup.tar.gz',
    path: '/home/aditya/Downloads/node_modules_heavy_backup.tar.gz',
    size: 3.2 * 1024 * 1024 * 1024,
    type: 'tar.gz',
    category: 'archive',
    modifiedAt: '2026-05-02T12:30:00Z',
    hash: '7d35b18f08f88c6b2df48e895111979b002ebc8397a7a5a87b8d4f40f0c058a9',
    permissions: '-rw-r--r--',
    mimeType: 'application/gzip',
  },
  {
    id: 'lf-12',
    name: 'linux-source-tree-archive.tar.zst',
    path: '/home/aditya/Projects/archive/linux-source-tree-archive.tar.zst',
    size: 2.9 * 1024 * 1024 * 1024,
    type: 'tar.zst',
    category: 'archive',
    modifiedAt: '2026-07-04T16:50:00Z',
    hash: '58368547285a81e9f3d8a4f938b813fbfb534e62243d67b7e3f89e4726593457',
    permissions: '-rw-r--r--',
    mimeType: 'application/zstd',
  },
];

// Scan History Records
export const initialScanHistory: ScanHistoryItem[] = [
  {
    id: 'hist-1',
    name: 'Home Directory Scan',
    path: '/home/aditya',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    durationSeconds: 142,
    filesScanned: 412850,
    bytesScanned: 412 * 1024 * 1024 * 1024,
    duplicateGroupsCount: 42,
    recoverableBytes: 18.4 * 1024 * 1024 * 1024,
    status: 'completed',
  },
  {
    id: 'hist-2',
    name: 'External SSD Deep Scan',
    path: '/media/aditya/Samsung_T7',
    timestamp: Date.now() - 1000 * 60 * 60 * 26, // yesterday
    durationSeconds: 388,
    filesScanned: 894120,
    bytesScanned: 1240 * 1024 * 1024 * 1024,
    duplicateGroupsCount: 86,
    recoverableBytes: 42.7 * 1024 * 1024 * 1024,
    status: 'completed',
  },
  {
    id: 'hist-3',
    name: 'Downloads & Temp Folders',
    path: '/home/aditya/Downloads',
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    durationSeconds: 48,
    filesScanned: 4890,
    bytesScanned: 88 * 1024 * 1024 * 1024,
    duplicateGroupsCount: 14,
    recoverableBytes: 8.9 * 1024 * 1024 * 1024,
    status: 'completed',
  },
  {
    id: 'hist-4',
    name: 'Root Filesystem System Scan',
    path: '/',
    timestamp: Date.now() - 1000 * 60 * 60 * 120, // 5 days ago
    durationSeconds: 512,
    filesScanned: 684201,
    bytesScanned: 638 * 1024 * 1024 * 1024,
    duplicateGroupsCount: 58,
    recoverableBytes: 24.1 * 1024 * 1024 * 1024,
    status: 'completed',
  },
];
