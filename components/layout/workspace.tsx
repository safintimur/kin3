'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { GitBranch, Info, Users } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { LeftPanel } from '@/components/layout/left-panel';
import { RightPanel } from '@/components/layout/right-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';
import { TreeCanvas } from '@/features/tree/tree-canvas';
import { loadFamilyData } from '@/lib/family-repository';
import { useFamilyStore } from '@/store/family-store';

type MobileView = 'tree' | 'people' | 'details';

export function FamilyWorkspace() {
  return (
    <AuthGate>
      <FamilyWorkspaceContent />
    </AuthGate>
  );
}

function FamilyWorkspaceContent() {
  const [mobileView, setMobileView] = useState<MobileView>('tree');
  const [tabletPanel, setTabletPanel] = useState<'people' | 'details'>('people');
  const [loading, setLoading] = useState(true);
  const setInitial = useFamilyStore((s) => s.setInitial);
  const setError = useFamilyStore((s) => s.setError);
  const error = useFamilyStore((s) => s.error);
  const tree = useFamilyStore((s) => s.tree);
  const persons = useFamilyStore((s) => s.persons);

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
    <main className="h-dvh overflow-hidden bg-slate-50">
      {loading ? (
        <Card className="m-3 flex h-[calc(100dvh-1.5rem)] items-center justify-center p-4 text-center text-slate-500 md:m-4 md:h-[calc(100dvh-2rem)]">
          Загружаем семейное дерево...
        </Card>
      ) : (
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className="flex min-w-0 items-center justify-between gap-3 border-b border-border bg-white px-3 py-2 md:px-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{tree?.title ?? 'Семья'}</h1>
              <p className="truncate text-xs text-slate-500">{persons.length} человек в дереве</p>
            </div>
            <div className="hidden items-center gap-1 md:flex lg:hidden">
              <Button size="sm" variant={tabletPanel === 'people' ? 'primary' : 'secondary'} onClick={() => setTabletPanel('people')}>Люди</Button>
              <Button size="sm" variant={tabletPanel === 'details' ? 'primary' : 'secondary'} onClick={() => setTabletPanel('details')}>Детали</Button>
            </div>
          </header>

          <section className="min-h-0 p-3 md:p-4">
            <div className="hidden h-full min-h-0 gap-3 lg:grid lg:grid-cols-[300px_minmax(0,1fr)_360px]">
              <LeftPanel />
              <TreeCanvas />
              <RightPanel />
            </div>

            <div className="hidden h-full min-h-0 gap-3 md:grid md:grid-cols-[minmax(0,1fr)_340px] lg:hidden">
              <TreeCanvas />
              {tabletPanel === 'people' ? <LeftPanel /> : <RightPanel />}
            </div>

            <div className="h-full min-h-0 md:hidden">
              {mobileView === 'tree' && <TreeCanvas />}
              {mobileView === 'people' && <LeftPanel />}
              {mobileView === 'details' && <RightPanel />}
            </div>
          </section>

          <nav className="grid grid-cols-3 border-t border-border bg-white p-2 md:hidden">
            <MobileNavButton active={mobileView === 'tree'} icon={<GitBranch className="h-4 w-4" />} label="Дерево" onClick={() => setMobileView('tree')} />
            <MobileNavButton active={mobileView === 'people'} icon={<Users className="h-4 w-4" />} label="Люди" onClick={() => setMobileView('people')} />
            <MobileNavButton active={mobileView === 'details'} icon={<Info className="h-4 w-4" />} label="Детали" onClick={() => setMobileView('details')} />
          </nav>
        </div>
      )}
      <Toast message={error} tone="danger" />
    </main>
  );
}

function MobileNavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <Tooltip label={label}>
      <button
        className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs font-medium transition ${
          active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
        type="button"
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </button>
    </Tooltip>
  );
}
