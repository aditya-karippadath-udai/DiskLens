import React from 'react';
import { StorageDrive } from '../../types/disk';
import { HardDrive, Check, Usb, Server } from 'lucide-react';
import { formatBytes } from '../../data/mockData';
import { clsx } from 'clsx';

interface DriveSelectorProps {
  drives: StorageDrive[];
  selectedDriveId: string;
  onSelectDrive: (id: string) => void;
}

export const DriveSelector: React.FC<DriveSelectorProps> = ({
  drives,
  selectedDriveId,
  onSelectDrive,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {drives.map((drive) => {
        const isSelected = drive.id === selectedDriveId;
        const usedPercent = Math.round((drive.usedBytes / drive.totalBytes) * 100);

        return (
          <button
            key={drive.id}
            onClick={() => onSelectDrive(drive.id)}
            className={clsx(
              'flex items-start gap-3.5 p-3.5 rounded-xl text-left transition-all border relative',
              isSelected
                ? 'bg-slate-850 border-sky-500/50 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            )}
          >
            <div
              className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5',
                isSelected
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              )}
            >
              {drive.type === 'root' ? (
                <Server className="w-4 h-4" />
              ) : drive.type === 'external' ? (
                <Usb className="w-4 h-4" />
              ) : (
                <HardDrive className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{drive.name}</h4>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1" />}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{drive.devicePath}</p>
              
              {/* Progress bar mini */}
              <div className="mt-2.5 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{formatBytes(drive.usedBytes, 0)} used</span>
                  <span>{formatBytes(drive.totalBytes, 0)}</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-300',
                      usedPercent > 90
                        ? 'bg-rose-500'
                        : usedPercent > 75
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    )}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
