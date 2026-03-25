import * as React from 'react';
import { cn } from '@/lib/utils';

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('min-h-24 w-full rounded-xl border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/30', props.className)} />;
}
