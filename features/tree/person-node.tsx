import { Handle, Position } from 'reactflow';
import { UserRound } from 'lucide-react';
import { Person } from '@/types/family';

export function PersonNode({ data }: { data: { person: Person } }) {
  const { person } = data;
  const years = `${new Date(person.birthDate).getFullYear()}–${person.deathDate ? new Date(person.deathDate).getFullYear() : ''}`;

  return (
    <div className="w-44 rounded-2xl border border-border bg-white p-3 shadow-md sm:w-52">
      <Handle type="target" position={Position.Top} />
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        {person.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.photoUrl} alt={person.firstName} className="h-full w-full rounded-full object-cover" />
        ) : (
          <UserRound className="h-7 w-7 text-slate-500" />
        )}
      </div>
      <p className="break-words text-base font-semibold">{person.firstName}</p>
      <p className="break-words text-sm text-slate-600">{person.lastName}</p>
      <p className="text-sm text-slate-500">{years}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
