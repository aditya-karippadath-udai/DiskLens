import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useAppStore } from '../store/appStore';
import { IgnoredPathsEditor } from '../components/settings/IgnoredPathsEditor';
import { Button } from '../components/common/Button';
import {
  Sliders,
  Shield,
  Palette,
  HardDrive,
  AlertTriangle,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsPage: React.FC = () => {
  const { settings, updateSetting, resetToDefaults } = useSettingsStore();
  const { addToast } = useAppStore();

  const handleReset = () => {
    resetToDefaults();
    addToast({
      type: 'info',
      title: 'Settings Reset',
      message: 'Restored all application preferences to default values.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Preferences</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure scanning engine heuristics, safety safeguards, and desktop appearance.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Restore Defaults
        </Button>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Appearance & Interface
          </h3>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Desktop Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark Mode (Default)', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System GTK / Qt', icon: Monitor },
            ].map((theme) => {
              const Icon = theme.icon;
              const isSelected = settings.theme === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => updateSetting('theme', theme.id as any)}
                  className={clsx(
                    'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 ring-1 ring-sky-500/30'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium truncate">{theme.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. File Scanning Engine */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Scanning Engine & Hashing
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Default Hash Algorithm
            </label>
            <select
              value={settings.hashAlgorithm}
              onChange={(e) => updateSetting('hashAlgorithm', e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="sha256">SHA-256 (Highest collision resistance)</option>
              <option value="blake3">Blake3 (Ultra-fast multicore hashing)</option>
              <option value="md5">MD5 (Fast legacy fallback)</option>
              <option value="xxhash">xxHash64 (Preliminary fast filter)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Parallel Worker Threads
            </label>
            <select
              value={settings.parallelWorkers}
              onChange={(e) => updateSetting('parallelWorkers', Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value={2}>2 Threads</option>
              <option value={4}>4 Threads</option>
              <option value={8}>8 Threads (Recommended for multi-core)</option>
              <option value={16}>16 Threads (High-end NVMe)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Recursively Traverse Subdirectories
              </span>
              <span className="text-[11px] text-slate-400">
                Index all nested folders automatically during filesystem scans
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.scanSubdirectories}
              onChange={(e) => updateSetting('scanSubdirectories', e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Follow Symbolic Links
              </span>
              <span className="text-[11px] text-slate-400">
                Follow symlinked directories into real filesystem paths (with cycle prevention)
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.followSymlinks}
              onChange={(e) => updateSetting('followSymlinks', e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Show Hidden Dotfiles
              </span>
              <span className="text-[11px] text-slate-400">
                Scan Unix hidden files starting with . (e.g. .cache, .config)
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.showHiddenFiles}
              onChange={(e) => updateSetting('showHiddenFiles', e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
          </label>
        </div>
      </div>

      {/* 3. Ignored Filesystem Locations */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Ignored Locations & System Folders
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {settings.ignoredPaths.length} protected paths
          </span>
        </div>
        <p className="text-xs text-slate-400">
          The scanner will completely bypass these virtual or high-churn directories for safety and performance.
        </p>

        <IgnoredPathsEditor />
      </div>

      {/* 4. Safety & Destruction Controls */}
      <div className="p-5 bg-slate-900/60 border border-rose-500/20 rounded-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Safety & Deletion Safeguards
          </h3>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Require Confirmation Before Any Deletion
              </span>
              <span className="text-[11px] text-slate-400">
                Always prompt with summary dialog and affected file list before executing
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.confirmBeforeDeletion}
              onChange={(e) => updateSetting('confirmBeforeDeletion', e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/30 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-rose-300 block">
                Enable Permanent Deletion Bypass
              </span>
              <span className="text-[11px] text-rose-400/80">
                Adds a checkbox to permanently delete files (shred/unlink) without moving to Trash
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.allowPermanentDelete}
              onChange={(e) => updateSetting('allowPermanentDelete', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 bg-slate-900 border-slate-700 focus:ring-rose-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
