import { create } from 'zustand';

export type AppPage =
  | 'dashboard'
  | 'duplicates'
  | 'disk-usage'
  | 'large-files'
  | 'history'
  | 'settings';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface AppState {
  currentPage: AppPage;
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  activeDetailsModal: {
    type: 'file' | 'duplicate_group' | 'scan_history';
    data: any;
  } | null;
  toasts: ToastItem[];

  // Actions
  setCurrentPage: (page: AppPage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openDetailsModal: (type: 'file' | 'duplicate_group' | 'scan_history', data: any) => void;
  closeDetailsModal: () => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  activeDetailsModal: null,
  toasts: [],

  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  openDetailsModal: (type, data) => set({ activeDetailsModal: { type, data } }),
  closeDetailsModal: () => set({ activeDetailsModal: null }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 5000);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
