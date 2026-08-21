import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutDashboard,
  Copy,
  PieChart,
  HardDrive,
  History,
  Settings,
  Sparkles,
  FileText,
  Trash2,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import { useAppStore, AppPage } from '../../store/appStore';
import { useFilesystemStore } from '../../store/filesystemStore';
import { useScanStore } from '../../store/scanStore';
import { formatBytes } from '../../data/mockData';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setCurrentPage, addToast } = useAppStore();
  const { largeFiles, setSelectedFileItem } = useFilesystemStore();
  const { duplicateGroups, startScan } = useScanStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Filtered items
  const navigationItems = [
    { id: 'nav-dash', title: 'Go to Dashboard', category: 'Navigation', icon: <LayoutDashboard className="w-4 h-4 text-sky-400" />, action: () => setCurrentPage('dashboard') },
    { id: 'nav-dups', title: 'Go to Duplicate Finder', category: 'Navigation', icon: <Copy className="w-4 h-4 text-indigo-400" />, action: () => setCurrentPage('duplicates') },
    { id: 'nav-disk', title: 'Go to Disk Space Visualizer', category: 'Navigation', icon: <PieChart className="w-4 h-4 text-emerald-400" />, action: () => setCurrentPage('disk-usage') },
    { id: 'nav-large', title: 'Go to Large Files Analysis', category: 'Navigation', icon: <HardDrive className="w-4 h-4 text-amber-400" />, action: () => setCurrentPage('large-files') },
    { id: 'nav-hist', title: 'Go to Scan History', category: 'Navigation', icon: <History className="w-4 h-4 text-purple-400" />, action: () => setCurrentPage('history') },
    { id: 'nav-set', title: 'Go to Settings', category: 'Navigation', icon: <Settings className="w-4 h-4 text-slate-400" />, action: () => setCurrentPage('settings') },
    { id: 'act-scan', title: 'Start New Filesystem Scan', category: 'Actions', icon: <Sparkles className="w-4 h-4 text-sky-400" />, action: () => { setCurrentPage('duplicates'); startScan(); addToast({ type: 'info', title: 'Scan Initiated', message: 'Analyzing filesystem for duplicates and space reclaim...' }); } },
  ];

  const fileResults = largeFiles
    .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()) || f.path.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4)
    .map((f) => ({
      id: `file-${f.id}`,
      title: f.name,
      subtitle: `${f.path} • ${formatBytes(f.size)}`,
      category: 'Large Files',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      action: () => {
        setCurrentPage('large-files');
        setSelectedFileItem(f);
      },
    }));

  const duplicateResults = duplicateGroups
    .flatMap((g) => g.files)
    .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()) || f.path.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4)
    .map((f) => ({
      id: `dup-${f.id}`,
      title: f.name,
      subtitle: `Duplicate Group • ${f.path} (${formatBytes(f.size)})`,
      category: 'Duplicate Files',
      icon: <Copy className="w-4 h-4 text-indigo-400" />,
      action: () => {
        setCurrentPage('duplicates');
      },
    }));

  const filteredNav = navigationItems.filter(
    (item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = query.trim() ? [...filteredNav, ...fileResults, ...duplicateResults] : navigationItems;

  const handleSelect = (index: number) => {
    const item = allResults[index];
    if (item) {
      item.action();
      setCommandPaletteOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-2xl z-10 text-slate-100 divide-y divide-slate-800/80"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 gap-3 bg-slate-950/40">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, file name, path, or duplicate..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 shrink-0">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {allResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching files or commands found for "{query}"
                </div>
              ) : (
                allResults.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-xs ${
                      selectedIndex === idx
                        ? 'bg-sky-500/15 text-sky-200 border border-sky-500/30'
                        : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200 truncate">{item.title}</p>
                        {'subtitle' in item && item.subtitle && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      {selectedIndex === idx && <ArrowRight className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/60 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <span className="font-mono text-slate-400">DiskLens Command System</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
