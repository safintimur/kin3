'use client';

import * as React from 'react';
import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  value?: string | null;
  onValueChange: (value: string | null) => void;
}

function formatDisplay(value?: string | null) {
  if (!value) return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${match[3]}.${match[2]}.${match[1]}`;
}

function formatTypedValue(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function parseDisplay(value: string) {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    year >= 1000 &&
    year <= 9999;

  return isValid ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

export function DateInput({ className, onBlur, onFocus, onValueChange, value, ...props }: DateInputProps) {
  const [display, setDisplay] = React.useState(() => formatDisplay(value));
  const [isFocused, setIsFocused] = React.useState(false);
  const isComplete = display.length === 10;
  const isInvalid = isComplete && !parseDisplay(display);

  React.useEffect(() => {
    if (!isFocused) {
      setDisplay(formatDisplay(value));
    }
  }, [isFocused, value]);

  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <Input
        {...props}
        aria-invalid={isInvalid || props['aria-invalid']}
        className={cn('pl-10 font-mono tabular-nums', className)}
        inputMode="numeric"
        maxLength={10}
        placeholder={props.placeholder ?? 'дд.мм.гггг'}
        type="text"
        value={display}
        onBlur={(event) => {
          setIsFocused(false);
          if (!parseDisplay(event.currentTarget.value)) {
            setDisplay(formatDisplay(value));
          }
          onBlur?.(event);
        }}
        onChange={(event) => {
          const nextDisplay = formatTypedValue(event.target.value);
          setDisplay(nextDisplay);
          onValueChange(nextDisplay ? parseDisplay(nextDisplay) : null);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
      />
    </div>
  );
}
