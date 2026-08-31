import React from 'react';
import {
  LayoutDashboard,
  Copy,
  PieChart,
  HardDrive,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Disc3,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore, AppPage } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Tooltip } from '../common/Tooltip';
import { clsx } from 'clsx';
import appLogo from '../../assets/Icon.png';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, isSidebarCollapsed, toggleSidebar } = useAppStore();
  const { settings } = useSettingsStore();

  const navigationItems = [
    {
      id: 'dashboard' as AppPage,
      label: 'Dashboard',
      description: 'Storage overview & health',
      icon: LayoutDashboard,
    },
    {
      id: 'duplicates' as AppPage,
      label: 'Duplicate Finder',
      description: 'Find & purge clone files',
      icon: Copy,
      badge: '42',
    },
    {
      id: 'disk-usage' as AppPage,
      label: 'Disk Visualizer',
      description: 'Interactive space treemap',
      icon: PieChart,
    },
    {
      id: 'large-files' as AppPage,
      label: 'Large Files',
      description: 'Heavy files analyzer',
      icon: HardDrive,
      badge: '12',
    },
    {
      id: 'history' as AppPage,
      label: 'Scan History',
      description: 'Past reports & logs',
      icon: History,
    },
    {
      id: 'settings' as AppPage,
      label: 'Settings',
      description: 'Engine & filters setup',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={clsx(
        'h-full bg-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-200 ease-in-out shrink-0 z-10 select-none backdrop-blur-xl',
        isSidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/60 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-1 shadow-md shadow-sky-500/10 shrink-0 overflow-hidden">
              <img
                src={appLogo}
                alt="DiskLens Logo"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== window.location.origin + '/Icon.png') {
                    target.src = '/Icon.png';
                  }
                }}
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-slate-100 leading-none">DiskLens</h1>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Linux Storage Suite</p>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-1 mt-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            const buttonContent = (
              <button
                onClick={() => setCurrentPage(item.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 relative group',
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent'
                )}
              >
                <Icon
                  className={clsx(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                {!isSidebarCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <span className="truncate block font-semibold text-slate-200">{item.label}</span>
                  </div>
                )}
                {!isSidebarCollapsed && item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded-full border shrink-0',
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full" />
                )}
              </button>
            );

            return isSidebarCollapsed ? (
              <Tooltip key={item.id} content={item.label} side="right">
                {buttonContent}
              </Tooltip>
            ) : (
              <div key={item.id}>{buttonContent}</div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mount Status / Engine Info */}
      <div className="p-3 border-t border-slate-800/60">
        {!isSidebarCollapsed ? (
          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engine Ready</span>
              </div>
              <span className="text-slate-400 font-mono">Tauri / POSIX</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>NVMe /root</span>
                <span>63.8% used</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full w-[63.8%]" />
              </div>
            </div>
          </div>
        ) : (
          <Tooltip content="NVMe Root Filesystem (63.8% used)" side="right">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};
