import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  label: string;
  side?: 'bottom' | 'top';
}

export function Tooltip({ children, label, side = 'top' }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-within:block',
          side === 'top' ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'
        )}
      >
        {label}
      </span>
    </span>
  );
}
