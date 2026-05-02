'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Crosshair, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, Sheet } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PersonForm } from '@/features/person/person-form';
import { buildKinshipGroups, kinshipItemLabel, KinshipItem } from '@/lib/kinship';
import { personDates, personInitials, personMaidenName, personName } from '@/lib/person-format';
import { useFamilyStore } from '@/store/family-store';

type LinkType = 'parent' | 'child' | 'partner';

const linkTypeLabels: Record<LinkType, string> = {
  parent: 'Родитель',
  child: 'Ребёнок',
  partner: 'Партнёр'
};

interface RightPanelProps {
  onBack?: () => void;
  onFindInTree?: (personId: string) => void;
}

export function RightPanel({ onBack, onFindInTree }: RightPanelProps) {
  const [editMode, setEditMode] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkType, setLinkType] = useState<LinkType>('child');
  const [linkSearch, setLinkSearch] = useState('');
  const [createLinkedPerson, setCreateLinkedPerson] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [relationshipToDelete, setRelationshipToDelete] = useState<KinshipItem | null>(null);
  const internalNavigationTarget = useRef<string | null>(null);
  const selectedPersonId = useFamilyStore((s) => s.selectedPersonId);
  const persons = useFamilyStore((s) => s.persons);
  const relationships = useFamilyStore((s) => s.relationships);
  const selectPerson = useFamilyStore((s) => s.selectPerson);
  const updatePerson = useFamilyStore((s) => s.updatePerson);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const addRelationship = useFamilyStore((s) => s.addRelationship);
  const removeRelationship = useFamilyStore((s) => s.removeRelationship);
  const removePerson = useFamilyStore((s) => s.removePerson);

  const person = useMemo(() => persons.find((p) => p.id === selectedPersonId), [persons, selectedPersonId]);
  const kinshipGroups = useMemo(
    () => (person ? buildKinshipGroups(person.id, persons, relationships) : []),
    [person, persons, relationships]
  );

  const linkCandidates = useMemo(() => {
    if (!person) return [];
    const normalizedSearch = linkSearch.trim().toLowerCase();

    return persons
      .filter((candidate) => candidate.id !== person.id)
      .filter((candidate) => !normalizedSearch || personName(candidate).toLowerCase().includes(normalizedSearch))
      .slice(0, 8);
  }, [linkSearch, person, persons]);

  const closeLinkSheet = () => {
    setLinkOpen(false);
    setCreateLinkedPerson(false);
    setLinkSearch('');
    setLinkType('child');
  };

  const connectPerson = async (targetId: string) => {
    if (!person) return;
    if (linkType === 'parent') await addRelationship('parent_child', targetId, person.id);
    if (linkType === 'child') await addRelationship('parent_child', person.id, targetId);
    if (linkType === 'partner') await addRelationship('partner', person.id, targetId);
    closeLinkSheet();
  };

  useEffect(() => {
    if (!selectedPersonId) {
      setHistory([]);
      return;
    }
    if (internalNavigationTarget.current === selectedPersonId) {
      internalNavigationTarget.current = null;
      return;
    }
    setHistory([]);
  }, [selectedPersonId]);

  const openRelatedPerson = (personId: string) => {
    if (!person || person.id === personId) return;
    setHistory((items) => [...items, person.id]);
    internalNavigationTarget.current = personId;
    selectPerson(personId);
  };

  const goBack = () => {
    if (editMode) {
      setEditMode(false);
      return;
    }

    const previousId = history.at(-1);
    if (previousId) {
      setHistory((items) => items.slice(0, -1));
      internalNavigationTarget.current = previousId;
      selectPerson(previousId);
      return;
    }

    onBack?.();
  };

  if (!person) return <Card className="flex h-full min-h-0 items-center justify-center p-4 text-center text-sm text-slate-500">Выберите человека, чтобы увидеть детали.</Card>;

  return (
    <Card className="h-full min-h-0 overflow-auto p-4">
      {(editMode || onBack || history.length > 0) && (
        <Button className="mb-3" size="sm" type="button" variant="ghost" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
      )}
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
          <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
                {personInitials(person)}
              </div>
              <div className="min-w-0">
                <p className="break-words text-lg font-semibold leading-tight">{personName(person)}</p>
                {personMaidenName(person) && <p className="break-words text-sm text-slate-500">{personMaidenName(person)}</p>}
                {personDates(person) && <p className="break-words text-sm text-slate-500">{personDates(person)}</p>}
              </div>
            </div>
            <Button className="shrink-0" size="sm" type="button" variant="ghost" onClick={() => setEditMode(true)}>
              Редактировать
            </Button>
          </div>

          <div className="mb-4 grid gap-2">
            <Button type="button" variant="secondary" onClick={() => onFindInTree?.(person.id)}>
              <Crosshair className="h-4 w-4" />
              Найти на дереве
            </Button>
          </div>

          <div className="mb-4 grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Связи</p>
              <Button size="sm" type="button" variant="ghost" onClick={() => setLinkOpen(true)}>
                Редактировать
              </Button>
            </div>
            {kinshipGroups.length ? (
              kinshipGroups.map((group) => (
                <section key={group.title} className="grid gap-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{group.title}</p>
                  <div className="grid gap-1.5">
                    {group.items.map((item) => (
                      <div key={`${group.title}-${item.personId}`} className="flex min-w-0 items-center gap-2 rounded-lg border bg-white p-2">
                        <button
                          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-800 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          type="button"
                          onClick={() => openRelatedPerson(item.personId)}
                        >
                          {kinshipItemLabel(item, persons)}
                        </button>
                        {item.directRelationshipId && (
                          <Button
                            aria-label="Удалить связь"
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => setRelationshipToDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-3 text-sm text-slate-500">Связей пока нет</p>
            )}
          </div>

          <p className="mb-1 text-sm font-semibold">Заметка</p>
          <p className="mb-4 break-words rounded-xl bg-slate-50 p-3 text-sm">{person.note || 'Нет заметки'}</p>

          <div className="grid gap-2">
            <Button onClick={() => setLinkOpen(true)}>Добавить связь</Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>Удалить</Button>
          </div>
        </>
      )}
      <Sheet open={linkOpen} title="Добавить связь" side="bottom" onOpenChange={(open) => !open && closeLinkSheet()}>
        {createLinkedPerson ? (
          <PersonForm
            title={`Новый человек: ${linkTypeLabels[linkType].toLowerCase()}`}
            submitLabel="Создать и связать"
            onSubmit={async (payload) => {
              const newId = await addPerson({ ...payload, treeId: person.treeId, gender: payload.gender || 'unknown', photoUrl: null });
              await connectPerson(newId);
            }}
          />
        ) : (
          <div className="flex min-w-0 flex-col gap-4">
            {kinshipGroups.some((group) => group.items.some((item) => item.directRelationshipId)) && (
              <div className="grid gap-2">
                <p className="text-sm font-medium text-slate-700">Текущие прямые связи</p>
                <div className="grid gap-2">
                  {kinshipGroups.flatMap((group) =>
                    group.items
                      .filter((item) => item.directRelationshipId)
                      .map((item) => (
                        <div key={`${group.title}-${item.directRelationshipId}`} className="flex items-center gap-2 rounded-lg border p-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{kinshipItemLabel(item, persons)}</p>
                            <p className="text-xs text-slate-500">{group.title}</p>
                          </div>
                          <Button size="sm" type="button" variant="ghost" onClick={() => setRelationshipToDelete(item)}>
                            Удалить
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <p className="text-sm font-medium text-slate-700">Тип связи</p>
              <div className="grid grid-cols-3 gap-2">
                {(['parent', 'child', 'partner'] as LinkType[]).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    type="button"
                    variant={linkType === type ? 'primary' : 'secondary'}
                    onClick={() => setLinkType(type)}
                  >
                    {linkTypeLabels[type]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-slate-700">Выбрать человека</p>
              <Input placeholder="Поиск по имени или фамилии" value={linkSearch} onChange={(event) => setLinkSearch(event.target.value)} />
              <div className="grid max-h-72 gap-2 overflow-auto">
                {linkCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    className="w-full rounded-lg border p-3 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                    onClick={() => connectPerson(candidate.id)}
                  >
                    <p className="break-words font-medium">{personName(candidate)}</p>
                    {personDates(candidate) && <p className="text-sm text-slate-500">{personDates(candidate)}</p>}
                  </button>
                ))}
                {!linkCandidates.length && (
                  <p className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-500">Такого человека пока нет</p>
                )}
              </div>
            </div>

            <Button type="button" variant="secondary" onClick={() => setCreateLinkedPerson(true)}>
              Создать нового человека
            </Button>
          </div>
        )}
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
      <Dialog
        open={Boolean(relationshipToDelete?.directRelationshipId)}
        title="Удалить связь?"
        description={relationshipToDelete ? `Связь с ${kinshipItemLabel(relationshipToDelete, persons)} будет удалена.` : undefined}
        onOpenChange={(open) => !open && setRelationshipToDelete(null)}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => setRelationshipToDelete(null)}>Отмена</Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!relationshipToDelete?.directRelationshipId) return;
              await removeRelationship(relationshipToDelete.directRelationshipId);
              setRelationshipToDelete(null);
            }}
          >
            Удалить
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
