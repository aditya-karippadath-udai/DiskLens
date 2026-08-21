import React from 'react';
import { ChevronRight, ArrowLeft, Home, Folder, HardDrive } from 'lucide-react';
import { Button } from '../common/Button';

interface DiskBreadcrumbProps {
  breadcrumbs: { name: string; path: string }[];
  onNavigate: (path: string) => void;
  onGoBack: () => void;
  canGoBack: boolean;
}

export const DiskBreadcrumb: React.FC<DiskBreadcrumbProps> = ({
  breadcrumbs,
  onNavigate,
  onGoBack,
  canGoBack,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          disabled={!canGoBack}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          title="Go to parent directory"
          className="shrink-0"
        >
          Up Level
        </Button>

        <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          const isRoot = crumb.path === '/';

          return (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}

              <button
                onClick={() => onNavigate(crumb.path)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  isLast
                    ? 'bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {isRoot ? (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                    <span>/ (root)</span>
                  </>
                ) : (
                  <>
                    <Folder className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{crumb.name}</span>
                  </>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
