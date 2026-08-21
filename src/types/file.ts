export type FileCategory =
  | 'video'
  | 'audio'
  | 'image'
  | 'archive'
  | 'document'
  | 'application'
  | 'iso'
  | 'code'
  | 'other';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number; // in bytes
  type: string; // extension e.g. "mp4", "iso", "zip"
  category: FileCategory;
  modifiedAt: string;
  createdAt?: string;
  hash: string;
  permissions?: string; // e.g. "-rw-r--r--"
  mimeType?: string;
  isSelected?: boolean;
  isOriginal?: boolean;
  accessedAt?: string;
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  category: FileCategory;
  files: FileItem[];
  totalSize: number;
  recoverableSize: number;
  originalFileId: string;
}
