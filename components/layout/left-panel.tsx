'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PersonForm } from '@/features/person/person-form';
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
    () => persons.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())),
    [persons, search]
  );

  return (
    <Card className="h-full p-3">
      <p className="mb-2 text-lg font-semibold">{tree?.title ?? 'Семья'}</p>
      <Input placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />
      <Button className="mb-3 w-full" onClick={() => setShowAdd((v) => !v)}>{showAdd ? 'Скрыть форму' : 'Добавить человека'}</Button>
      {showAdd && (
        <div className="mb-3 rounded-xl border p-2">
          <PersonForm
            title="Новый родственник"
            submitLabel="Сохранить"
            onSubmit={(payload) => {
              addPerson({ ...payload, treeId: tree?.id ?? 'tree-demo' });
              setShowAdd(false);
            }}
          />
        </div>
      )}
      <div className="space-y-2 overflow-auto">
        {list.map((person) => (
          <button key={person.id} className="w-full rounded-xl border p-2 text-left hover:bg-slate-50" onClick={() => selectPerson(person.id)}>
            <p className="font-medium">{person.firstName} {person.lastName}</p>
            <p className="text-sm text-slate-500">{person.birthDate}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}
