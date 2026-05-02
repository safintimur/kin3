'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
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
    maidenName?: string | null;
    gender: Person['gender'];
    birthDate?: string | null;
    deathDate?: string | null;
    note?: string | null;
  }) => void;
}

export function PersonForm({ initial, title, submitLabel, onSubmit }: Props) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [lastName, setLastName] = useState(initial?.lastName ?? '');
  const [maidenName, setMaidenName] = useState(initial?.maidenName ?? '');
  const [gender, setGender] = useState<Person['gender']>(initial?.gender ?? 'unknown');
  const [birthDate, setBirthDate] = useState<string | null>(initial?.birthDate ?? null);
  const [deathDate, setDeathDate] = useState<string | null>(initial?.deathDate ?? null);
  const [note, setNote] = useState(initial?.note ?? '');

  const canSubmit = useMemo(() => Boolean(firstName.trim()), [firstName]);

  return (
    <form
      className="flex min-w-0 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          maidenName: maidenName.trim() || null,
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
      <Field label="Девичья фамилия">
        <Input placeholder="Если отличается от текущей" value={maidenName} onChange={(e) => setMaidenName(e.target.value)} />
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
        <DateInput value={birthDate} onValueChange={setBirthDate} />
      </Field>
      <Field label="Дата смерти">
        <DateInput value={deathDate} onValueChange={setDeathDate} />
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
