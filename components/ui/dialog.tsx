'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DialogProps {
  children: React.ReactNode;
  description?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

export function Dialog({ children, description, onOpenChange, open, title }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-4 shadow-xl">
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 break-words text-sm text-slate-500">{description}</p>}
          </div>
          <Button aria-label="Закрыть" size="sm" type="button" variant="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}

interface SheetProps extends DialogProps {
  side?: 'bottom' | 'right';
}

export function Sheet({ children, description, onOpenChange, open, side = 'right', title }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/35">
      <section
        className={cn(
          'flex min-w-0 flex-col border-border bg-white shadow-xl',
          side === 'bottom'
            ? 'mt-auto max-h-[92dvh] w-full rounded-t-xl border-t p-4'
            : 'ml-auto h-full w-full max-w-md border-l p-4'
        )}
      >
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold">{title}</h2>
            {description && <p className="mt-1 break-words text-sm text-slate-500">{description}</p>}
          </div>
          <Button aria-label="Закрыть" size="sm" type="button" variant="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </section>
    </div>
  );
}
