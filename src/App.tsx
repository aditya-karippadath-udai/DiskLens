/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from './store/appStore';
import { useSettingsStore } from './store/settingsStore';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { DashboardPage } from './pages/Dashboard';
import { DuplicatesPage } from './pages/Duplicates';
import { DiskUsagePage } from './pages/DiskUsage';
import { LargeFilesPage } from './pages/LargeFiles';
import { ScanHistoryPage } from './pages/ScanHistory';
import { SettingsPage } from './pages/Settings';

export default function App() {
  const { currentPage } = useAppStore();
  const { settings } = useSettingsStore();

  // Apply dark/light class on document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'duplicates':
        return <DuplicatesPage />;
      case 'disk-usage':
        return <DiskUsagePage />;
      case 'large-files':
        return <LargeFilesPage />;
      case 'history':
        return <ScanHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppLayout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 14, scale: 0.995, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, scale: 0.995, filter: 'blur(4px)' }}
          transition={{
            duration: 0.26,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full flex-1 flex flex-col"
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}

