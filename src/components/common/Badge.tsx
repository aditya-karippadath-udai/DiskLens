import React from 'react';
import { clsx } from 'clsx';
import { FileCategory } from '../../types/file';
import {
  Film,
  Music,
  Image as ImageIcon,
  Archive,
  FileText,
  Binary,
  Disc,
  Code2,
  FileQuestion,
} from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  className,
}) => {
  const variants = {
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    accent: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border tracking-wide select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: FileCategory; className?: string }> = ({
  category,
  className,
}) => {
  const getCategoryConfig = (cat: FileCategory) => {
    switch (cat) {
      case 'video':
        return { label: 'Video', icon: <Film className="w-3 h-3" />, variant: 'info' as const };
      case 'audio':
        return { label: 'Audio', icon: <Music className="w-3 h-3" />, variant: 'accent' as const };
      case 'image':
        return { label: 'Image', icon: <ImageIcon className="w-3 h-3" />, variant: 'success' as const };
      case 'archive':
        return { label: 'Archive', icon: <Archive className="w-3 h-3" />, variant: 'warning' as const };
      case 'iso':
        return { label: 'ISO Image', icon: <Disc className="w-3 h-3" />, variant: 'danger' as const };
      case 'document':
        return { label: 'Document', icon: <FileText className="w-3 h-3" />, variant: 'neutral' as const };
      case 'code':
        return { label: 'Source Code', icon: <Code2 className="w-3 h-3" />, variant: 'info' as const };
      case 'application':
        return { label: 'Binary', icon: <Binary className="w-3 h-3" />, variant: 'accent' as const };
      default:
        return { label: 'Other', icon: <FileQuestion className="w-3 h-3" />, variant: 'neutral' as const };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <Badge variant={config.variant} icon={config.icon} className={className}>
      {config.label}
    </Badge>
  );
};
