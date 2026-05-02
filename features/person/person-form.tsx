'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
    birthDate?: string | null;
    deathDate?: string | null;
    note?: string | null;
  }) => void;
}

export function PersonForm({ initial, title, submitLabel, onSubmit }: Props) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [lastName, setLastName] = useState(initial?.lastName ?? '');
  const [gender, setGender] = useState<Person['gender']>(initial?.gender ?? 'unknown');
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [deathDate, setDeathDate] = useState(initial?.deathDate ?? '');
  const [note, setNote] = useState(initial?.note ?? '');

  const canSubmit = useMemo(() => Boolean(firstName.trim()), [firstName]);

  return (
    <form
      className="min-w-0 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender,
          birthDate: birthDate || null,
          deathDate: deathDate || null,
          note: note.trim() || null
        });
      }}
    >
      <h3 className="break-words text-xl font-semibold">{title}</h3>
      <Field label="Имя">
        <Input placeholder="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </Field>
      <Field label="Фамилия">
        <Input placeholder="Фамилия, если известна" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </Field>
      <Field label="Пол">
        <Select value={gender} onChange={(e) => setGender(e.target.value as Person['gender'])}>
          <option value="unknown">Не указан</option>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
          <option value="other">Другой</option>
        </Select>
      </Field>
      <Field label="Дата рождения">
        <Input type="date" value={birthDate ?? ''} onChange={(e) => setBirthDate(e.target.value)} />
      </Field>
      <Field label="Дата смерти">
        <Input type="date" value={deathDate ?? ''} onChange={(e) => setDeathDate(e.target.value)} />
      </Field>
      <Field label="Заметка">
        <Textarea placeholder="Короткая заметка" value={note ?? ''} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </form>
  );
}
