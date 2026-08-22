import React from 'react';
import { useScanStore } from '../store/scanStore';
import { useAppStore } from '../store/appStore';
import { ScanHistoryCard } from '../components/history/ScanHistoryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { History, Sparkles, Trash2, RotateCcw } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export const ScanHistoryPage: React.FC = () => {
  const { scanHistory, clearHistory, deleteHistoryItem, startScan, setTargetType } = useScanStore();
  const { setCurrentPage, addToast } = useAppStore();

  const totalScannedItems = scanHistory.reduce((acc, h) => acc + h.filesScanned, 0);
  const totalRecoveredBytes = scanHistory.reduce((acc, h) => acc + h.recoverableBytes, 0);

  const handleRescan = (path: string) => {
    setTargetType('custom', path);
    setCurrentPage('duplicates');
    startScan();
  };

  const handleViewResults = () => {
    setCurrentPage('duplicates');
  };

  const handleClear = () => {
    clearHistory();
    addToast({
      type: 'info',
      title: 'History Cleared',
      message: 'Removed all previous scan session logs.',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Scan History</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review previous disk scans, execution audit records, and recovered storage volume.
          </p>
        </div>

        {scanHistory.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Summary Banner */}
      {scanHistory.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Scans Performed</span>
            <span className="text-xl font-bold text-slate-100 font-mono mt-0.5 block">
              {scanHistory.length} runs
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Files Inspected</span>
            <span className="text-xl font-bold text-sky-400 font-mono mt-0.5 block">
              {totalScannedItems.toLocaleString()} files
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Total Discovered Duplicate Space</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
              {formatBytes(totalRecoveredBytes)}
            </span>
          </div>
        </div>
      )}

      {/* History List or Empty State */}
      {scanHistory.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <EmptyState
            icon={History}
            title="No scan history available"
            description="You haven't run any disk or duplicate scans yet. Start a scan to keep track of storage analysis runs."
            actionLabel="Start New Scan"
            onAction={() => setCurrentPage('duplicates')}
            actionIcon={<Sparkles className="w-4 h-4" />}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {scanHistory.map((item) => (
            <ScanHistoryCard
              key={item.id}
              item={item}
              onViewResults={handleViewResults}
              onRescan={() => handleRescan(item.path)}
              onDelete={() => deleteHistoryItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
