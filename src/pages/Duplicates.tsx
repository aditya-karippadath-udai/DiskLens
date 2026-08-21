import React, { useState } from 'react';
import { useScanStore } from '../store/scanStore';
import { useAppStore } from '../store/appStore';
import { useSettingsStore } from '../store/settingsStore';
import { ScanConfigPanel } from '../components/scanning/ScanConfigPanel';
import { ScanProgressBar } from '../components/scanning/ScanProgressBar';
import { DuplicateGroupCard } from '../components/duplicates/DuplicateGroupCard';
import { DuplicateStatsBar } from '../components/duplicates/DuplicateStatsBar';
import { DuplicateDetailsModal } from '../components/duplicates/DuplicateDetailsModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { DuplicateGroup } from '../types/file';
import { filesystemService } from '../services/filesystemService';
import { duplicateService } from '../services/duplicateService';
import { Copy, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes } from '../data/mockData';

export const DuplicatesPage: React.FC = () => {
  const {
    scanProgress,
    duplicateGroups,
    pendingDeleteFiles,
    applyDuplicateStrategy,
    toggleFileSelection,
    setOriginalFile,
    isDeleteDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDeletion,
    restoreDeleted,
    startScan,
  } = useScanStore();

  const { addToast } = useAppStore();
  const { settings } = useSettingsStore();

  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);

  const isScanning = scanProgress.status === 'scanning' || scanProgress.status === 'paused';

  const totalDuplicateFiles = duplicateGroups.reduce((acc, g) => acc + g.files.length, 0);
  const totalRecoverableBytes = duplicateGroups.reduce((acc, g) => acc + g.recoverableSize, 0);

  const handleDeleteConfirm = async (permanent: boolean) => {
    const { count, bytes, paths } = await confirmDeletion(permanent);
    await filesystemService.deleteFiles(paths, permanent, bytes);

    // Launch celebratory confetti when reclaiming significant space!
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignored in non-DOM canvas contexts
    }

    addToast({
      type: 'success',
      title: `${count} Duplicate Files ${permanent ? 'Permanently Deleted' : 'Moved to Trash'}`,
      message: `${formatBytes(bytes)} of disk space can now be reclaimed.`,
      action: !permanent
        ? {
            label: 'Undo',
            onClick: () => {
              restoreDeleted(paths);
              addToast({
                type: 'info',
                title: 'Restoration Complete',
                message: 'Restored deleted duplicate files back to original paths.',
              });
            },
          }
        : undefined,
      duration: 6000,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Duplicate File Finder
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Find identical files through SHA-256 cryptographic hashing and safely reclaim storage.
          </p>
        </div>
      </div>

      {/* Top Configuration / Target Picker */}
      <ScanConfigPanel />

      {/* Live Scanning Progress Monitor */}
      {isScanning && <ScanProgressBar />}

      {/* Duplicate Results List or Empty State */}
      {duplicateGroups.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <EmptyState
            icon={CheckCircle2}
            title="Your files look clean."
            description="No duplicate files were found in the scanned location. Your filesystem storage is fully optimized."
            actionLabel="Run New Scan"
            onAction={startScan}
            actionIcon={<Sparkles className="w-4 h-4" />}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Duplicate Files Found ({duplicateGroups.length} Groups)
            </h3>
          </div>

          {/* Stats Bar with Auto-selection rules & Delete trigger */}
          <DuplicateStatsBar
            totalGroups={duplicateGroups.length}
            totalFiles={totalDuplicateFiles}
            recoverableBytes={totalRecoverableBytes}
            selectedCount={pendingDeleteFiles.count}
            selectedBytes={pendingDeleteFiles.bytes}
            onApplyStrategy={applyDuplicateStrategy}
            onDeleteClick={openDeleteDialog}
          />

          {/* Duplicate Groups List */}
          <div className="space-y-3">
            {duplicateGroups.map((group, idx) => (
              <DuplicateGroupCard
                key={group.id}
                group={group}
                index={idx}
                onToggleSelect={(fileId) => toggleFileSelection(group.id, fileId)}
                onSetOriginal={(fileId) => setOriginalFile(group.id, fileId)}
                onOpenDetails={() => setSelectedGroup(group)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      <DuplicateDetailsModal
        isOpen={Boolean(selectedGroup)}
        onClose={() => setSelectedGroup(null)}
        group={selectedGroup}
        onToggleSelect={(fileId) => {
          if (selectedGroup) {
            toggleFileSelection(selectedGroup.id, fileId);
            const updated = duplicateGroups.find((g) => g.id === selectedGroup.id);
            if (updated) setSelectedGroup(updated);
          }
        }}
        onSetOriginal={(fileId) => {
          if (selectedGroup) {
            setOriginalFile(selectedGroup.id, fileId);
            const updated = duplicateGroups.find((g) => g.id === selectedGroup.id);
            if (updated) setSelectedGroup(updated);
          }
        }}
      />

      {/* Safe Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${pendingDeleteFiles.count} Duplicate Files?`}
        fileCount={pendingDeleteFiles.count}
        totalBytes={pendingDeleteFiles.bytes}
        samplePaths={pendingDeleteFiles.paths}
        allowPermanentDeleteSetting={settings.allowPermanentDelete}
      />
    </div>
  );
};
