'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string | null;
  onDismiss?: () => void;
  tone?: 'danger' | 'info' | 'success';
}

const tones = {
  danger: 'border-red-200 bg-red-600 text-white',
  info: 'border-slate-200 bg-slate-900 text-white',
  success: 'border-emerald-200 bg-emerald-600 text-white'
};

export function Toast({ message, onDismiss, tone = 'info' }: ToastProps) {
  useEffect(() => {
    if (!message || !onDismiss) return;
    const timeout = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={cn('fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-lg lg:bottom-4', tones[tone])}>
      {message}
    </div>
  );
}
