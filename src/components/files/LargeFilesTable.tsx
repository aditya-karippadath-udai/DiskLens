import React, { useState, useMemo } from 'react';
import { FileItem, FileCategory } from '../../types/file';
import { CategoryBadge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  FolderOpen,
  Info,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../data/mockData';
import { filesystemService } from '../../services/filesystemService';
import { useAppStore } from '../../store/appStore';
import { useFilesystemStore } from '../../store/filesystemStore';
import { clsx } from 'clsx';

interface LargeFilesTableProps {
  files: FileItem[];
  onOpenFileDetails: (file: FileItem) => void;
  onRequestDelete: (file: FileItem) => void;
}

export const LargeFilesTable: React.FC<LargeFilesTableProps> = ({
  files,
  onOpenFileDetails,
  onRequestDelete,
}) => {
  const { addToast } = useAppStore();
  const {
    largeFilesThresholdMB,
    setLargeFilesThresholdMB,
    largeFilesCategoryFilter,
    setLargeFilesCategoryFilter,
    largeFilesSortBy,
    setLargeFilesSortBy,
  } = useFilesystemStore();

  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const thresholds = [
    { label: '> 100 MB', mb: 100 },
    { label: '> 500 MB', mb: 500 },
    { label: '> 1 GB', mb: 1024 },
    { label: '> 5 GB', mb: 5 * 1024 },
    { label: '> 10 GB', mb: 10 * 1024 },
  ];

  const categories: { cat: FileCategory | 'all'; label: string }[] = [
    { cat: 'all', label: 'All Types' },
    { cat: 'video', label: 'Videos' },
    { cat: 'iso', label: 'ISOs' },
    { cat: 'archive', label: 'Archives' },
    { cat: 'image', label: 'Images' },
    { cat: 'document', label: 'Documents' },
    { cat: 'other', label: 'Other' },
  ];

  // Filtering & Sorting
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((f) => f.size >= largeFilesThresholdMB * 1024 * 1024);

    if (largeFilesCategoryFilter !== 'all') {
      result = result.filter((f) => f.category === largeFilesCategoryFilter);
    }

    result.sort((a, b) => {
      switch (largeFilesSortBy) {
        case 'size_desc': return b.size - a.size;
        case 'size_asc': return a.size - b.size;
        case 'date_desc': return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'date_asc': return new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'type_asc': return a.type.localeCompare(b.type);
        default: return b.size - a.size;
      }
    });

    return result;
  }, [files, largeFilesThresholdMB, largeFilesCategoryFilter, largeFilesSortBy]);

  const handleReveal = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    await filesystemService.revealFile(path);
    addToast({
      type: 'info',
      title: 'File Manager',
      message: `Revealed file at: ${path}`,
    });
  };

  const toggleSelectAll = () => {
    if (selectedFileIds.size === filteredAndSortedFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredAndSortedFiles.map((f) => f.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedFileIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedFileIds(next);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Thresholds & Categories */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        {/* Size Threshold Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Size Threshold:
            </span>
            <div className="flex items-center gap-1.5">
              {thresholds.map((t) => (
                <button
                  key={t.mb}
                  onClick={() => setLargeFilesThresholdMB(t.mb)}
                  className={clsx(
                    'px-2.5 py-1 text-xs font-mono rounded-lg border transition-all',
                    largeFilesThresholdMB === t.mb
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <span className="text-xs text-slate-400 font-mono">
            Found <span className="text-slate-100 font-bold">{filteredAndSortedFiles.length}</span> heavy files
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Category:
          </span>
          {categories.map((c) => (
            <button
              key={c.cat}
              onClick={() => setLargeFilesCategoryFilter(c.cat)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-lg border transition-all font-medium',
                largeFilesCategoryFilter === c.cat
                  ? 'bg-slate-800 text-sky-400 border-sky-500/40'
                  : 'bg-slate-950/30 text-slate-400 border-slate-800 hover:border-slate-700'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredAndSortedFiles.length > 0 &&
                      selectedFileIds.size === filteredAndSortedFiles.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
                <th
                  className="p-3.5 cursor-pointer hover:text-slate-200"
                  onClick={() => setLargeFilesSortBy('name_asc')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>File Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 hidden md:table-cell">Location</th>
                <th
                  className="p-3.5 cursor-pointer hover:text-slate-200 text-right"
                  onClick={() =>
                    setLargeFilesSortBy(largeFilesSortBy === 'size_desc' ? 'size_asc' : 'size_desc')
                  }
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Size</span>
                    {largeFilesSortBy === 'size_desc' ? (
                      <ArrowDown className="w-3 h-3 text-sky-400" />
                    ) : (
                      <ArrowUp className="w-3 h-3 text-sky-400" />
                    )}
                  </div>
                </th>
                <th className="p-3.5 hidden sm:table-cell">Type</th>
                <th
                  className="p-3.5 hidden lg:table-cell cursor-pointer hover:text-slate-200"
                  onClick={() =>
                    setLargeFilesSortBy(largeFilesSortBy === 'date_desc' ? 'date_asc' : 'date_desc')
                  }
                >
                  <div className="flex items-center gap-1.5">
                    <span>Modified</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 text-right w-28">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-850/60 font-mono">
              {filteredAndSortedFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-sans">
                    No files found matching the selected threshold and category.
                  </td>
                </tr>
              ) : (
                filteredAndSortedFiles.map((file) => {
                  const isSelected = selectedFileIds.has(file.id);

                  return (
                    <tr
                      key={file.id}
                      onClick={() => onOpenFileDetails(file)}
                      className={clsx(
                        'hover:bg-slate-850/50 cursor-pointer transition-colors group',
                        isSelected && 'bg-sky-500/5'
                      )}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(file.id)}
                          className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5 font-semibold text-slate-200 max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{file.name}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-400 max-w-sm truncate hidden md:table-cell">
                        {file.path}
                      </td>

                      <td className="p-3.5 text-right font-bold text-slate-100">
                        {formatBytes(file.size)}
                      </td>

                      <td className="p-3.5 hidden sm:table-cell">
                        <CategoryBadge category={file.category} />
                      </td>

                      <td className="p-3.5 text-slate-400 hidden lg:table-cell">
                        {formatDate(file.modifiedAt)}
                      </td>

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleReveal(e, file.path)}
                            title="Reveal in File Manager"
                            aria-label="Reveal in File Manager"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenFileDetails(file)}
                            title="View File Details"
                            aria-label="View File Details"
                          >
                            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRequestDelete(file)}
                            title="Safe Delete File"
                            aria-label="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400 hover:text-rose-300" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
