import React, { useState } from 'react';
import { useFilesystemStore } from '../store/filesystemStore';
import { useAppStore } from '../store/appStore';
import { DiskBreadcrumb } from '../components/disk/DiskBreadcrumb';
import { DiskTreemap } from '../components/disk/DiskTreemap';
import { DiskSunburstRecharts } from '../components/disk/DiskSunburstRecharts';
import { DriveSelector } from '../components/dashboard/DriveSelector';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  Layers,
  PieChart as PieChartIcon,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react';
import { formatBytes } from '../data/mockData';
import { clsx } from 'clsx';

export const DiskUsagePage: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const {
    drives,
    selectedDriveId,
    setSelectedDriveId,
    currentTreemapNode,
    pathBreadcrumbs,
    drillDownNode,
    navigateToBreadcrumb,
    rootTree,
    refreshDiskData,
    isLoading,
  } = useFilesystemStore();

  const [visualizationType, setVisualizationType] = useState<'sunburst' | 'treemap'>('sunburst');

  React.useEffect(() => {
    if (!rootTree || !rootTree.children || rootTree.children.length === 0) {
      refreshDiskData();
    }
  }, []);

  const handleGoBack = () => {
    if (pathBreadcrumbs.length > 1) {
      const parentBreadcrumb = pathBreadcrumbs[pathBreadcrumbs.length - 2];
      navigateToBreadcrumb(parentBreadcrumb.path);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Disk Space Visualizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore hierarchical storage consumption with the interactive Recharts Sunburst chart to identify heavy directories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refreshDiskData()}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentPage('duplicates')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Scan Duplicates
          </Button>
        </div>
      </div>

      {/* Drive Selector */}
      <div className="space-y-2">
        <DriveSelector
          drives={drives}
          selectedDriveId={selectedDriveId}
          onSelectDrive={setSelectedDriveId}
        />
      </div>

      {/* Directory Breadcrumbs Navigation & View Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <DiskBreadcrumb
            breadcrumbs={pathBreadcrumbs}
            onNavigate={navigateToBreadcrumb}
            onGoBack={handleGoBack}
            canGoBack={pathBreadcrumbs.length > 1}
          />
        </div>

        {/* Visualizer Type Switcher */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setVisualizationType('sunburst')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              visualizationType === 'sunburst'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Sunburst (Recharts)</span>
          </button>
          <button
            onClick={() => setVisualizationType('treemap')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              visualizationType === 'treemap'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Treemap Blocks</span>
          </button>
        </div>
      </div>

      {/* Current Folder Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-200 truncate">
                {currentTreemapNode.path}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Contains {currentTreemapNode.children?.length || 0} direct items • Total branch weight:{' '}
              <span className="text-sky-400 font-mono font-bold">
                {formatBytes(currentTreemapNode.size)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
          <span>Click any slice or block to drill down</span>
        </div>
      </div>

      {/* Interactive Disk Visualizer (Sunburst Recharts vs Treemap) */}
      {visualizationType === 'sunburst' ? (
        <DiskSunburstRecharts
          node={currentTreemapNode}
          onDrillDown={drillDownNode}
          onGoUp={handleGoBack}
          canGoUp={pathBreadcrumbs.length > 1}
        />
      ) : (
        <DiskTreemap node={currentTreemapNode} onDrillDown={drillDownNode} />
      )}
    </div>
  );
};
