import React, { useState } from 'react';
import { useFilesystemStore } from '../store/filesystemStore';
import { useAppStore } from '../store/appStore';
import { useSettingsStore } from '../store/settingsStore';
import { LargeFilesTable } from '../components/files/LargeFilesTable';
import { FileDetailsModal } from '../components/files/FileDetailsModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FileItem } from '../types/file';
import { filesystemService } from '../services/filesystemService';
import { formatBytes } from '../data/mockData';

export const LargeFilesPage: React.FC = () => {
  const { largeFiles, deleteLargeFile } = useFilesystemStore();
  const { addToast } = useAppStore();
  const { settings } = useSettingsStore();

  const [inspectingFile, setInspectingFile] = useState<FileItem | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (permanent: boolean) => {
    if (!fileToDelete) return;
    setIsDeleting(true);

    try {
      await filesystemService.deleteFiles([fileToDelete.path], permanent, fileToDelete.size);
      deleteLargeFile(fileToDelete.id);

      addToast({
        type: 'success',
        title: `File ${permanent ? 'Permanently Deleted' : 'Moved to Trash'}`,
        message: `${fileToDelete.name} (${formatBytes(fileToDelete.size)}) has been removed.`,
      });
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Large Files</h2>
          <p className="text-xs text-slate-400 mt-1">
            Identify disk hogs, heavy virtual machine disk images, archives, and uncompressed media.
          </p>
        </div>
      </div>

      {/* Large Files Table with Threshold Filters */}
      <LargeFilesTable
        files={largeFiles}
        onOpenFileDetails={(file) => setInspectingFile(file)}
        onRequestDelete={(file) => setFileToDelete(file)}
      />

      {/* POSIX Metadata Inspector Modal */}
      <FileDetailsModal
        isOpen={Boolean(inspectingFile)}
        onClose={() => setInspectingFile(null)}
        file={inspectingFile}
        onDeleteClick={(file) => setFileToDelete(file)}
      />

      {/* Safe File Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleDelete}
        title={`Delete Large File?`}
        fileCount={1}
        totalBytes={fileToDelete?.size || 0}
        samplePaths={fileToDelete ? [fileToDelete.path] : []}
        allowPermanentDeleteSetting={settings.allowPermanentDelete}
      />
    </div>
  );
};
