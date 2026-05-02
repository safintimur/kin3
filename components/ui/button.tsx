import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary: 'border border-border bg-white text-slate-900 shadow-sm hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
  icon: 'bg-white text-slate-700 shadow-sm ring-1 ring-border hover:bg-slate-50'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, disabled, loading, size = 'md', variant = 'primary', ...props }, ref) => {
    const iconOnly = variant === 'icon';

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex min-w-0 items-center justify-center gap-2 rounded-lg font-medium leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55',
          variants[variant],
          iconOnly ? 'h-10 w-10 p-0' : sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
