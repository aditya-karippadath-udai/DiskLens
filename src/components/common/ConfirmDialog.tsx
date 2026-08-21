import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { formatBytes } from '../../data/mockData';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permanent: boolean) => void;
  title: string;
  fileCount: number;
  totalBytes: number;
  samplePaths?: string[];
  allowPermanentDeleteSetting?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  fileCount,
  totalBytes,
  samplePaths = [],
  allowPermanentDeleteSetting = false,
}) => {
  const [isPermanent, setIsPermanent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(isPermanent);
      onClose();
    } finally {
      setIsSubmitting(false);
      setIsPermanent(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-slate-100">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <span>{title}</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Warning Callout */}
        <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">
              {isPermanent ? 'Permanent Deletion Warning' : 'Safe Trash Staging'}
            </p>
            <p className="text-rose-300/90 leading-relaxed">
              {isPermanent
                ? 'These files will be immediately unlinked from the filesystem. This action cannot be undone!'
                : 'These files will be safely moved to ~/.local/share/Trash. You can restore them if needed.'}
            </p>
          </div>
        </div>

        {/* Summary Metric Box */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Files Selected</span>
            <p className="text-lg font-bold text-slate-100 mt-0.5">{fileCount} items</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Space to Reclaim</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatBytes(totalBytes)}</p>
          </div>
        </div>

        {/* File Preview list */}
        {samplePaths.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400">Files scheduled for deletion:</span>
            <div className="max-h-32 overflow-y-auto rounded-lg bg-slate-950/40 p-2 border border-slate-800/80 text-xs font-mono space-y-1 text-slate-300">
              {samplePaths.slice(0, 5).map((p, idx) => (
                <div key={idx} className="truncate text-slate-400">
                  • {p}
                </div>
              ))}
              {samplePaths.length > 5 && (
                <div className="text-[11px] text-slate-400 italic pt-1">
                  + {samplePaths.length - 5} more files...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Permanent Delete Checkbox (if enabled in settings) */}
        {allowPermanentDeleteSetting && (
          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/30 border border-slate-800/60 cursor-pointer hover:bg-slate-950/50">
            <input
              type="checkbox"
              checked={isPermanent}
              onChange={(e) => setIsPermanent(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 bg-slate-800 border-slate-700 focus:ring-rose-500"
            />
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Bypass Trash and delete permanently (Advanced)</span>
            </div>
          </label>
        )}

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {isPermanent ? 'Delete Permanently' : 'Move to Trash'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
