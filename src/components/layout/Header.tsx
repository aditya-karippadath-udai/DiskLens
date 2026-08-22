import React from 'react';
import {
  Search,
  Settings,
  HardDrive,
  Cpu,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { setCommandPaletteOpen, setCurrentPage } = useAppStore();
  const { settings, setTheme } = useSettingsStore();

  const isLight = settings.theme === 'light';

  const toggleTheme = () => {
    if (isLight) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-4 z-20 shrink-0 transition-colors duration-150">
      {/* Left: Window decor & breadcrumb or title */}
      <div className="flex items-center gap-3">
        {/* Linux window dots decoration */}
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-slate-100">DiskLens</span>
          <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
            v2.4-linux
          </span>
        </div>
      </div>

      {/* Center: Global Command Palette search bar button */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/80 hover:bg-slate-850 hover:text-slate-200 border border-slate-700/60 rounded-lg transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition-colors" />
            <span>Search files, duplicate groups, directories...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
              Ctrl + K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Quick actions, system indicators & theme toggle */}
      <div className="flex items-center gap-2">
        {/* System Activity Widget (Linux telemetry simulation) */}
        <div className="hidden lg:flex items-center gap-3 px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>12%</span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>ext4</span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>4.2 MB/s</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
          title={isLight ? 'Switch to Dark theme' : 'Switch to Light theme'}
          className="relative text-slate-300 hover:text-slate-100"
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          )}
        </Button>

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentPage('settings')}
          aria-label="Open Settings"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-slate-400 hover:text-slate-100 transition-colors" />
        </Button>
      </div>
    </header>
  );
};
