import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useFilesystemStore } from '../store/filesystemStore';
import { useScanStore } from '../store/scanStore';
import { StorageGauge } from '../components/dashboard/StorageGauge';
import { StatCard } from '../components/dashboard/StatCard';
import { DriveSelector } from '../components/dashboard/DriveSelector';
import { DiskSunburst } from '../components/dashboard/DiskSunburst';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { Button } from '../components/common/Button';
import {
  HardDrive,
  Copy,
  FileSpreadsheet,
  PieChart,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  Compass,
  BarChart3,
} from 'lucide-react';
import { formatBytes } from '../data/mockData';
import { clsx } from 'clsx';

export const DashboardPage: React.FC = () => {
  const { setCurrentPage, addToast } = useAppStore();
  const { drives, selectedDriveId, setSelectedDriveId, diskStats, refreshDiskData } = useFilesystemStore();
  const { startScan, setTargetType } = useScanStore();
  const [distributionView, setDistributionView] = useState<'sunburst' | 'categories'>('sunburst');

  React.useEffect(() => {
    refreshDiskData();
  }, []);

  const currentDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];

  const handleQuickScan = () => {
    setTargetType(currentDrive.type === 'root' ? 'root' : currentDrive.type === 'external' ? 'external' : 'home');
    setCurrentPage('duplicates');
    startScan();
    addToast({
      type: 'info',
      title: 'Scan Started',
      message: `Analyzing storage on ${currentDrive.name} (${currentDrive.devicePath})`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Disk Overview</h2>
          <p className="text-xs text-slate-400 mt-1">
            Understand what's using your storage and safely reclaim space.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentPage('disk-usage')}
            leftIcon={<PieChart className="w-4 h-4 text-emerald-400" />}
          >
            Open Visualizer
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleQuickScan}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="shadow-lg shadow-sky-500/20"
          >
            Scan Disk
          </Button>
        </div>
      </div>

      {/* Storage Drives Selector */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Mounted Block Devices
        </span>
        <DriveSelector
          drives={drives}
          selectedDriveId={selectedDriveId}
          onSelectDrive={setSelectedDriveId}
        />
      </div>

      {/* Hero Storage Gauge & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Circular Gauge Card */}
        <div className="lg:col-span-4">
          <StorageGauge
            totalBytes={currentDrive.totalBytes}
            usedBytes={currentDrive.usedBytes}
            freeBytes={currentDrive.freeBytes}
            deviceName={currentDrive.name}
            filesystem={currentDrive.filesystem}
          />
        </div>

        {/* Right 4 Key Metric Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Used Space"
            value={formatBytes(currentDrive.usedBytes, 0)}
            subtitle={`${Math.round((currentDrive.usedBytes / currentDrive.totalBytes) * 100)}% of total storage capacity`}
            icon={HardDrive}
            variant="sky"
            actionText="Visualizer"
            onClick={() => setCurrentPage('disk-usage')}
          />

          <StatCard
            title="Free Space"
            value={formatBytes(currentDrive.freeBytes, 0)}
            subtitle="Available for allocation"
            icon={ShieldCheck}
            variant="emerald"
            badge="Healthy"
          />

          <StatCard
            title="Duplicate Files"
            value={formatBytes(diskStats.duplicateBytes, 1)}
            subtitle="42 duplicate file sets detected"
            icon={Copy}
            variant="indigo"
            actionText="Clean Clones"
            badge="Reclaimable"
            onClick={() => setCurrentPage('duplicates')}
          />

          <StatCard
            title="Large Files"
            value={formatBytes(diskStats.largeFileBytes, 1)}
            subtitle="Files exceeding 500 MB"
            icon={FileSpreadsheet}
            variant="amber"
            actionText="Review Files"
            onClick={() => setCurrentPage('large-files')}
          />
        </div>
      </div>

      {/* Interactive Disk Usage Distribution (Sunburst & Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Disk Usage Distribution by Folder Size
            </span>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setDistributionView('sunburst')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                distributionView === 'sunburst'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>D3 Sunburst</span>
            </button>

            <button
              onClick={() => setDistributionView('categories')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                distributionView === 'categories'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Category Breakdown</span>
            </button>
          </div>
        </div>

        {/* Render Selected View */}
        {distributionView === 'sunburst' ? (
          <DiskSunburst />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <ActivityChart />
            </div>

            {/* Quick Utilities Panel */}
            <div className="lg:col-span-4 p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-100 mb-1">Quick Optimization</h4>
                <p className="text-xs text-slate-400 mb-4">Recommended cleanup actions for this drive</p>

                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentPage('duplicates')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-left transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                        <Copy className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200 block">Purge Duplicates</span>
                        <span className="text-[11px] text-slate-400 font-mono">18.4 GB recoverable</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => setCurrentPage('large-files')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-left transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200 block">Inspect Heavy ISOs & Archives</span>
                        <span className="text-[11px] text-slate-400 font-mono">73.2 GB consuming</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Storage Driver: POSIX Native</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
