import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        'h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3 text-base text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        className
      )}
    />
  )
);

Input.displayName = 'Input';
