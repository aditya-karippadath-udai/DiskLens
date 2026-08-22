import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { DiskNode } from '../../types/disk';
import { formatBytes } from '../../data/mockData';
import {
  Folder,
  FileText,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Flame,
  HardDrive,
  ZoomIn,
  CornerLeftUp,
  FolderTree,
  Filter,
  BarChart2,
} from 'lucide-react';
import { clsx } from 'clsx';

interface DiskSunburstRechartsProps {
  node: DiskNode;
  onDrillDown: (child: DiskNode) => void;
  onGoUp?: () => void;
  canGoUp?: boolean;
}

interface SunburstSlice {
  name: string;
  path: string;
  size: number;
  filesCount: number;
  type: 'folder' | 'file';
  category?: string;
  level: number;
  parentName?: string;
  parentPath?: string;
  color: string;
  rawNode: DiskNode;
}

const PALETTE = [
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#eab308', // Yellow
  '#64748b', // Slate
];

// Helper to adjust hex color brightness/opacity for nested rings
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

export const DiskSunburstRecharts: React.FC<DiskSunburstRechartsProps> = ({
  node,
  onDrillDown,
  onGoUp,
  canGoUp,
}) => {
  const [activeSlice, setActiveSlice] = useState<SunburstSlice | null>(null);
  const [depthMode, setDepthMode] = useState<1 | 2>(2);
  const [metricMode, setMetricMode] = useState<'size' | 'count'>('size');
  const [filterThresholdMB, setFilterThresholdMB] = useState<number>(0);
  const [highlightPath, setHighlightPath] = useState<string | null>(null);

  const totalSize = node.size || 1;
  const children = node.children || [];

  // Build hierarchical data for concentric Sunburst rings in Recharts
  const { level1Slices, level2Slices, heaviestFolders } = useMemo(() => {
    const l1: SunburstSlice[] = [];
    const l2: SunburstSlice[] = [];
    const allFolders: { node: DiskNode; depth: number; percentage: number }[] = [];

    const minBytes = filterThresholdMB * 1024 * 1024;

    // Filter children based on min size if requested
    const directChildren = children.filter((c) => c.size >= minBytes);
    const effectiveChildren = directChildren.length > 0 ? directChildren : children;

    effectiveChildren.forEach((child, idx) => {
      const baseColor = PALETTE[idx % PALETTE.length];
      const sliceSize = metricMode === 'size' ? Math.max(1024, child.size) : Math.max(1, child.filesCount || 1);

      l1.push({
        name: child.name,
        path: child.path,
        size: sliceSize,
        filesCount: child.filesCount || (child.type === 'file' ? 1 : 0),
        type: child.type,
        category: child.category,
        level: 1,
        color: baseColor,
        rawNode: child,
      });

      if (child.type === 'folder') {
        allFolders.push({
          node: child,
          depth: 1,
          percentage: totalSize > 0 ? Math.round((child.size / totalSize) * 100) : 0,
        });

        if (child.children && child.children.length > 0) {
          const subChildren = child.children.filter((sc) => sc.size >= minBytes);
          const activeSubs = subChildren.length > 0 ? subChildren : child.children;

          activeSubs.forEach((subChild, subIdx) => {
            // Derived shade from parent color for visual hierarchy
            const subColor = adjustColor(baseColor, subIdx % 2 === 0 ? 25 : -20);
            const subSize = metricMode === 'size' ? Math.max(512, subChild.size) : Math.max(1, subChild.filesCount || 1);

            l2.push({
              name: subChild.name,
              path: subChild.path,
              size: subSize,
              filesCount: subChild.filesCount || (subChild.type === 'file' ? 1 : 0),
              type: subChild.type,
              category: subChild.category,
              level: 2,
              parentName: child.name,
              parentPath: child.path,
              color: subColor,
              rawNode: subChild,
            });

            if (subChild.type === 'folder') {
              allFolders.push({
                node: subChild,
                depth: 2,
                percentage: totalSize > 0 ? Math.round((subChild.size / totalSize) * 100) : 0,
              });
            }
          });
        }
      }
    });

    // Rank heaviest folders to highlight
    const rankedHeavy = allFolders
      .sort((a, b) => b.node.size - a.node.size)
      .slice(0, 5);

    return {
      level1Slices: l1,
      level2Slices: l2,
      heaviestFolders: rankedHeavy,
    };
  }, [node, children, totalSize, metricMode, filterThresholdMB]);

  // Handle click on slice
  const handleSliceClick = (data: any) => {
    const slice: SunburstSlice = data?.payload || data;
    if (slice && slice.type === 'folder' && slice.rawNode?.children && slice.rawNode.children.length > 0) {
      onDrillDown(slice.rawNode);
    }
  };

  // Custom Active Shape on hover with radial highlight
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#38bdf8"
          strokeWidth={2}
          filter="drop-shadow(0px 0px 8px rgba(56, 189, 248, 0.4))"
        />
      </g>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Depth & Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200">
            Sunburst Radial Visualizer
          </span>
          <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
            Recharts Engine
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Depth Selector */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setDepthMode(1)}
              className={clsx(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                depthMode === 1
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              1 Ring (Direct)
            </button>
            <button
              onClick={() => setDepthMode(2)}
              className={clsx(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                depthMode === 2
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              2 Rings (Subfolders)
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMetricMode('size')}
              className={clsx(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                metricMode === 'size'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              By Size
            </button>
            <button
              onClick={() => setMetricMode('count')}
              className={clsx(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                metricMode === 'count'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              By Item Count
            </button>
          </div>

          {/* Min Size Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterThresholdMB}
              onChange={(e) => setFilterThresholdMB(Number(e.target.value))}
              aria-label="Filter threshold"
              className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value={0}>All Sizes</option>
              <option value={10}>&gt; 10 MB</option>
              <option value={50}>&gt; 50 MB</option>
              <option value={100}>&gt; 100 MB</option>
              <option value={500}>&gt; 500 MB</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Recharts Sunburst + Heavyweight Directory Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center: Interactive Recharts Sunburst Wheel */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md p-4 flex flex-col justify-between relative min-h-[460px]">
          {children.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <Folder className="w-12 h-12 text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-slate-200">Empty Directory</p>
              <span className="text-xs text-slate-400 font-mono mt-1">{node.path}</span>
            </div>
          ) : (
            <div className="relative w-full h-[390px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as SunburstSlice;
                        const pct = totalSize > 0 ? ((data.rawNode.size / totalSize) * 100).toFixed(1) : '0';
                        return (
                          <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1 z-30 max-w-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-100">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="truncate">{data.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-normal ml-auto">
                                L{data.level}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-slate-400 truncate">{data.path}</p>
                            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                              <span className="text-sky-400 font-mono font-bold">
                                {formatBytes(data.rawNode.size)}
                              </span>
                              <span className="font-mono text-slate-300 font-semibold">{pct}% of root</span>
                            </div>
                            {data.filesCount > 0 && (
                              <p className="text-[10px] text-slate-400">
                                Contains {data.filesCount.toLocaleString()} items
                              </p>
                            )}
                            {data.type === 'folder' && (
                              <p className="text-[10px] text-sky-300 font-medium pt-0.5">
                                ↵ Click slice to drill into folder
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Level 1: Primary Ring (Direct Folders & Files) */}
                  <Pie
                    data={level1Slices}
                    dataKey="size"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={depthMode === 2 ? 65 : 75}
                    outerRadius={depthMode === 2 ? 120 : 155}
                    paddingAngle={1.5}
                    stroke="rgba(15, 23, 42, 0.8)"
                    strokeWidth={2}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, idx) => setActiveSlice(level1Slices[idx])}
                    onMouseLeave={() => setActiveSlice(null)}
                    onClick={(data) => handleSliceClick(data)}
                    className="cursor-pointer"
                  >
                    {level1Slices.map((entry, index) => (
                      <Cell
                        key={`l1-${index}`}
                        fill={entry.color}
                        opacity={highlightPath && !entry.path.startsWith(highlightPath) ? 0.35 : 0.9}
                      />
                    ))}
                  </Pie>

                  {/* Level 2: Outer Ring (Subfolders & Nested Content) */}
                  {depthMode === 2 && level2Slices.length > 0 && (
                    <Pie
                      data={level2Slices}
                      dataKey="size"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={126}
                      outerRadius={165}
                      paddingAngle={1}
                      stroke="rgba(15, 23, 42, 0.8)"
                      strokeWidth={1.5}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, idx) => setActiveSlice(level2Slices[idx])}
                      onMouseLeave={() => setActiveSlice(null)}
                      onClick={(data) => handleSliceClick(data)}
                      className="cursor-pointer"
                    >
                      {level2Slices.map((entry, index) => (
                        <Cell
                          key={`l2-${index}`}
                          fill={entry.color}
                          opacity={highlightPath && !entry.path.startsWith(highlightPath) ? 0.35 : 0.85}
                        />
                      ))}
                    </Pie>
                  )}
                </PieChart>
              </ResponsiveContainer>

              {/* Central Interactive Core: Shows root info and drill-up action */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={clsx(
                    'w-28 h-28 rounded-full bg-slate-950/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center text-center p-2 backdrop-blur-xl pointer-events-auto transition-all',
                    canGoUp && 'hover:border-sky-400 hover:scale-105 cursor-pointer'
                  )}
                  onClick={() => {
                    if (canGoUp && onGoUp) onGoUp();
                  }}
                  title={canGoUp ? 'Click to navigate to parent folder' : node.path}
                >
                  {canGoUp ? (
                    <div className="flex flex-col items-center">
                      <CornerLeftUp className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-tight">
                        Up 1 Level
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-100 mt-0.5 truncate max-w-[85px]">
                        {formatBytes(node.size)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <HardDrive className="w-4 h-4 text-sky-400 mb-0.5" />
                      <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[85px]">
                        {node.name === '/' ? 'Root' : node.name}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-sky-400">
                        {formatBytes(node.size)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Live Slice Telemetry Banner */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400">Inspecting:</span>
              <span className="text-slate-200 font-bold truncate">
                {activeSlice ? activeSlice.path : node.path}
              </span>
            </div>
            <div className="text-sky-400 font-bold shrink-0 ml-2">
              {formatBytes(activeSlice ? activeSlice.rawNode.size : node.size)}
            </div>
          </div>
        </div>

        {/* Right: Heavyweight Directory Ranking & Quick Drill-Down */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Heavyweight Directories
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Top Consumers</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              These folders occupy the highest proportion of disk capacity in this branch:
            </p>

            <div className="space-y-2">
              {heaviestFolders.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">
                  No child directories found
                </div>
              ) : (
                heaviestFolders.map(({ node: fNode, percentage }, rank) => {
                  const isHovered = highlightPath === fNode.path;
                  return (
                    <div
                      key={fNode.path}
                      onMouseEnter={() => setHighlightPath(fNode.path)}
                      onMouseLeave={() => setHighlightPath(null)}
                      onClick={() => onDrillDown(fNode)}
                      className={clsx(
                        'p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col gap-1.5',
                        isHovered
                          ? 'bg-sky-500/15 border-sky-500/50 shadow-md ring-1 ring-sky-500/30'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/70'
                      )}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={clsx(
                              'w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border',
                              rank === 0
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            )}
                          >
                            #{rank + 1}
                          </span>
                          <span className="font-semibold text-slate-200 truncate group-hover:text-sky-300">
                            {fNode.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono shrink-0">
                          <span className="font-bold text-sky-400 text-xs">
                            {formatBytes(fNode.size)}
                          </span>
                          <span className="text-[10px] text-slate-400">({percentage}%)</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(4, percentage))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="truncate max-w-[200px]">{fNode.path}</span>
                        {fNode.filesCount !== undefined && (
                          <span>{fNode.filesCount.toLocaleString()} items</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Tip / Action info */}
          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
            <ZoomIn className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              Click any colored arc in the Sunburst wheel or a folder card above to drill down deeper into that specific directory branch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
