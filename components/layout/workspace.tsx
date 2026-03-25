'use client';

import { useEffect } from 'react';
import { LeftPanel } from '@/components/layout/left-panel';
import { RightPanel } from '@/components/layout/right-panel';
import { TreeCanvas } from '@/features/tree/tree-canvas';
import { loadFamilyData } from '@/lib/family-repository';
import { useFamilyStore } from '@/store/family-store';

export function FamilyWorkspace() {
  const setInitial = useFamilyStore((s) => s.setInitial);

  useEffect(() => {
    loadFamilyData().then((data) => {
      setInitial(data.tree, data.persons, data.relationships);
    });
  }, [setInitial]);

  return (
    <main className="h-screen p-3 md:p-4">
      <div className="grid h-full gap-3 md:grid-cols-[280px_1fr_340px]">
        <div className="h-[35vh] md:h-full"><LeftPanel /></div>
        <div className="h-[45vh] md:h-full"><TreeCanvas /></div>
        <div className="h-[35vh] md:h-full"><RightPanel /></div>
      </div>
    </main>
  );
}
