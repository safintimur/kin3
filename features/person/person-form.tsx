'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Person } from '@/types/family';

interface Props {
  initial?: Partial<Person>;
  title: string;
  submitLabel: string;
  onSubmit: (payload: {
    firstName: string;
    lastName: string;
    gender: Person['gender'];
    birthDate: string;
    deathDate?: string | null;
    note?: string | null;
    photoUrl?: string | null;
  }) => void;
}

export function PersonForm({ initial, title, submitLabel, onSubmit }: Props) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [lastName, setLastName] = useState(initial?.lastName ?? '');
  const [gender, setGender] = useState<Person['gender']>(initial?.gender ?? 'unknown');
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [deathDate, setDeathDate] = useState(initial?.deathDate ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');

  const canSubmit = useMemo(() => firstName.trim() && lastName.trim() && birthDate, [firstName, lastName, birthDate]);

  return (
    <form
      className="min-w-0 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ firstName, lastName, gender, birthDate, deathDate: deathDate || null, note: note || null, photoUrl: photoUrl || null });
      }}
    >
      <h3 className="break-words text-xl font-semibold">{title}</h3>
      <Input placeholder="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <Input placeholder="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <select className="h-11 w-full min-w-0 rounded-xl border border-border px-3" value={gender} onChange={(e) => setGender(e.target.value as Person['gender'])}>
        <option value="unknown">Не указан</option>
        <option value="male">Мужской</option>
        <option value="female">Женский</option>
        <option value="other">Другой</option>
      </select>
      <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      <Input type="date" value={deathDate ?? ''} onChange={(e) => setDeathDate(e.target.value)} />
      <Input placeholder="Ссылка на фото" value={photoUrl ?? ''} onChange={(e) => setPhotoUrl(e.target.value)} />
      <Textarea placeholder="Заметка" value={note ?? ''} onChange={(e) => setNote(e.target.value)} />
      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </form>
  );
}
