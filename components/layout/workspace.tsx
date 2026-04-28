'use client';

import { useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth/auth-gate';
import { LeftPanel } from '@/components/layout/left-panel';
import { RightPanel } from '@/components/layout/right-panel';
import { Card } from '@/components/ui/card';
import { TreeCanvas } from '@/features/tree/tree-canvas';
import { loadFamilyData } from '@/lib/family-repository';
import { useFamilyStore } from '@/store/family-store';

export function FamilyWorkspace() {
  return (
    <AuthGate>
      <FamilyWorkspaceContent />
    </AuthGate>
  );
}

function FamilyWorkspaceContent() {
  const [loading, setLoading] = useState(true);
  const setInitial = useFamilyStore((s) => s.setInitial);
  const setError = useFamilyStore((s) => s.setError);
  const error = useFamilyStore((s) => s.error);

  useEffect(() => {
    loadFamilyData()
      .then((data) => {
        setInitial(data.tree, data.persons, data.relationships);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить данные');
      })
      .finally(() => setLoading(false));
  }, [setError, setInitial]);

  return (
    <main className="min-h-dvh p-3 md:p-4 lg:h-dvh">
      {loading ? (
        <Card className="flex min-h-[calc(100dvh-1.5rem)] items-center justify-center p-4 text-center text-slate-500 md:min-h-[calc(100dvh-2rem)]">
          Загружаем семейное дерево...
        </Card>
      ) : (
        <div className="grid min-h-[calc(100dvh-1.5rem)] gap-3 md:min-h-[calc(100dvh-2rem)] lg:h-full lg:min-h-0 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
          <div className="min-h-[260px] min-w-0 lg:min-h-0"><LeftPanel /></div>
          <div className="min-h-[420px] min-w-0 lg:min-h-0"><TreeCanvas /></div>
          <div className="min-h-[260px] min-w-0 lg:min-h-0"><RightPanel /></div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      )}
    </main>
  );
}
