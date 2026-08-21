import React from 'react';
import { Modal } from '../common/Modal';
import { FileItem } from '../../types/file';
import { CategoryBadge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  FileText,
  FolderOpen,
  Calendar,
  HardDrive,
  Key,
  Shield,
  Clock,
  ExternalLink,
  Trash2,
  Lock,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../data/mockData';
import { filesystemService } from '../../services/filesystemService';
import { useAppStore } from '../../store/appStore';

interface FileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onDeleteClick?: (file: FileItem) => void;
}

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  isOpen,
  onClose,
  file,
  onDeleteClick,
}) => {
  const { addToast } = useAppStore();

  if (!file) return null;

  const handleReveal = async () => {
    await filesystemService.revealFile(file.path);
    addToast({
      type: 'info',
      title: 'File Manager',
      message: `Revealed: ${file.path}`,
    });
  };

  const handleOpenFile = async () => {
    await filesystemService.openFile(file.path);
    addToast({
      type: 'info',
      title: 'File Opened',
      message: `Opened ${file.name} with default Linux application`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-amber-400" />
          <span className="font-mono text-base truncate max-w-sm">{file.name}</span>
          <CategoryBadge category={file.category} />
        </div>
      }
      subtitle="Complete POSIX filesystem metadata and attributes"
    >
      <div className="space-y-4">
        {/* Path block */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Absolute Location
          </span>
          <div className="text-slate-200 select-all break-all">{file.path}</div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[11px]">File Size</span>
            <span className="text-sm font-bold text-slate-100 mt-0.5 block">
              {formatBytes(file.size)} ({file.size.toLocaleString()} bytes)
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">POSIX Permissions</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              {file.permissions || '-rw-r--r--'} (0644)
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Last Modified</span>
            <span className="text-slate-200 mt-0.5 block">
              {formatDate(file.modifiedAt)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">MIME Type</span>
            <span className="text-slate-200 mt-0.5 block">
              {file.mimeType || 'application/octet-stream'}
            </span>
          </div>
        </div>

        {/* SHA-256 Hash */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Key className="w-3.5 h-3.5 text-sky-400" />
            <span>SHA-256 Checksum</span>
          </div>
          <div className="text-slate-300 break-all select-all text-[11px] p-2 bg-slate-900 rounded border border-slate-800">
            {file.hash}
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenFile}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReveal}
              leftIcon={<FolderOpen className="w-3.5 h-3.5" />}
            >
              Reveal in Files
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteClick && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onClose();
                  onDeleteClick(file);
                }}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete File
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
