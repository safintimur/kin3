import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('h-11 w-full min-w-0 rounded-xl border border-border px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30', props.className)} />;
}
