import React from 'react';
import { useFilesystemStore } from '../store/filesystemStore';
import { useAppStore } from '../store/appStore';
import { DiskBreadcrumb } from '../components/disk/DiskBreadcrumb';
import { DiskTreemap } from '../components/disk/DiskTreemap';
import { DriveSelector } from '../components/dashboard/DriveSelector';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  Layers,
} from 'lucide-react';
import { formatBytes } from '../data/mockData';

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
  } = useFilesystemStore();

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Disk Space Visualizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            See exactly where your storage is being consumed. Click any directory block to drill down.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setCurrentPage('duplicates')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Find Duplicates Here
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

      {/* Directory Breadcrumbs Navigation */}
      <DiskBreadcrumb
        breadcrumbs={pathBreadcrumbs}
        onNavigate={navigateToBreadcrumb}
        onGoBack={handleGoBack}
        canGoBack={pathBreadcrumbs.length > 1}
      />

      {/* Current Folder Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-200">
                {currentTreemapNode.path}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Contains {currentTreemapNode.children?.length || 0} top-level items • Total directory weight:{' '}
              <span className="text-sky-400 font-mono font-bold">
                {formatBytes(currentTreemapNode.size)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Click folder to inspect</span>
        </div>
      </div>

      {/* Interactive Disk Treemap Visualizer */}
      <DiskTreemap node={currentTreemapNode} onDrillDown={drillDownNode} />
    </div>
  );
};
