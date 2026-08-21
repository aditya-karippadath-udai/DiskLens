import { create } from 'zustand';
import { AppSettings } from '../types/settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  startMinimized: false,
  confirmBeforeDeletion: true,
  defaultMoveToTrash: true,
  allowPermanentDelete: false,
  showHiddenFiles: false,
  followSymlinks: false,
  scanSubdirectories: true,
  defaultMinSizeMB: 1,
  hashAlgorithm: 'sha256',
  parallelWorkers: 8,
  ignoredPaths: [
    '/proc',
    '/sys',
    '/dev',
    '/run',
    '/tmp',
    '/var/tmp',
    '/var/run',
    '**/node_modules/**',
    '**/.git/**',
    '**/.cache/**',
  ],
  enableDebugLogging: false,
  enableSoundEffects: true,
  autoCheckUpdates: true,
};

interface SettingsState {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  addIgnoredPath: (path: string) => void;
  removeIgnoredPath: (path: string) => void;
  resetToDefaults: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  // Initialize theme from storage or default
  const saved = typeof window !== 'undefined' ? localStorage.getItem('disklens_settings') : null;
  const initial: AppSettings = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;

  const applyTheme = (theme: 'dark' | 'light' | 'system') => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  // Apply initial theme
  if (typeof window !== 'undefined') {
    applyTheme(initial.theme);
  }

  const persist = (newSettings: AppSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('disklens_settings', JSON.stringify(newSettings));
    }
  };

  return {
    settings: initial,

    updateSetting: (key, value) => {
      set((state) => {
        const next = { ...state.settings, [key]: value };
        persist(next);
        if (key === 'theme') {
          applyTheme(value as 'dark' | 'light' | 'system');
        }
        return { settings: next };
      });
    },

    setTheme: (theme) => {
      get().updateSetting('theme', theme);
    },

    addIgnoredPath: (path) => {
      set((state) => {
        if (!path.trim() || state.settings.ignoredPaths.includes(path.trim())) return state;
        const next = {
          ...state.settings,
          ignoredPaths: [...state.settings.ignoredPaths, path.trim()],
        };
        persist(next);
        return { settings: next };
      });
    },

    removeIgnoredPath: (path) => {
      set((state) => {
        const next = {
          ...state.settings,
          ignoredPaths: state.settings.ignoredPaths.filter((p) => p !== path),
        };
        persist(next);
        return { settings: next };
      });
    },

    resetToDefaults: () => {
      persist(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme);
      set({ settings: DEFAULT_SETTINGS });
    },
  };
});
