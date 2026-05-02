import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        'min-h-24 w-full min-w-0 rounded-lg border border-input bg-white px-3 py-2 text-base text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        className
      )}
    />
  )
);

Textarea.displayName = 'Textarea';
