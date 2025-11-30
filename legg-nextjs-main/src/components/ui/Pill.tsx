'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type PillVariant = 'default' | 'accent' | 'muted' | 'screens';

interface PillProps {
  variant?: PillVariant;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<PillVariant, string> = {
  default: 'bg-white/10 text-text',
  accent: 'bg-accent/20 text-accent',
  muted: 'bg-white/5 text-text-muted',
  screens: 'bg-job-lime/20 text-job-lime',
};

export function Pill({ variant = 'default', className, children }: PillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface VQPillProps {
  vquote: string;
  className?: string;
}

export function VQPill({ vquote, className }: VQPillProps) {
  if (!vquote) return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-1.5 py-0.5 rounded',
        'bg-white/20 text-[10px] font-bold',
        className
      )}
    >
      VQ{vquote}
    </span>
  );
}

interface HoursPillProps {
  scheduled: number;
  total: number;
  className?: string;
}

export function HoursPill({ scheduled, total, className }: HoursPillProps) {
  const isPartial = scheduled < total;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
        isPartial ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10',
        className
      )}
    >
      {isPartial ? `${scheduled.toFixed(1)}/${total}h` : `${total}h`}
    </span>
  );
}
