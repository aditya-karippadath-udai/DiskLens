import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'sky' | 'indigo' | 'emerald' | 'amber' | 'rose';
  onClick?: () => void;
  actionText?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'sky',
  onClick,
  actionText,
  badge,
}) => {
  const variantStyles = {
    sky: 'border-sky-500/20 from-sky-500/10 to-transparent text-sky-400',
    indigo: 'border-indigo-500/20 from-indigo-500/10 to-transparent text-indigo-400',
    emerald: 'border-emerald-500/20 from-emerald-500/10 to-transparent text-emerald-400',
    amber: 'border-amber-500/20 from-amber-500/10 to-transparent text-amber-400',
    rose: 'border-rose-500/20 from-rose-500/10 to-transparent text-rose-400',
  };

  const iconBgStyles = {
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-5 rounded-2xl bg-gradient-to-br bg-slate-900/60 border backdrop-blur-md transition-all duration-200 group relative flex flex-col justify-between',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:border-slate-600 hover:shadow-xl hover:scale-[1.01]'
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', iconBgStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {badge}
            </span>
          )}
        </div>

        <span className="text-xs font-medium text-slate-400 block">{title}</span>
        <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1 tracking-tight">{value}</h3>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate">{subtitle}</span>
        {actionText && (
          <span className="font-semibold flex items-center gap-1 text-slate-300 group-hover:text-sky-400 transition-colors shrink-0">
            {actionText}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        )}
      </div>
    </div>
  );
};
