import React from 'react';
import { ScanHistoryItem } from '../../types/scan';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Calendar,
  Clock,
  HardDrive,
  Copy,
  FolderOpen,
  RotateCcw,
  Trash2,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { formatBytes, formatDate, formatDuration } from '../../data/mockData';

interface ScanHistoryCardProps {
  item: ScanHistoryItem;
  onViewResults: () => void;
  onRescan: () => void;
  onDelete: () => void;
}

export const ScanHistoryCard: React.FC<ScanHistoryCardProps> = ({
  item,
  onViewResults,
  onRescan,
  onDelete,
}) => {
  return (
    <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
      {/* Left: Scan target info & timestamp */}
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <h4 className="text-sm font-bold text-slate-100 font-mono truncate">{item.name}</h4>
          <Badge variant={item.status === 'completed' ? 'success' : 'warning'}>
            {item.status === 'completed' ? 'Completed' : item.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 truncate">
          <FolderOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate">{item.path}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(item.timestamp)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Duration: {formatDuration(item.durationSeconds)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileCode className="w-3 h-3 text-slate-400" />
            {item.filesScanned.toLocaleString()} files inspected
          </span>
        </div>
      </div>

      {/* Center: Recoverable & Group counts */}
      <div className="flex items-center gap-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 shrink-0">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Duplicates
          </span>
          <span className="text-sm font-bold text-slate-200 font-mono">
            {item.duplicateGroupsCount} groups
          </span>
        </div>
        <div className="w-px h-7 bg-slate-800" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Recoverable
          </span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {formatBytes(item.recoverableBytes)}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewResults}
          title="Inspect stored duplicate results"
        >
          View Results
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRescan}
          title="Run scan again"
          aria-label="Rescan"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Remove from history"
          aria-label="Delete history entry"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400 hover:text-rose-300" />
        </Button>
      </div>
    </div>
  );
};
