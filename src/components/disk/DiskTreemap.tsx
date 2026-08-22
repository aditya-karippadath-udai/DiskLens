import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiskNode } from '../../types/disk';
import { formatBytes } from '../../utils/formatters';
import {
  Folder,
  FileText,
  Film,
  Music,
  Archive,
  Image as ImageIcon,
  Disc,
  Code2,
  Binary,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';

interface DiskTreemapProps {
  node: DiskNode;
  onDrillDown: (child: DiskNode) => void;
}

export const DiskTreemap: React.FC<DiskTreemapProps> = ({ node, onDrillDown }) => {
  const [hoveredNode, setHoveredNode] = useState<DiskNode | null>(null);

  const children = node.children || [];
  const totalSize = node.size || 1;

  // Color palette assignment based on category or index
  const getColorForNode = (child: DiskNode, index: number) => {
    if (child.category === 'video') return { bg: 'bg-sky-500/20', border: 'border-sky-400/40', text: 'text-sky-300', bar: 'bg-sky-400' };
    if (child.category === 'code') return { bg: 'bg-indigo-500/20', border: 'border-indigo-400/40', text: 'text-indigo-300', bar: 'bg-indigo-400' };
    if (child.category === 'archive') return { bg: 'bg-amber-500/20', border: 'border-amber-400/40', text: 'text-amber-300', bar: 'bg-amber-400' };
    if (child.category === 'iso') return { bg: 'bg-rose-500/20', border: 'border-rose-400/40', text: 'text-rose-300', bar: 'bg-rose-400' };
    if (child.category === 'image') return { bg: 'bg-pink-500/20', border: 'border-pink-400/40', text: 'text-pink-300', bar: 'bg-pink-400' };
    if (child.category === 'audio') return { bg: 'bg-purple-500/20', border: 'border-purple-400/40', text: 'text-purple-300', bar: 'bg-purple-400' };
    
    // Cycle based on index for system folders
    const colors = [
      { bg: 'bg-cyan-500/20', border: 'border-cyan-400/40', text: 'text-cyan-300', bar: 'bg-cyan-400' },
      { bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', text: 'text-emerald-300', bar: 'bg-emerald-400' },
      { bg: 'bg-blue-500/20', border: 'border-blue-400/40', text: 'text-blue-300', bar: 'bg-blue-400' },
      { bg: 'bg-teal-500/20', border: 'border-teal-400/40', text: 'text-teal-300', bar: 'bg-teal-400' },
      { bg: 'bg-slate-700/40', border: 'border-slate-600/40', text: 'text-slate-300', bar: 'bg-slate-400' },
    ];
    return colors[index % colors.length];
  };

  const getIconForCategory = (child: DiskNode) => {
    if (child.type === 'folder') return <Folder className="w-4 h-4 shrink-0" />;
    switch (child.category) {
      case 'video': return <Film className="w-4 h-4 shrink-0" />;
      case 'audio': return <Music className="w-4 h-4 shrink-0" />;
      case 'archive': return <Archive className="w-4 h-4 shrink-0" />;
      case 'iso': return <Disc className="w-4 h-4 shrink-0" />;
      case 'image': return <ImageIcon className="w-4 h-4 shrink-0" />;
      case 'code': return <Code2 className="w-4 h-4 shrink-0" />;
      case 'application': return <Binary className="w-4 h-4 shrink-0" />;
      default: return <FileText className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="relative flex flex-col h-[520px] w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden p-4">
      {/* Treemap Container */}
      <div className="flex-1 flex flex-wrap gap-2.5 overflow-hidden">
        {children.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <Folder className="w-12 h-12 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No sub-items in this directory</p>
            <span className="text-xs text-slate-400 font-mono mt-1">{node.path}</span>
          </div>
        ) : (
          children.map((child, idx) => {
            const rawPercent = (child.size / totalSize) * 100;
            const percent = Math.max(1, Math.round(rawPercent));
            const color = getColorForNode(child, idx);
            const isClickable = child.type === 'folder' && child.children && child.children.length > 0;

            // Flex calculation: proportional to square root of percentage for balanced desktop aspect ratios
            const flexBasis = Math.max(140, Math.min(600, rawPercent * 7.5));

            return (
              <motion.div
                key={child.path}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                onMouseEnter={() => setHoveredNode(child)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (isClickable) onDrillDown(child);
                }}
                style={{
                  flexGrow: Math.max(1, rawPercent),
                  flexBasis: `${flexBasis}px`,
                  minHeight: '110px',
                }}
                className={clsx(
                  'relative rounded-xl border p-3.5 transition-all duration-150 flex flex-col justify-between select-none group backdrop-blur-md overflow-hidden',
                  color.bg,
                  color.border,
                  isClickable ? 'cursor-pointer hover:scale-[1.01] hover:shadow-xl hover:border-sky-400' : 'cursor-default'
                )}
              >
                {/* Top Label & Icon */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 truncate">
                    <span className={color.text}>{getIconForCategory(child)}</span>
                    <span className="truncate">{child.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5 truncate">
                    {child.path}
                  </span>
                </div>

                {/* Bottom Size & Percent metrics */}
                <div className="mt-2 pt-2 border-t border-white/5 flex items-end justify-between text-xs">
                  <div>
                    <span className="text-sm font-bold text-slate-100 font-mono block">
                      {formatBytes(child.size)}
                    </span>
                    {child.filesCount !== undefined && (
                      <span className="text-[10px] text-slate-400">
                        {child.filesCount.toLocaleString()} items
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-black/30 border border-white/10 text-slate-200">
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Interactive Drill Down Indicator */}
                {isClickable && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-sky-300 bg-slate-900/80 px-2 py-0.5 rounded border border-sky-400/40">
                    Click to drill down ↵
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Detailed Inspection Card on Hover */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/95 border border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 z-20"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-100 font-mono truncate">
                  {hoveredNode.path}
                </h5>
                <p className="text-[11px] text-slate-400">
                  {hoveredNode.type === 'folder' ? 'Directory' : 'File'} •{' '}
                  {hoveredNode.filesCount
                    ? `${hoveredNode.filesCount.toLocaleString()} files inside`
                    : hoveredNode.category || 'Regular file'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Size</span>
                <span className="text-sm font-bold text-sky-400">
                  {formatBytes(hoveredNode.size)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Parent %</span>
                <span className="text-sm font-bold text-slate-200">
                  {Math.round((hoveredNode.size / totalSize) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
