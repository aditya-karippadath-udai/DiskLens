import React from 'react';
import { motion } from 'motion/react';
import { formatBytes } from '../../utils/formatters';

interface StorageGaugeProps {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  deviceName?: string;
  filesystem?: string;
}

export const StorageGauge: React.FC<StorageGaugeProps> = ({
  totalBytes,
  usedBytes,
  freeBytes,
  deviceName = 'Filesystem',
  filesystem = 'ext4',
}) => {
  const percentUsed = Math.round((usedBytes / totalBytes) * 100);
  const radius = 78;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentUsed / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />

      {/* SVG Radial Gauge */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 190 190">
          {/* Track background */}
          <circle
            cx="95"
            cy="95"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800/80"
          />
          {/* Active Stroke */}
          <motion.circle
            cx="95"
            cy="95"
            r={radius}
            stroke="url(#storageGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            fill="transparent"
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="storageGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
            {percentUsed}%
          </span>
          <span className="text-xs font-medium text-slate-400 mt-0.5">Used</span>
          <span className="text-[10px] font-mono text-sky-400/90 mt-1 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
            {filesystem}
          </span>
        </div>
      </div>

      {/* Numerical Details */}
      <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center border-t border-slate-800/80 pt-4">
        <div>
          <span className="text-[11px] text-slate-400 block">Used</span>
          <span className="text-sm font-semibold text-slate-200 font-mono">
            {formatBytes(usedBytes, 0)}
          </span>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[11px] text-slate-400 block">Free</span>
          <span className="text-sm font-semibold text-emerald-400 font-mono">
            {formatBytes(freeBytes, 0)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Total</span>
          <span className="text-sm font-semibold text-slate-300 font-mono">
            {formatBytes(totalBytes, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
