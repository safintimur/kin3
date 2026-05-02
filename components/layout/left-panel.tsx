'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/dialog';
import { PersonForm } from '@/features/person/person-form';
import { personDates, personName } from '@/lib/person-format';
import { useFamilyStore } from '@/store/family-store';

export function LeftPanel() {
  const [showAdd, setShowAdd] = useState(false);
  const tree = useFamilyStore((s) => s.tree);
  const persons = useFamilyStore((s) => s.persons);
  const search = useFamilyStore((s) => s.search);
  const setSearch = useFamilyStore((s) => s.setSearch);
  const selectPerson = useFamilyStore((s) => s.selectPerson);
  const addPerson = useFamilyStore((s) => s.addPerson);

  const list = useMemo(
    () => persons.filter((p) => personName(p).toLowerCase().includes(search.toLowerCase())),
    [persons, search]
  );

  return (
    <Card className="flex h-full min-h-0 flex-col p-3">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
        <p className="min-w-0 break-words text-lg font-semibold">{tree?.title ?? 'Семья'}</p>
        <Button aria-label="Добавить человека" disabled={!tree} type="button" variant="icon" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Input placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />
      {showAdd && (
        <Sheet open={showAdd} title="Новый человек" side="bottom" onOpenChange={setShowAdd}>
          <PersonForm
            title="Новый человек"
            submitLabel="Сохранить"
            onSubmit={async (payload) => {
              if (!tree) return;
              try {
                await addPerson({ ...payload, treeId: tree.id });
                setShowAdd(false);
              } catch {
                // Ошибка уже записывается в стор, форму оставляем открытой.
              }
            }}
          />
        </Sheet>
      )}
      <div className="min-h-0 flex-1 space-y-2 overflow-auto">
        {list.map((person) => (
          <button key={person.id} className="w-full rounded-lg border p-3 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => selectPerson(person.id)}>
            <p className="break-words font-medium">{personName(person)}</p>
            {personDates(person) && <p className="text-sm text-slate-500">{personDates(person)}</p>}
          </button>
        ))}
        {!list.length && <p className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-500">Никого не найдено</p>}
      </div>
    </Card>
  );
}
