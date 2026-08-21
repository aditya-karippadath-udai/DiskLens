import React, { useState } from 'react';
import { Button } from '../common/Button';
import { FolderX, Plus, X, Shield } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const IgnoredPathsEditor: React.FC = () => {
  const { settings, addIgnoredPath, removeIgnoredPath } = useSettingsStore();
  const [inputPath, setInputPath] = useState('');

  const handleAdd = () => {
    if (inputPath.trim()) {
      addIgnoredPath(inputPath.trim());
      setInputPath('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputPath}
            onChange={(e) => setInputPath(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. /mnt/backups or **/.venv/**"
            className="w-full px-3 py-2 text-xs font-mono bg-slate-950/60 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={!inputPath.trim()}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Path
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-800/80">
        {settings.ignoredPaths.map((path) => (
          <div
            key={path}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-300 group hover:border-slate-600"
          >
            <FolderX className="w-3 h-3 text-slate-400" />
            <span>{path}</span>
            <button
              onClick={() => removeIgnoredPath(path)}
              className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors ml-1"
              aria-label={`Remove ${path}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
