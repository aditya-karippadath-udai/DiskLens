/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useSettingsStore } from './store/settingsStore';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/layout/CommandPalette';

// Pages
import { DashboardPage } from './pages/Dashboard';
import { DuplicatesPage } from './pages/Duplicates';
import { DiskUsagePage } from './pages/DiskUsage';
import { LargeFilesPage } from './pages/LargeFiles';
import { ScanHistoryPage } from './pages/ScanHistory';
import { SettingsPage } from './pages/Settings';

export default function App() {
  const { currentPage, toasts, removeToast } = useAppStore();
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
    <>
      <AppLayout>{renderCurrentPage()}</AppLayout>
      <CommandPalette />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
