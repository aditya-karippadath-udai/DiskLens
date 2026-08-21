import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from '../common/ToastContainer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40 relative">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
};
