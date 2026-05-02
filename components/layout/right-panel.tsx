'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, Sheet } from '@/components/ui/dialog';
import { PersonForm } from '@/features/person/person-form';
import { personDates, personInitials, personName } from '@/lib/person-format';
import { useFamilyStore } from '@/store/family-store';

export function RightPanel() {
  const [editMode, setEditMode] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [relativeType, setRelativeType] = useState<'parent' | 'child' | 'partner' | null>(null);
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
        return target ? `${personName(target)} (${r.type === 'partner' ? 'партнёр' : 'родство'})` : null;
      })
      .filter(Boolean) as string[];
  }, [person, relationships, persons]);

  const addRelative = async (type: 'parent' | 'child' | 'partner') => {
    if (!person) return;
    setRelativeType(type);
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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
              {personInitials(person)}
            </div>
            <div className="min-w-0">
              <p className="break-words text-xl font-semibold">{personName(person)}</p>
              {personDates(person) && <p className="break-words text-sm text-slate-500">{personDates(person)}</p>}
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
            <Button variant="secondary" onClick={() => addRelative('parent')}>Добавить родителя</Button>
            <Button variant="secondary" onClick={() => addRelative('child')}>Добавить ребёнка</Button>
            <Button variant="secondary" onClick={() => addRelative('partner')}>Добавить партнёра</Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>Удалить</Button>
          </div>
        </>
      )}
      <Sheet open={Boolean(relativeType)} title="Новый родственник" side="bottom" onOpenChange={(open) => !open && setRelativeType(null)}>
        <PersonForm
          title="Новый родственник"
          submitLabel="Создать и связать"
          onSubmit={async (payload) => {
            if (!relativeType) return;
            const newId = await addPerson({ ...payload, treeId: person.treeId, gender: payload.gender || 'unknown', photoUrl: null });
            if (relativeType === 'parent') await addRelationship('parent_child', newId, person.id);
            if (relativeType === 'child') await addRelationship('parent_child', person.id, newId);
            if (relativeType === 'partner') await addRelationship('partner', person.id, newId);
            setRelativeType(null);
          }}
        />
      </Sheet>
      <Dialog open={deleteOpen} title="Удалить человека?" description="Это действие удалит человека и его связи из дерева." onOpenChange={setDeleteOpen}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Отмена</Button>
          <Button
            variant="danger"
            onClick={async () => {
              await removePerson(person.id);
              setDeleteOpen(false);
            }}
          >
            Удалить
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
