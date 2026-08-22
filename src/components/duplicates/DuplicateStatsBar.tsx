import React from 'react';
import { DuplicateSelectionStrategy } from '../../services/duplicateService';
import { Button } from '../common/Button';
import {
  Trash2,
  Sparkles,
  CheckCheck,
  Layers,
  HardDrive,
  SlidersHorizontal,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface DuplicateStatsBarProps {
  totalGroups: number;
  totalFiles: number;
  recoverableBytes: number;
  selectedCount: number;
  selectedBytes: number;
  onApplyStrategy: (strategy: DuplicateSelectionStrategy) => void;
  onDeleteClick: () => void;
}

export const DuplicateStatsBar: React.FC<DuplicateStatsBarProps> = ({
  totalGroups,
  totalFiles,
  recoverableBytes,
  selectedCount,
  selectedBytes,
  onApplyStrategy,
  onDeleteClick,
}) => {
  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl backdrop-blur-xl shadow-lg space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block font-medium">Duplicate Groups</span>
          <span className="text-lg font-bold text-slate-100 font-mono mt-0.5 block">
            {totalGroups} groups
          </span>
        </div>

        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block font-medium">Duplicate Files</span>
          <span className="text-lg font-bold text-slate-100 font-mono mt-0.5 block">
            {totalFiles} files
          </span>
        </div>

        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block font-medium">Total Recoverable</span>
          <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
            {formatBytes(recoverableBytes)}
          </span>
        </div>

        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block font-medium">Selected to Clean</span>
          <span className="text-lg font-bold text-rose-400 font-mono mt-0.5 block">
            {selectedCount} files ({formatBytes(selectedBytes)})
          </span>
        </div>
      </div>

      {/* Action Bar: Smart Selection Strategies & Safe Delete Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        {/* Strategy Dropdown / Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Auto-Select:
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApplyStrategy('keep_oldest')}
            title="Keep oldest created file in each group"
          >
            Keep Oldest
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApplyStrategy('keep_newest')}
            title="Keep most recently modified file in each group"
          >
            Keep Newest
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApplyStrategy('keep_home')}
            title="Prioritize keeping files in /home user directory"
          >
            Keep in /home
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApplyStrategy('deselect_all')}
            title="Clear all deletion checkmarks"
          >
            Deselect All
          </Button>
        </div>

        {/* Delete Selected Button */}
        <Button
          variant="destructive"
          size="md"
          onClick={onDeleteClick}
          disabled={selectedCount === 0}
          leftIcon={<Trash2 className="w-4 h-4" />}
          className="shadow-lg shadow-rose-600/20 self-end sm:self-auto"
        >
          Delete Selected ({selectedCount})
        </Button>
      </div>
    </div>
  );
};
