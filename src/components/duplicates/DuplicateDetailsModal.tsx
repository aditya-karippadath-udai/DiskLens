import React from 'react';
import { Modal } from '../common/Modal';
import { DuplicateGroup } from '../../types/file';
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
} from 'lucide-react';
import { formatBytes, formatDate } from '../../data/mockData';
import { filesystemService } from '../../services/filesystemService';
import { useAppStore } from '../../store/appStore';

interface DuplicateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: DuplicateGroup | null;
  onToggleSelect: (fileId: string) => void;
  onSetOriginal: (fileId: string) => void;
}

export const DuplicateDetailsModal: React.FC<DuplicateDetailsModalProps> = ({
  isOpen,
  onClose,
  group,
  onToggleSelect,
  onSetOriginal,
}) => {
  const { addToast } = useAppStore();

  if (!group) return null;

  const handleReveal = async (path: string) => {
    await filesystemService.revealFile(path);
    addToast({
      type: 'info',
      title: 'File Manager',
      message: `Revealed: ${path}`,
    });
  };

  const handleOpenFile = async (path: string) => {
    await filesystemService.openFile(path);
    addToast({
      type: 'info',
      title: 'Opened File',
      message: `Launching default desktop viewer for ${path}`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span className="font-mono text-base">{group.files[0]?.name}</span>
          <CategoryBadge category={group.category} />
        </div>
      }
      subtitle="Detailed file attributes, hash verification, and comparison"
    >
      <div className="space-y-5">
        {/* Hash & Size Card */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              Cryptographic Hash (SHA-256)
            </span>
            <span className="text-emerald-400">100% Exact Match</span>
          </div>
          <div className="p-2.5 bg-slate-900 rounded-lg text-slate-200 break-all select-all border border-slate-800/80">
            {group.hash}
          </div>
        </div>

        {/* Files comparison list */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            All Copies in Group ({group.files.length})
          </h4>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {group.files.map((file, idx) => (
              <div
                key={file.id}
                className={`p-4 rounded-xl border transition-all ${
                  file.isOriginal
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : file.isSelected
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-200 truncate">
                        {file.path}
                      </span>
                      {file.isOriginal ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                          ORIGINAL
                        </span>
                      ) : file.isSelected ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                          SELECTED FOR DELETION
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono pt-1">
                      <div>Size: <span className="text-slate-200">{formatBytes(file.size)}</span></div>
                      <div>Modified: <span className="text-slate-200">{formatDate(file.modifiedAt)}</span></div>
                      <div>Permissions: <span className="text-slate-200">{file.permissions || '-rw-r--r--'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenFile(file.path)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Open File
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReveal(file.path)}
                      leftIcon={<FolderOpen className="w-3.5 h-3.5" />}
                    >
                      Reveal
                    </Button>
                  </div>

                  <div>
                    {file.isOriginal ? (
                      <span className="text-xs text-emerald-400 font-medium">Protected (Original)</span>
                    ) : (
                      <Button
                        variant={file.isSelected ? 'secondary' : 'destructive'}
                        size="sm"
                        onClick={() => onToggleSelect(file.id)}
                      >
                        {file.isSelected ? 'Keep this Copy' : 'Mark for Deletion'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
