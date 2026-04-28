'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonForm } from '@/features/person/person-form';
import { useFamilyStore } from '@/store/family-store';

export function RightPanel() {
  const [editMode, setEditMode] = useState(false);
  const selectedPersonId = useFamilyStore((s) => s.selectedPersonId);
  const persons = useFamilyStore((s) => s.persons);
  const relationships = useFamilyStore((s) => s.relationships);
  const updatePerson = useFamilyStore((s) => s.updatePerson);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const addRelationship = useFamilyStore((s) => s.addRelationship);
  const removePerson = useFamilyStore((s) => s.removePerson);

  const person = useMemo(() => persons.find((p) => p.id === selectedPersonId), [persons, selectedPersonId]);
  const related = useMemo(() => {
    if (!person) return [];
    return relationships
      .filter((r) => r.fromPersonId === person.id || r.toPersonId === person.id)
      .map((r) => {
        const targetId = r.fromPersonId === person.id ? r.toPersonId : r.fromPersonId;
        const target = persons.find((p) => p.id === targetId);
        return target ? `${target.firstName} ${target.lastName} (${r.type === 'partner' ? 'партнёр' : 'родство'})` : null;
      })
      .filter(Boolean) as string[];
  }, [person, relationships, persons]);

  const addRelative = async (type: 'parent' | 'child' | 'partner') => {
    if (!person) return;
    const firstName = prompt('Имя');
    if (!firstName) return;
    const lastName = prompt('Фамилия') || person.lastName;
    const birthDate = prompt('Дата рождения (YYYY-MM-DD)');
    if (!birthDate) return;
    const newId = await addPerson({
      treeId: person.treeId,
      firstName,
      lastName,
      gender: 'unknown',
      birthDate,
      deathDate: null,
      note: null,
      photoUrl: null
    });

    if (type === 'parent') await addRelationship('parent_child', newId, person.id);
    if (type === 'child') await addRelationship('parent_child', person.id, newId);
    if (type === 'partner') await addRelationship('partner', person.id, newId);
  };

  if (!person) return <Card className="flex h-full min-h-0 items-center justify-center p-4 text-center text-slate-500">Выберите человека, чтобы увидеть детали.</Card>;

  return (
    <Card className="h-full min-h-0 overflow-auto p-4">
      {editMode ? (
        <PersonForm
          initial={person}
          title="Редактировать"
          submitLabel="Обновить"
          onSubmit={async (payload) => {
            await updatePerson(person.id, payload);
            setEditMode(false);
          }}
        />
      ) : (
        <>
          <div className="mb-3 flex min-w-0 items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100" />
            <div className="min-w-0">
              <p className="break-words text-xl font-semibold">{person.firstName} {person.lastName}</p>
              <p className="break-words text-sm text-slate-500">{person.birthDate} {person.deathDate ? `- ${person.deathDate}` : ''}</p>
            </div>
          </div>

          <p className="mb-1 text-sm font-semibold">Связи</p>
          <ul className="mb-3 list-disc overflow-hidden pl-5 text-sm text-slate-700">
            {related.length ? related.map((item) => <li key={item}>{item}</li>) : <li>Нет связей</li>}
          </ul>

          <p className="mb-1 text-sm font-semibold">Заметка</p>
          <p className="mb-4 break-words rounded-xl bg-slate-50 p-3 text-sm">{person.note || 'Нет заметки'}</p>

          <div className="grid gap-2">
            <Button onClick={() => setEditMode(true)}>Редактировать</Button>
            <Button className="bg-slate-800" onClick={() => addRelative('parent')}>Добавить родителя</Button>
            <Button className="bg-slate-800" onClick={() => addRelative('child')}>Добавить ребёнка</Button>
            <Button className="bg-slate-800" onClick={() => addRelative('partner')}>Добавить партнёра</Button>
            <Button className="bg-red-600" onClick={() => removePerson(person.id)}>Удалить</Button>
          </div>
        </>
      )}
    </Card>
  );
}
