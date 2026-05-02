import * as React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
  hint?: string;
  label?: string;
}

export function Field({ children, className, error, hint, label }: FieldProps) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1.5', className)} data-invalid={error ? true : undefined}>
      {label && <span className="block text-sm font-medium text-slate-700">{label}</span>}
      {children}
      {error ? (
        <span className="block text-sm text-destructive">{error}</span>
      ) : hint ? (
        <span className="block text-sm text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}
