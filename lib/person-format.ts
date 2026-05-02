import { Person } from '@/types/family';

export const personName = (person: Pick<Person, 'firstName' | 'lastName'>) =>
  [person.firstName, person.lastName].filter(Boolean).join(' ');

export const personInitials = (person: Pick<Person, 'firstName' | 'lastName'>) =>
  [person.firstName, person.lastName]
    .flatMap((part) => (part ? [part] : []))
    .map((part) => part.trim()[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

export const personYears = (person: Pick<Person, 'birthDate' | 'deathDate'>) => {
  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;

  if (birthYear && deathYear) return `${birthYear}-${deathYear}`;
  if (birthYear) return `${birthYear}-`;
  if (deathYear) return `-${deathYear}`;
  return '';
};

export const personDates = (person: Pick<Person, 'birthDate' | 'deathDate'>) => {
  if (person.birthDate && person.deathDate) return `${person.birthDate} - ${person.deathDate}`;
  return person.birthDate || person.deathDate || '';
};
