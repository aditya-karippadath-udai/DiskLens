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
import { formatBytes, formatDate } from '../../utils/formatters';
import { useAppStore } from '../../store/appStore';
import {
  Folder,
  FileText,
  Layers,
  ChevronRight,
  Flame,
  HardDrive,
  ZoomIn,
  CornerLeftUp,
  FolderTree,
  Filter,
  X,
  Copy,
  Check,
  Calendar,
  Shield,
  Film,
  Music,
  Image as ImageIcon,
  Archive,
  Disc,
  Code2,
  Binary,
  ArrowRight,
  Eye,
  FileCode,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../common/Button';

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
  parentRawNode?: DiskNode;
  color: string;
  rawNode: DiskNode;
}

const FOLDER_PALETTE = [
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#eab308', // Yellow
  '#3b82f6', // Blue
];

const CATEGORY_COLORS: Record<string, string> = {
  video: '#38bdf8',     // Sky
  code: '#818cf8',      // Indigo
  archive: '#fbbf24',   // Amber
  iso: '#f43f5e',       // Rose
  image: '#f472b6',     // Pink
  audio: '#c084fc',     // Purple
  document: '#2dd4bf',  // Teal
  application: '#22c55e', // Emerald
  other: '#64748b',     // Slate
};

// Helper to adjust hex color brightness for nested rings
function adjustColor(hex: string, percent: number): string {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;
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
  const { setCurrentPage } = useAppStore();

  const [activeSlice, setActiveSlice] = useState<SunburstSlice | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    node: DiskNode;
    parentPath?: string;
    parentRawNode?: DiskNode;
  } | null>(null);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);

  const [depthMode, setDepthMode] = useState<1 | 2>(2);
  const [metricMode, setMetricMode] = useState<'size' | 'count'>('size');
  const [filterThresholdMB, setFilterThresholdMB] = useState<number>(0);
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'folders' | 'files'>('all');
  const [highlightPath, setHighlightPath] = useState<string | null>(null);
  const [directoryTab, setDirectoryTab] = useState<'folders' | 'files'>('folders');

  const totalSize = node.size || 1;
  const children = node.children || [];

  // Helper for category icons
  const getCategoryIcon = (category?: string, type?: 'folder' | 'file') => {
    if (type === 'folder') return <Folder className="w-4 h-4 text-sky-400 shrink-0" />;
    switch (category) {
      case 'video':
        return <Film className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'iso':
        return <Disc className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />;
      case 'audio':
        return <Music className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'application':
        return <Binary className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  // Build hierarchical data for concentric Sunburst rings in Recharts
  const { level1Slices, level2Slices, directFolders, directFiles } = useMemo(() => {
    const l1: SunburstSlice[] = [];
    const l2: SunburstSlice[] = [];
    const minBytes = filterThresholdMB * 1024 * 1024;

    // Filter items by type and min size
    const filteredChildren = children.filter((c) => {
      if (itemTypeFilter === 'folders' && c.type !== 'folder') return false;
      if (itemTypeFilter === 'files' && c.type !== 'file') return false;
      return c.size >= minBytes;
    });

    const effectiveChildren = filteredChildren.length > 0 ? filteredChildren : children;

    const foldersList: DiskNode[] = [];
    const filesList: DiskNode[] = [];

    effectiveChildren.forEach((child, idx) => {
      if (child.type === 'folder') {
        foldersList.push(child);
      } else {
        filesList.push(child);
      }

      // Color selection: Folders get palette colors; files get category color
      const baseColor =
        child.type === 'folder'
          ? FOLDER_PALETTE[idx % FOLDER_PALETTE.length]
          : CATEGORY_COLORS[child.category || 'other'] || '#64748b';

      const sliceSize =
        metricMode === 'size'
          ? Math.max(1024, child.size)
          : Math.max(1, child.filesCount || 1);

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

      // Level 2 Sub-items (if child is a folder)
      if (child.type === 'folder' && child.children && child.children.length > 0) {
        const subChildren = child.children.filter((sc) => {
          if (itemTypeFilter === 'folders' && sc.type !== 'folder') return false;
          if (itemTypeFilter === 'files' && sc.type !== 'file') return false;
          return sc.size >= minBytes;
        });

        const activeSubs = subChildren.length > 0 ? subChildren : child.children;

        activeSubs.forEach((subChild, subIdx) => {
          const subColor =
            subChild.type === 'folder'
              ? adjustColor(baseColor, subIdx % 2 === 0 ? 25 : -20)
              : CATEGORY_COLORS[subChild.category || 'other'] || adjustColor(baseColor, 40);

          const subSize =
            metricMode === 'size'
              ? Math.max(512, subChild.size)
              : Math.max(1, subChild.filesCount || 1);

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
            parentRawNode: child,
            color: subColor,
            rawNode: subChild,
          });
        });
      }
    });

    return {
      level1Slices: l1,
      level2Slices: l2,
      directFolders: foldersList.sort((a, b) => b.size - a.size),
      directFiles: filesList.sort((a, b) => b.size - a.size),
    };
  }, [node, children, metricMode, filterThresholdMB, itemTypeFilter]);

  // Handle click on slice:
  // - If folder: Drill down to focus that folder and its sub-folders & files
  // - If file: Open file details inspection modal
  const handleSliceClick = (data: any) => {
    const slice: SunburstSlice = data?.payload || data;
    if (!slice || !slice.rawNode) return;

    if (slice.type === 'folder') {
      onDrillDown(slice.rawNode);
    } else {
      setSelectedFile({
        node: slice.rawNode,
        parentPath: slice.parentPath || node.path,
        parentRawNode: slice.parentRawNode,
      });
    }
  };

  // Copy path handler
  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  // Custom Active Shape on hover with glowing radial highlight
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
          filter="drop-shadow(0px 0px 8px rgba(56, 189, 248, 0.45))"
        />
      </g>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Depth, Filters, Item Type & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-200">
            Sunburst Radial Visualizer
          </span>
          <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
            Interactive Drill-Down
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Content Type Filter */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setItemTypeFilter('all')}
              className={clsx(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                itemTypeFilter === 'all'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              All Items
            </button>
            <button
              onClick={() => setItemTypeFilter('folders')}
              className={clsx(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                itemTypeFilter === 'folders'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Folders Only
            </button>
            <button
              onClick={() => setItemTypeFilter('files')}
              className={clsx(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                itemTypeFilter === 'files'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Files Only
            </button>
          </div>

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
              2 Rings (Sub-items)
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

      {/* Main Grid: Recharts Sunburst + Directory & Files Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center: Interactive Recharts Sunburst Wheel */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md p-4 flex flex-col justify-between relative min-h-[480px]">
          {children.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <Folder className="w-12 h-12 text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-slate-200">Empty Directory</p>
              <span className="text-xs text-slate-400 font-mono mt-1">{node.path}</span>
              {canGoUp && onGoUp && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onGoUp}
                  className="mt-4"
                  leftIcon={<CornerLeftUp className="w-3.5 h-3.5" />}
                >
                  Go Back to Parent
                </Button>
              )}
            </div>
          ) : (
            <div className="relative w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as SunburstSlice;
                        const pct =
                          totalSize > 0
                            ? ((data.rawNode.size / totalSize) * 100).toFixed(1)
                            : '0';
                        return (
                          <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 z-30 max-w-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-100">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="truncate">{data.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-normal ml-auto">
                                Ring {data.level}
                              </span>
                            </div>

                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {data.path}
                            </p>

                            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                              <span className="text-sky-400 font-mono font-bold">
                                {formatBytes(data.rawNode.size)}
                              </span>
                              <span className="font-mono text-slate-300 font-semibold">
                                {pct}% of view
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                              <span className="capitalize">
                                {data.type === 'folder'
                                  ? `Folder (${data.filesCount || 0} items)`
                                  : `File (${data.category || 'generic'})`}
                              </span>
                            </div>

                            {data.type === 'folder' ? (
                              <p className="text-[10px] text-sky-300 font-medium pt-1 border-t border-slate-800/80 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-sky-400" />
                                <span>Click to focus & drill down into sub-folders & files</span>
                              </p>
                            ) : (
                              <p className="text-[10px] text-pink-300 font-medium pt-1 border-t border-slate-800/80 flex items-center gap-1">
                                <Eye className="w-3 h-3 text-pink-400" />
                                <span>Click to inspect file properties & details</span>
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
                        opacity={
                          highlightPath && !entry.path.startsWith(highlightPath)
                            ? 0.35
                            : 0.92
                        }
                      />
                    ))}
                  </Pie>

                  {/* Level 2: Outer Ring (Nested Sub-items & Sub-folders) */}
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
                          opacity={
                            highlightPath && !entry.path.startsWith(highlightPath)
                              ? 0.35
                              : 0.88
                          }
                        />
                      ))}
                    </Pie>
                  )}
                </PieChart>
              </ResponsiveContainer>

              {/* Central Interactive Core Hub: Shows active directory info & 1-click drill-up */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={clsx(
                    'w-32 h-32 rounded-full bg-slate-950/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center text-center p-2 backdrop-blur-xl pointer-events-auto transition-all',
                    canGoUp && 'hover:border-sky-400 hover:scale-105 cursor-pointer group'
                  )}
                  onClick={() => {
                    if (canGoUp && onGoUp) onGoUp();
                  }}
                  title={canGoUp ? 'Click to navigate back up to parent folder' : node.path}
                >
                  {canGoUp ? (
                    <div className="flex flex-col items-center">
                      <CornerLeftUp className="w-4 h-4 text-sky-400 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-tight">
                        Up 1 Level
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-100 mt-0.5 truncate max-w-[95px]">
                        {formatBytes(node.size)}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                        {node.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <HardDrive className="w-4 h-4 text-sky-400 mb-0.5" />
                      <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[95px]">
                        {node.name === '/' ? 'System Root' : node.name}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-sky-400 mt-0.5">
                        {formatBytes(node.size)}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                        {children.length} direct items
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
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-slate-400 text-[11px]">
                {activeSlice ? (activeSlice.type === 'folder' ? 'Folder' : 'File') : 'Directory'}:
              </span>
              <span className="text-sky-400 font-bold">
                {formatBytes(activeSlice ? activeSlice.rawNode.size : node.size)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Directory Contents Explorer (Sub-folders & Files Tabs) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-3 flex-1 flex flex-col">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Directory Contents
                </h3>
              </div>

              {/* Sub-folders vs Files Switcher */}
              <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
                <button
                  onClick={() => setDirectoryTab('folders')}
                  className={clsx(
                    'px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5',
                    directoryTab === 'folders'
                      ? 'bg-sky-500 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Folder className="w-3 h-3" />
                  <span>Sub-folders ({directFolders.length})</span>
                </button>
                <button
                  onClick={() => setDirectoryTab('files')}
                  className={clsx(
                    'px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5',
                    directoryTab === 'files'
                      ? 'bg-sky-500 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <FileText className="w-3 h-3" />
                  <span>Files ({directFiles.length})</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {directoryTab === 'folders'
                ? 'Click any sub-folder to focus and explore its internal contents.'
                : 'Click any file to inspect detailed properties, permissions, and location.'}
            </p>

            {/* Tab 1: Sub-folders List */}
            {directoryTab === 'folders' && (
              <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
                {directFolders.length === 0 ? (
                  <div className="text-xs text-slate-500 py-8 text-center bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                    <Folder className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No child sub-folders in this directory
                  </div>
                ) : (
                  directFolders.map((fNode, rank) => {
                    const isHovered = highlightPath === fNode.path;
                    const pct =
                      totalSize > 0
                        ? Math.round((fNode.size / totalSize) * 100)
                        : 0;

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
                            <span className="text-[10px] text-slate-400">({pct}%)</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                          </div>
                        </div>

                        {/* Percentage Bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(4, pct))}%`,
                            }}
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
            )}

            {/* Tab 2: Files in Current Directory List */}
            {directoryTab === 'files' && (
              <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
                {directFiles.length === 0 ? (
                  <div className="text-xs text-slate-500 py-8 text-center bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No files found directly in this directory
                  </div>
                ) : (
                  directFiles.map((fNode) => {
                    const isHovered = highlightPath === fNode.path;
                    const pct =
                      totalSize > 0
                        ? ((fNode.size / totalSize) * 100).toFixed(1)
                        : '0';

                    return (
                      <div
                        key={fNode.path}
                        onMouseEnter={() => setHighlightPath(fNode.path)}
                        onMouseLeave={() => setHighlightPath(null)}
                        onClick={() =>
                          setSelectedFile({
                            node: fNode,
                            parentPath: node.path,
                          })
                        }
                        className={clsx(
                          'p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex items-center justify-between gap-2',
                          isHovered
                            ? 'bg-sky-500/15 border-sky-500/50 shadow-md ring-1 ring-sky-500/30'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/70'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getCategoryIcon(fNode.category, 'file')}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-sky-300">
                              {fNode.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              {fNode.category || 'file'} • {pct}% of folder
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono shrink-0">
                          <span className="font-bold text-sky-400 text-xs">
                            {formatBytes(fNode.size)}
                          </span>
                          <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Tip / Action info banner */}
          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
            <ZoomIn className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              Click any folder arc in the radial chart or list to drill down into its sub-folders. Click any file segment to view metadata and inspector tools.
            </p>
          </div>
        </div>
      </div>

      {/* File Inspector Modal / Detailed Inspection Drawer */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    {getCategoryIcon(selectedFile.node.category, 'file')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {selectedFile.node.name}
                    </h3>
                    <span className="text-xs font-mono text-sky-400 capitalize">
                      {selectedFile.node.category || 'generic'} file
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Path Bar with 1-Click Copy */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                <div className="min-w-0 font-mono text-xs text-slate-300 truncate">
                  {selectedFile.node.path}
                </div>
                <button
                  onClick={() => handleCopyPath(selectedFile.node.path)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-mono shrink-0 transition-colors border border-slate-700"
                >
                  {copiedPath ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* File Properties Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400">File Size</span>
                  <p className="text-sm font-mono font-bold text-sky-400">
                    {formatBytes(selectedFile.node.size)}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">
                    {selectedFile.node.size.toLocaleString()} bytes
                  </span>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400">Category / Extension</span>
                  <p className="text-sm font-semibold text-slate-200 uppercase">
                    {selectedFile.node.name.split('.').pop() || 'FILE'}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 capitalize">
                    {selectedFile.node.category || 'other'} category
                  </span>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span>Linux Permissions</span>
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-300">
                    -rw-r--r-- (0644)
                  </p>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Last Modified</span>
                  </span>
                  <p className="text-xs font-mono text-slate-300">
                    {selectedFile.node.modifiedAt
                      ? formatDate(selectedFile.node.modifiedAt)
                      : 'Recently indexed'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-2.5">
                {selectedFile.parentRawNode && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (selectedFile.parentRawNode) {
                        onDrillDown(selectedFile.parentRawNode);
                        setSelectedFile(null);
                      }
                    }}
                    leftIcon={<Folder className="w-3.5 h-3.5" />}
                  >
                    Focus Parent Folder
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setCurrentPage('large-files');
                  }}
                  leftIcon={<FileCode className="w-3.5 h-3.5" />}
                >
                  Locate in Large Files
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
