import * as React from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-center text-sm font-medium leading-snug text-white transition hover:opacity-90 disabled:opacity-60 sm:text-base',
        className
      )}
      {...props}
    />
  );
}
