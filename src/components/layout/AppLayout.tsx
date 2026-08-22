import React from 'react';
import { motion } from 'motion/react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from '../common/ToastContainer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans relative selection:bg-sky-500/30 selection:text-sky-200">
      {/* Ambient Glassmorphic Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-sky-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] bg-indigo-600/10 rounded-full blur-[90px]" />
        <div className="absolute -bottom-40 left-1/4 w-[34rem] h-[34rem] bg-cyan-500/8 rounded-full blur-[110px]" />
      </div>

      {/* Top Header with smooth slide-down entrance */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="z-20 shrink-0"
      >
        <Header />
      </motion.div>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar with slide-in entrance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="h-full shrink-0 z-10"
        >
          <Sidebar />
        </motion.div>

        {/* Main Content Viewport with subtle glassmorphic backdrop */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40 backdrop-blur-xl relative flex flex-col">
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 min-h-full flex-1 flex flex-col">
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

