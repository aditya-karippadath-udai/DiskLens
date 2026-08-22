import React from 'react';
import { motion } from 'motion/react';
import {
  Pause,
  Play,
  X,
  FileCode,
  Folder,
  HardDrive,
  Clock,
  Hourglass,
  Sparkles,
} from 'lucide-react';
import { useScanStore } from '../../store/scanStore';
import { Button } from '../common/Button';
import { formatBytes, formatDuration } from '../../utils/formatters';

export const ScanProgressBar: React.FC = () => {
  const { scanProgress, pauseScan, resumeScan, cancelScan } = useScanStore();
  const isPaused = scanProgress.status === 'paused';

  const phaseLabels = {
    indexing: 'Phase 1/4: Indexing directory hierarchy',
    size_filtering: 'Phase 2/4: Candidate size grouping',
    hashing: 'Phase 3/4: Computing cryptographic hashes (SHA-256)',
    analyzing: 'Phase 4/4: Resolving duplicate groups',
    done: 'Scan finished',
  };

  return (
    <div className="p-6 bg-slate-900/80 border border-sky-500/30 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5">
      {/* Glow highlight */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Status Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                {isPaused ? 'Scan Paused' : 'Scanning Filesystem...'}
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {scanProgress.percent}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {phaseLabels[scanProgress.currentPhase]}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isPaused ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={resumeScan}
              leftIcon={<Play className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Resume
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={pauseScan}
              leftIcon={<Pause className="w-3.5 h-3.5 text-amber-400" />}
            >
              Pause
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={cancelScan}
            leftIcon={<X className="w-3.5 h-3.5" />}
          >
            Cancel Scan
          </Button>
        </div>
      </div>

      {/* Main Animated Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400 rounded-full relative"
            initial={{ width: '0%' }}
            animate={{ width: `${scanProgress.percent}%` }}
            transition={{ ease: 'linear', duration: 0.3 }}
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse-subtle" />
          </motion.div>
        </div>

        {/* Live File Stream Path */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 truncate bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/60">
          <Folder className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate text-slate-300">
            {scanProgress.currentFolder}/{scanProgress.currentFile}
          </span>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Files Analyzed</span>
          </div>
          <p className="text-sm font-bold text-slate-200 font-mono">
            {scanProgress.filesScanned.toLocaleString()}
          </p>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data Inspected</span>
          </div>
          <p className="text-sm font-bold text-slate-200 font-mono">
            {formatBytes(scanProgress.bytesScanned)}
          </p>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Elapsed Time</span>
          </div>
          <p className="text-sm font-bold text-slate-200 font-mono">
            {formatDuration(scanProgress.elapsedSeconds)}
          </p>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Hourglass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Estimated Left</span>
          </div>
          <p className="text-sm font-bold text-slate-200 font-mono">
            {formatDuration(scanProgress.estimatedRemainingSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
};
