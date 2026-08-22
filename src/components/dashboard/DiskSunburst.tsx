import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DiskNode } from '../../types/disk';
import { formatBytes } from '../../data/mockData';
import { useFilesystemStore } from '../../store/filesystemStore';
import { useAppStore } from '../../store/appStore';
import {
  Folder,
  Layers,
  ZoomIn,
  RotateCcw,
  Sparkles,
  ChevronRight,
  PieChart as PieChartIcon,
  Film,
  Music,
  Archive,
  Image as ImageIcon,
  Disc,
  Code2,
  Binary,
  FileText,
  Compass,
} from 'lucide-react';
import { clsx } from 'clsx';

interface DiskSunburstProps {
  rootNode?: DiskNode;
  maxDepth?: number;
  className?: string;
}

interface SunburstHierarchyNode extends d3.HierarchyRectangularNode<DiskNode> {
  target?: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  };
}

export const DiskSunburst: React.FC<DiskSunburstProps> = ({
  rootNode: propRootNode,
  className,
}) => {
  const { rootTree, drillDownNode } = useFilesystemStore();
  const { setCurrentPage } = useAppStore();

  const data = propRootNode || rootTree;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredNode, setHoveredNode] = useState<DiskNode | null>(null);
  const [activeRoot, setActiveRoot] = useState<DiskNode>(data);
  const [selectedDepth, setSelectedDepth] = useState<number>(3);
  const [colorMode, setColorMode] = useState<'branch' | 'category'>('branch');
  const [containerWidth, setContainerWidth] = useState<number>(500);

  // Update activeRoot if root data changes
  useEffect(() => {
    setActiveRoot(data);
  }, [data]);

  // Observe container dimensions for fluid responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Category Icon helper
  const getCategoryIcon = (category?: string, type?: string) => {
    if (type === 'folder' && !category) return <Folder className="w-3.5 h-3.5 text-sky-400" />;
    switch (category) {
      case 'video':
        return <Film className="w-3.5 h-3.5 text-sky-400" />;
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'archive':
        return <Archive className="w-3.5 h-3.5 text-amber-400" />;
      case 'iso':
        return <Disc className="w-3.5 h-3.5 text-rose-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-pink-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      case 'application':
        return <Binary className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Branch Color Schemes
  const branchColors: Record<string, string> = {
    home: '#38bdf8', // sky-400
    usr: '#818cf8',  // indigo-400
    var: '#34d399',  // emerald-400
    opt: '#fbbf24',  // amber-400
    other: '#94a3b8', // slate-400
    root: '#f43f5e',  // rose-500
    etc: '#a78bfa',  // purple-400
    tmp: '#fb923c',  // orange-400
  };

  const categoryColors: Record<string, string> = {
    video: '#38bdf8',
    code: '#818cf8',
    archive: '#fbbf24',
    iso: '#f43f5e',
    image: '#f472b6',
    audio: '#c084fc',
    document: '#2dd4bf',
    application: '#22c55e',
    other: '#64748b',
  };

  const getNodeColor = (d: d3.HierarchyRectangularNode<DiskNode>): string => {
    if (d.depth === 0) return '#0f172a'; // slate-900 for root center

    if (colorMode === 'category' && d.data.category) {
      return categoryColors[d.data.category] || '#64748b';
    }

    // Identify top-level ancestor branch (depth 1)
    let ancestor = d;
    while (ancestor.depth > 1 && ancestor.parent) {
      ancestor = ancestor.parent as d3.HierarchyRectangularNode<DiskNode>;
    }
    const branchName = ancestor.data.name.replace('/', '') || 'home';
    const baseColor = branchColors[branchName] || '#38bdf8';

    // Adjust luminance based on depth for radial gradient distinction
    const colorObj = d3.color(baseColor);
    if (!colorObj) return baseColor;

    if (d.depth === 1) {
      return baseColor;
    } else if (d.depth === 2) {
      return colorObj.brighter(0.25).formatHex();
    } else if (d.depth === 3) {
      return colorObj.darker(0.35).formatHex();
    } else {
      return colorObj.darker(0.65).formatHex();
    }
  };

  // Breadcrumb path for the active or hovered node
  const activeLineage = useMemo(() => {
    const target = hoveredNode || activeRoot;
    const parts = target.path.split('/').filter(Boolean);
    const crumbs = [{ name: '/', path: '/' }];
    let cur = '';
    for (const p of parts) {
      cur += `/${p}`;
      crumbs.push({ name: p, path: cur });
    }
    return crumbs;
  }, [hoveredNode, activeRoot]);

  // Top folders list from activeRoot for quick breakdown panel
  const topSubfolders = useMemo(() => {
    const children = activeRoot.children || [];
    return [...children]
      .filter((c) => c.size > 0)
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);
  }, [activeRoot]);

  // D3 Sunburst Render Engine
  useEffect(() => {
    if (!svgRef.current || !activeRoot) return;

    const width = Math.min(containerWidth, 480);
    const height = width;
    const radius = width / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `-${radius} -${radius} ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)
      .style('font', '10px Inter, sans-serif');

    // Build hierarchy
    const root = d3
      .hierarchy<DiskNode>(activeRoot)
      .sum((d) => (d.children && d.children.length > 0 ? 0 : d.size))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Partition layout
    const partition = (dataNode: d3.HierarchyNode<DiskNode>) => {
      return d3.partition<DiskNode>().size([2 * Math.PI, radius])(dataNode);
    };

    const rootPartition = partition(root) as SunburstHierarchyNode;

    // Filter nodes by selected depth
    const visibleNodes = rootPartition.descendants().filter((d) => d.depth <= selectedDepth);

    // Arc generator
    const arc = d3
      .arc<SunburstHierarchyNode>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.006))
      .padRadius(radius / 2)
      .innerRadius((d) => Math.max(d.y0, d.depth === 0 ? 0 : 45))
      .outerRadius((d) => Math.max(d.y0, d.y1 - 2));

    // Group for arcs
    const g = svg.append('g');

    // Create paths
    const path = g
      .append('g')
      .selectAll<SVGPathElement, SunburstHierarchyNode>('path')
      .data(visibleNodes)
      .join('path')
      .attr('fill', (d) => (d.depth === 0 ? '#0b1329' : getNodeColor(d)))
      .attr('fill-opacity', (d) => {
        if (d.depth === 0) return 0.95;
        return Math.max(0.65, 1 - d.depth * 0.1);
      })
      .attr('stroke', '#020617')
      .attr('stroke-width', 1.5)
      .attr('d', arc as any)
      .style('cursor', (d) => (d.children && d.children.length > 0 ? 'pointer' : 'default'))
      .attr('class', 'transition-all duration-150');

    // Center circular button / indicator
    const centerGroup = svg
      .append('g')
      .attr('class', 'center-info')
      .style('cursor', activeRoot.path !== '/' ? 'pointer' : 'default');

    centerGroup
      .append('circle')
      .attr('r', 44)
      .attr('fill', '#090d16')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .attr('class', 'hover:stroke-sky-500/50 transition-colors');

    // Event handlers for interactivity
    path
      .on('mouseenter', (_event, d) => {
        setHoveredNode(d.data);

        // Highlight lineage
        const sequence = d.ancestors();
        path.attr('fill-opacity', (node) => {
          if (node.depth === 0) return 0.95;
          return sequence.indexOf(node) >= 0 ? 1 : 0.25;
        });
        path.attr('stroke', (node) => (sequence.indexOf(node) >= 0 ? '#38bdf8' : '#020617'));
        path.attr('stroke-width', (node) => (sequence.indexOf(node) >= 0 ? 2 : 1.5));
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        path
          .attr('fill-opacity', (d) => (d.depth === 0 ? 0.95 : Math.max(0.65, 1 - d.depth * 0.1)))
          .attr('stroke', '#020617')
          .attr('stroke-width', 1.5);
      })
      .on('click', (_event, d) => {
        if (d.depth === 0) {
          // Clicked center
          if (activeRoot.path !== '/') {
            // Find parent
            const parentParts = activeRoot.path.split('/').filter(Boolean);
            parentParts.pop();
            const parentPath = '/' + parentParts.join('/');
            
            const findParentNode = (node: DiskNode, target: string): DiskNode | null => {
              if (node.path === target) return node;
              if (node.children) {
                for (const c of node.children) {
                  const res = findParentNode(c, target);
                  if (res) return res;
                }
              }
              return null;
            };

            const parentNode = findParentNode(data, parentPath) || data;
            setActiveRoot(parentNode);
          }
          return;
        }

        if (d.data.type === 'folder') {
          setActiveRoot(d.data);
        } else if (d.data.type === 'file') {
          setHoveredNode(d.data);
        }
      });

    // Center click to go back
    centerGroup.on('click', () => {
      if (activeRoot.path !== '/') {
        const parentParts = activeRoot.path.split('/').filter(Boolean);
        parentParts.pop();
        const parentPath = '/' + parentParts.join('/');

        const findParentNode = (node: DiskNode, target: string): DiskNode | null => {
          if (node.path === target) return node;
          if (node.children) {
            for (const c of node.children) {
              const res = findParentNode(c, target);
              if (res) return res;
            }
          }
          return null;
        };

        const parentNode = findParentNode(data, parentPath) || data;
        setActiveRoot(parentNode);
      }
    });

  }, [activeRoot, data, containerWidth, selectedDepth, colorMode]);

  const displayedNode = hoveredNode || activeRoot;
  const isZoomed = activeRoot.path !== '/';

  return (
    <div
      className={clsx(
        'p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden',
        className
      )}
      ref={containerRef}
    >
      {/* Sunburst Top Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">
              Disk Usage Sunburst Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Radial multi-level directory hierarchy by folder weight
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Depth selector */}
          <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-0.5 text-xs">
            <span className="text-[10px] text-slate-400 px-2 font-mono">Depth:</span>
            {[2, 3, 4].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDepth(d)}
                className={clsx(
                  'px-2 py-0.5 rounded text-[11px] font-mono transition-all',
                  selectedDepth === d
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {d}L
              </button>
            ))}
          </div>

          {/* Color Mode toggle */}
          <button
            onClick={() => setColorMode(colorMode === 'branch' ? 'category' : 'branch')}
            className={clsx(
              'px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5',
              colorMode === 'category'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            )}
            title="Toggle between Branch and Category Color Themes"
          >
            <Layers className="w-3 h-3 text-sky-400" />
            <span className="text-[11px]">{colorMode === 'branch' ? 'By Path' : 'By Type'}</span>
          </button>

          {/* Reset Zoom */}
          {isZoomed && (
            <button
              onClick={() => setActiveRoot(data)}
              className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 hover:bg-sky-500/20 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">Reset Root</span>
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb Trail Navigation */}
      <div className="py-2.5 flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-mono text-slate-400 mr-1 shrink-0">Path:</span>
        {activeLineage.map((crumb, idx) => (
          <React.Fragment key={crumb.path}>
            {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
            <button
              onClick={() => {
                const findNode = (node: DiskNode, target: string): DiskNode | null => {
                  if (node.path === target) return node;
                  if (node.children) {
                    for (const c of node.children) {
                      const res = findNode(c, target);
                      if (res) return res;
                    }
                  }
                  return null;
                };
                const targetNode = findNode(data, crumb.path);
                if (targetNode) setActiveRoot(targetNode);
              }}
              className={clsx(
                'px-1.5 py-0.5 rounded font-mono text-[11px] transition-colors shrink-0',
                crumb.path === activeRoot.path
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Main Visualizer Content: Sunburst Radial SVG + Side Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-2">
        {/* Left Sunburst Diagram SVG Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[320px]">
          <svg ref={svgRef} className="overflow-visible drop-shadow-md select-none" />

          {/* Central Overlay HUD Badge */}
          <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center w-24">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              {isZoomed ? 'Subfolder' : 'Root'}
            </span>
            <span className="text-xs font-bold font-mono text-slate-100 truncate max-w-[85px]">
              {activeRoot.name}
            </span>
            <span className="text-[11px] font-mono text-sky-400 font-semibold">
              {formatBytes(activeRoot.size, 0)}
            </span>
          </div>

          {/* Hover Hint */}
          <div className="mt-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <ZoomIn className="w-3 h-3 text-slate-400" />
              Click any arc ring to drill down • Hover to inspect lineage
            </span>
          </div>
        </div>

        {/* Right Telemetry & Folder Ranking Panel */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Active / Hovered Folder Telemetry Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {getCategoryIcon(displayedNode.category, displayedNode.type)}
                <span className="text-xs font-bold text-slate-200 truncate font-mono">
                  {displayedNode.name}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-sky-400 shrink-0">
                {formatBytes(displayedNode.size)}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 truncate">
              {displayedNode.path}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Share</span>
                <span className="font-mono text-slate-200 font-bold">
                  {Math.round((displayedNode.size / data.size) * 100)}% of drive
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Contains</span>
                <span className="font-mono text-slate-200 font-bold">
                  {displayedNode.filesCount
                    ? `${displayedNode.filesCount.toLocaleString()} files`
                    : `${displayedNode.children?.length || 0} sub-items`}
                </span>
              </div>
            </div>
          </div>

          {/* Heaviest Subdirectories in Current Scope */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Largest Subfolders
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                in {activeRoot.name}
              </span>
            </div>

            <div className="space-y-1.5">
              {topSubfolders.map((folder, idx) => {
                const percentOfCurrent = Math.round((folder.size / activeRoot.size) * 100);
                const hasChildren = folder.children && folder.children.length > 0;

                return (
                  <button
                    key={folder.path}
                    onClick={() => {
                      setActiveRoot(folder);
                    }}
                    className="w-full p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 text-left transition-all text-xs group cursor-pointer hover:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="font-mono font-medium text-slate-300 truncate text-[11px] group-hover:text-sky-300 transition-colors">
                          {folder.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold shrink-0">
                        {formatBytes(folder.size)}
                      </span>
                    </div>

                    {/* Progress Percentage Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex items-center">
                      <div
                        className="bg-sky-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, percentOfCurrent)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick jump action */}
          <div className="pt-2">
            <button
              onClick={() => {
                drillDownNode(activeRoot);
                setCurrentPage('disk-usage');
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <PieChartIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Explore in Treemap Visualizer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
