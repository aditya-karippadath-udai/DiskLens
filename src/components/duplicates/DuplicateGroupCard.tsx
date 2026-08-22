import React from 'react';
import { DuplicateGroup } from '../../types/file';
import { CategoryBadge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  FolderOpen,
  Info,
  CheckCircle2,
  Trash2,
  FileCheck,
  Calendar,
  Key,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';
import { filesystemService } from '../../services/filesystemService';
import { useAppStore } from '../../store/appStore';
import { clsx } from 'clsx';

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  index: number;
  onToggleSelect: (fileId: string) => void;
  onSetOriginal: (fileId: string) => void;
  onOpenDetails: () => void;
}

export const DuplicateGroupCard: React.FC<DuplicateGroupCardProps> = ({
  group,
  index,
  onToggleSelect,
  onSetOriginal,
  onOpenDetails,
}) => {
  const { addToast } = useAppStore();

  const handleReveal = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    await filesystemService.revealFile(path);
    addToast({
      type: 'info',
      title: 'File Manager',
      message: `Revealed file location: ${path}`,
      duration: 3000,
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md transition-all hover:border-slate-700/80 shadow-md">
      {/* Group Header */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold text-indigo-400">
            #{index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100 font-mono truncate max-w-xs sm:max-w-md">
                {group.files[0]?.name || 'Duplicate Set'}
              </h4>
              <CategoryBadge category={group.category} />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3 text-slate-400" />
                {group.hash.substring(0, 12)}...{group.hash.substring(group.hash.length - 6)}
              </span>
              <span>•</span>
              <span>{group.files.length} identical files</span>
            </div>
          </div>
        </div>

        {/* Space Stats and Details Action */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Reclaimable
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {formatBytes(group.recoverableSize)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDetails}
            leftIcon={<Info className="w-3.5 h-3.5" />}
          >
            Details
          </Button>
        </div>
      </div>

      {/* Files List in this Group */}
      <div className="divide-y divide-slate-850/60 p-2">
        {group.files.map((file) => {
          const isOriginal = file.isOriginal;
          const isSelected = file.isSelected;

          return (
            <div
              key={file.id}
              className={clsx(
                'flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-3 transition-colors',
                isOriginal
                  ? 'bg-emerald-500/5 border border-emerald-500/20'
                  : isSelected
                  ? 'bg-rose-500/5 border border-rose-500/20'
                  : 'hover:bg-slate-850/50 border border-transparent'
              )}
            >
              {/* File Info & Selection Checkbox */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="pt-0.5 shrink-0">
                  {isOriginal ? (
                    <div
                      title="Keep this original file"
                      className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={() => onToggleSelect(file.id)}
                      className="w-5 h-5 rounded text-rose-500 bg-slate-900 border-slate-700 focus:ring-rose-500 cursor-pointer"
                      title={isSelected ? 'Marked for deletion' : 'Click to select for deletion'}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={clsx(
                        'text-xs font-mono font-medium truncate',
                        isOriginal
                          ? 'text-emerald-300'
                          : isSelected
                          ? 'text-rose-300 line-through opacity-80'
                          : 'text-slate-200'
                      )}
                    >
                      {file.path}
                    </p>
                    {isOriginal && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        KEEP ORIGINAL
                      </span>
                    )}
                    {isSelected && !isOriginal && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        WILL DELETE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(file.modifiedAt)}
                    </span>
                    {file.permissions && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400">{file.permissions}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Individual File Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {!isOriginal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetOriginal(file.id)}
                    leftIcon={<FileCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    title="Set this copy as the original to keep"
                  >
                    Keep as Original
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleReveal(e, file.path)}
                  title="Reveal in Linux file manager"
                  aria-label="Reveal file"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
