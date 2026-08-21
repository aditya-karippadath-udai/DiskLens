import React, { useState, useRef } from 'react';
import {
  Folder,
  Home,
  HardDrive,
  Usb,
  Sparkles,
  Sliders,
  Layers,
  Link as LinkIcon,
  EyeOff,
  FolderSearch,
} from 'lucide-react';
import { useScanStore } from '../../store/scanStore';
import { useFilesystemStore } from '../../store/filesystemStore';
import { useAppStore } from '../../store/appStore';
import { ScanTargetType, HashAlgorithm } from '../../types/scan';
import { FileCategory } from '../../types/file';
import { Button } from '../common/Button';
import { clsx } from 'clsx';
import { scanBrowserDirectoryHandle } from '../../services/browserScanner';
import { formatBytes } from '../../data/mockData';

export const ScanConfigPanel: React.FC = () => {
  const { scanOptions, setScanOptions, setTargetType, startScan, scanProgress, setDuplicateGroups } = useScanStore();
  const { loadBrowserScanResult } = useFilesystemStore();
  const { addToast } = useAppStore();
  const [customPathInput, setCustomPathInput] = useState('/workspace');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isBrowserScanning, setIsBrowserScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetTypes: { type: ScanTargetType; label: string; path: string; icon: any }[] = [
    { type: 'home', label: 'Home / Workspace', path: '/workspace', icon: Home },
    { type: 'root', label: 'Root Filesystem', path: '/', icon: HardDrive },
    { type: 'external', label: 'External SSD', path: '/media', icon: Usb },
    { type: 'custom', label: 'Custom Path', path: customPathInput, icon: Folder },
  ];

  const categories: { cat: FileCategory; label: string }[] = [
    { cat: 'video', label: 'Videos' },
    { cat: 'audio', label: 'Audio' },
    { cat: 'image', label: 'Images' },
    { cat: 'archive', label: 'Archives' },
    { cat: 'document', label: 'Documents' },
    { cat: 'iso', label: 'ISOs' },
    { cat: 'code', label: 'Code' },
    { cat: 'other', label: 'Other' },
  ];

  const toggleCategory = (category: FileCategory) => {
    const current = scanOptions.fileCategories;
    if (current.includes(category)) {
      if (current.length > 1) {
        setScanOptions({ fileCategories: current.filter((c) => c !== category) });
      }
    } else {
      setScanOptions({ fileCategories: [...current, category] });
    }
  };

  const handlePickLocalFolder = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setIsBrowserScanning(true);
        addToast({
          type: 'info',
          title: 'Scanning Local Folder',
          message: `Reading files and computing SHA-256 hashes for "${dirHandle.name}"...`,
        });

        const result = await scanBrowserDirectoryHandle(dirHandle);
        loadBrowserScanResult(result);
        setDuplicateGroups(result.duplicates);

        setIsBrowserScanning(false);
        addToast({
          type: 'success',
          title: 'Scan Complete',
          message: `Scanned ${result.totalFiles} files (${formatBytes(result.totalBytes)}). Found ${result.duplicates.length} duplicate groups.`,
        });
      } catch (err: any) {
        setIsBrowserScanning(false);
        if (err.name !== 'AbortError') {
          addToast({
            type: 'error',
            title: 'Directory Access Error',
            message: err.message || 'Could not access the selected directory.',
          });
        }
      }
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isScanning = scanProgress.status === 'scanning' || scanProgress.status === 'paused' || isBrowserScanning;

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-6">
      {/* Target Directory Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Select Scan Location
          </label>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePickLocalFolder}
            disabled={isScanning}
            leftIcon={<FolderSearch className="w-3.5 h-3.5 text-sky-400" />}
            className="text-xs"
          >
            Pick Local Folder...
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            className="hidden"
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                // Read files list
                addToast({
                  type: 'info',
                  title: 'Folder Selected',
                  message: `Loaded ${e.target.files.length} files from local folder.`,
                });
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {targetTypes.map((target) => {
            const Icon = target.icon;
            const isSelected = scanOptions.targetType === target.type;

            return (
              <button
                key={target.type}
                onClick={() => setTargetType(target.type, customPathInput)}
                disabled={isScanning}
                className={clsx(
                  'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/40 text-slate-100 shadow-sm ring-1 ring-sky-500/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                )}
              >
                <div
                  className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                    isSelected
                      ? 'bg-sky-500/20 border-sky-500/30 text-sky-400'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold block truncate text-slate-200">{target.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{target.path}</span>
                </div>
              </button>
            );
          })}
        </div>

        {scanOptions.targetType === 'custom' && (
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={customPathInput}
              onChange={(e) => {
                setCustomPathInput(e.target.value);
                setScanOptions({ targetPath: e.target.value });
              }}
              disabled={isScanning}
              placeholder="/path/to/directory"
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={isScanning}
              onClick={() => setScanOptions({ targetPath: customPathInput })}
            >
              Set Path
            </Button>
          </div>
        )}
      </div>

      {/* File Category Filters */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            File Categories to Include
          </label>
          <button
            onClick={() => setScanOptions({ fileCategories: categories.map((c) => c.cat) })}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium"
          >
            Select All
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const isChecked = scanOptions.fileCategories.includes(c.cat);
            return (
              <button
                key={c.cat}
                onClick={() => toggleCategory(c.cat)}
                disabled={isScanning}
                className={clsx(
                  'px-3 py-1.5 text-xs rounded-lg border font-medium transition-all select-none',
                  isChecked
                    ? 'bg-slate-800 text-sky-400 border-sky-500/40 shadow-sm'
                    : 'bg-slate-950/30 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scanning Options & Toggles */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Scan Options & Rules</span>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:bg-slate-950/60">
            <input
              type="checkbox"
              checked={scanOptions.includeSubfolders}
              onChange={(e) => setScanOptions({ includeSubfolders: e.target.checked })}
              disabled={isScanning}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Include subfolders</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:bg-slate-950/60">
            <input
              type="checkbox"
              checked={scanOptions.ignoreHidden}
              onChange={(e) => setScanOptions({ ignoreHidden: e.target.checked })}
              disabled={isScanning}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
            <div className="flex items-center gap-1.5 text-slate-300">
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Ignore hidden files</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:bg-slate-950/60">
            <input
              type="checkbox"
              checked={scanOptions.followSymlinks}
              onChange={(e) => setScanOptions({ followSymlinks: e.target.checked })}
              disabled={isScanning}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
            <div className="flex items-center gap-1.5 text-slate-300">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Follow symlinks</span>
            </div>
          </label>
        </div>

        {/* Advanced section */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800 mt-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Minimum File Size Threshold
              </label>
              <select
                value={scanOptions.minSizeBytes}
                onChange={(e) => setScanOptions({ minSizeBytes: Number(e.target.value) })}
                disabled={isScanning}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value={100 * 1024}>100 KB</option>
                <option value={1024 * 1024}>1 MB (Recommended)</option>
                <option value={10 * 1024 * 1024}>10 MB</option>
                <option value={50 * 1024 * 1024}>50 MB</option>
                <option value={100 * 1024 * 1024}>100 MB</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Cryptographic Hash Algorithm
              </label>
              <select
                value={scanOptions.hashAlgorithm}
                onChange={(e) => setScanOptions({ hashAlgorithm: e.target.value as HashAlgorithm })}
                disabled={isScanning}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="sha256">SHA-256 (High Collision Resistance)</option>
                <option value="blake3">Blake3 (Ultra Fast Multithreaded)</option>
                <option value="md5">MD5 (Legacy Fast)</option>
                <option value="xxhash">xxHash64 (Extremely Fast Quick Check)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400 font-mono">
          Target: <span className="text-slate-200 font-medium">{scanOptions.targetPath}</span>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={startScan}
          disabled={isScanning}
          isLoading={isScanning}
          leftIcon={<Sparkles className="w-4 h-4" />}
          className="shadow-lg shadow-sky-500/25 px-6"
        >
          {isScanning ? 'Scan in Progress...' : 'Scan for Duplicates'}
        </Button>
      </div>
    </div>
  );
};
