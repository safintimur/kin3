'use client';

import { TouchEvent, useRef } from 'react';
import { LeftPanel } from '@/components/layout/left-panel';
import { RightPanel } from '@/components/layout/right-panel';
import { cn } from '@/lib/utils';

interface MobilePeopleViewProps {
  detailOpen: boolean;
  onBack: () => void;
  onFindInTree: (personId: string) => void;
  onPersonOpen: (personId: string) => void;
}

export function MobilePeopleView({ detailOpen, onBack, onFindInTree, onPersonOpen }: MobilePeopleViewProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (dx > 70 && Math.abs(dy) < 45) {
      onBack();
    }
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div className={cn('h-full min-h-0 transition-opacity duration-200 ease-out', detailOpen && 'opacity-60')}>
        <LeftPanel onPersonOpen={onPersonOpen} />
      </div>
      <div
        className={cn(
          'absolute inset-y-0 h-full min-h-0 w-full transition-[left] duration-200 ease-out',
          detailOpen ? 'left-0' : 'left-full'
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <RightPanel onBack={onBack} onFindInTree={onFindInTree} />
      </div>
    </div>
  );
}
