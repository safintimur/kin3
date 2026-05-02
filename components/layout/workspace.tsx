'use client';

import { TouchEvent, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { GitBranch, Users } from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { LeftPanel } from '@/components/layout/left-panel';
import { MobilePeopleView } from '@/components/layout/mobile-people-view';
import { RightPanel } from '@/components/layout/right-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { TreeCanvas } from '@/features/tree/tree-canvas';
import { loadFamilyData } from '@/lib/family-repository';
import { useFamilyStore } from '@/store/family-store';

type MobileView = 'tree' | 'list';
type MobileDetailOrigin = 'tree' | 'list';
type ViewportMode = 'desktop' | 'mobile' | 'tablet';

export function FamilyWorkspace() {
  return (
    <AuthGate>
      <FamilyWorkspaceContent />
    </AuthGate>
  );
}

function FamilyWorkspaceContent() {
  const [mobileView, setMobileView] = useState<MobileView>('tree');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileDetailOrigin, setMobileDetailOrigin] = useState<MobileDetailOrigin>('list');
  const [treeFocusRequest, setTreeFocusRequest] = useState<{ personId: string; requestId: number } | null>(null);
  const [tabletPanel, setTabletPanel] = useState<'people' | 'details'>('people');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('mobile');
  const [loading, setLoading] = useState(true);
  const mobileTouchStart = useRef<{ x: number; y: number } | null>(null);
  const setInitial = useFamilyStore((s) => s.setInitial);
  const setError = useFamilyStore((s) => s.setError);
  const error = useFamilyStore((s) => s.error);
  const tree = useFamilyStore((s) => s.tree);
  const persons = useFamilyStore((s) => s.persons);
  const selectPerson = useFamilyStore((s) => s.selectPerson);

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

  useEffect(() => {
    const updateViewportMode = () => {
      if (window.innerWidth >= 1024) {
        setViewportMode('desktop');
        return;
      }
      if (window.innerWidth >= 768) {
        setViewportMode('tablet');
        return;
      }
      setViewportMode('mobile');
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    return () => window.removeEventListener('resize', updateViewportMode);
  }, []);

  const openMobilePerson = (personId: string, origin: MobileDetailOrigin) => {
    selectPerson(personId);
    setMobileDetailOrigin(origin);
    setMobileDetailOpen(true);
    setMobileView('list');
  };

  const closeMobileDetail = () => {
    setMobileDetailOpen(false);
    if (mobileDetailOrigin === 'tree') {
      setMobileView('tree');
    }
  };

  const findPersonOnTree = (personId: string) => {
    selectPerson(personId);
    setTreeFocusRequest({ personId, requestId: Date.now() });
    setMobileView('tree');
    setMobileDetailOpen(false);
  };

  const onMobileTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    mobileTouchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onMobileTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!mobileTouchStart.current) return;
    if (mobileDetailOpen) {
      mobileTouchStart.current = null;
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - mobileTouchStart.current.x;
    const dy = touch.clientY - mobileTouchStart.current.y;
    mobileTouchStart.current = null;

    if (Math.abs(dx) < 80 || Math.abs(dy) > 50) return;
    setMobileView(dx < 0 ? 'list' : 'tree');
  };

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
              <h1 className="truncate text-lg font-semibold">Семейное древо</h1>
              <p className="truncate text-xs text-slate-500">{persons.length} человек в дереве</p>
            </div>
            <div className="hidden items-center gap-1 md:flex lg:hidden">
              <Button size="sm" variant={tabletPanel === 'people' ? 'primary' : 'secondary'} onClick={() => setTabletPanel('people')}>Люди</Button>
              <Button size="sm" variant={tabletPanel === 'details' ? 'primary' : 'secondary'} onClick={() => setTabletPanel('details')}>Детали</Button>
            </div>
          </header>

          <section className="min-h-0 p-3 md:p-4">
            {viewportMode === 'desktop' && (
              <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
                <LeftPanel />
                <TreeCanvas focusRequest={treeFocusRequest} />
                <RightPanel onFindInTree={findPersonOnTree} />
              </div>
            )}

            {viewportMode === 'tablet' && (
              <div className="grid h-full min-h-0 gap-3 md:grid-cols-[minmax(0,1fr)_340px]">
                <TreeCanvas focusRequest={treeFocusRequest} />
                {tabletPanel === 'people' ? <LeftPanel /> : <RightPanel onFindInTree={findPersonOnTree} />}
              </div>
            )}

            {viewportMode === 'mobile' && (
              <div className="h-full min-h-0 w-full overflow-hidden" onTouchStart={onMobileTouchStart} onTouchEnd={onMobileTouchEnd}>
                <div
                  className="flex h-full min-h-0 w-[200%] transition-[margin-left] duration-200 ease-out"
                  style={{ marginLeft: mobileView === 'tree' ? '0' : '-100%' }}
                >
                  <div className="h-full min-h-0 w-1/2 shrink-0">
                    <TreeCanvas focusRequest={treeFocusRequest} onPersonOpen={(personId) => openMobilePerson(personId, 'tree')} />
                  </div>
                  <div className="h-full min-h-0 w-1/2 shrink-0">
                    <MobilePeopleView
                      detailOpen={mobileDetailOpen}
                      onBack={closeMobileDetail}
                      onFindInTree={findPersonOnTree}
                      onPersonOpen={(personId) => openMobilePerson(personId, 'list')}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {viewportMode === 'mobile' && (
            <nav className="grid grid-cols-2 gap-2 border-t border-border bg-white p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
              <MobileNavButton active={mobileView === 'tree'} icon={<GitBranch className="h-4 w-4" />} label="Древо" onClick={() => setMobileView('tree')} />
              <MobileNavButton active={mobileView === 'list'} icon={<Users className="h-4 w-4" />} label="Список" onClick={() => setMobileView('list')} />
            </nav>
          )}
        </div>
      )}
      <Toast message={error} tone="danger" onDismiss={() => setError(null)} />
    </main>
  );
}

function MobileNavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-12 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
      type="button"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
