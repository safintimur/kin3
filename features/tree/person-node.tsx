import { Handle, Position } from 'reactflow';
import { UserRound } from 'lucide-react';
import { personInitials, personMaidenName, personName, personYears } from '@/lib/person-format';
import { Person } from '@/types/family';

export function PersonNode({ data, selected }: { data: { linkMode?: boolean; person: Person }; selected?: boolean }) {
  const { person } = data;
  const years = personYears(person);

  return (
    <div className={`relative w-40 rounded-lg border bg-white p-3 shadow-sm transition sm:w-48 ${selected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-border'} ${data.linkMode ? 'cursor-crosshair' : 'cursor-move'}`}>
      <Handle
        className={`${data.linkMode ? '!pointer-events-auto' : '!pointer-events-none'} !left-0 !top-0 !h-full !w-full !translate-x-0 !translate-y-0 !rounded-lg !border-0 !bg-transparent !opacity-0`}
        type="source"
        position={Position.Top}
      />
      <div className="pointer-events-none mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
        {personInitials(person) === '?' ? <UserRound className="h-6 w-6" /> : personInitials(person)}
      </div>
      <p className="pointer-events-none break-words text-sm font-semibold sm:text-base">{personName(person)}</p>
      {personMaidenName(person) && <p className="pointer-events-none break-words text-xs text-slate-500">{personMaidenName(person)}</p>}
      {years && <p className="pointer-events-none text-xs text-slate-500 sm:text-sm">{years}</p>}
    </div>
  );
}
