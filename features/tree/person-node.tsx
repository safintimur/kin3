import { Handle, Position } from 'reactflow';
import { UserRound } from 'lucide-react';
import { personInitials, personName, personYears } from '@/lib/person-format';
import { Person } from '@/types/family';

export function PersonNode({ data, selected }: { data: { person: Person }; selected?: boolean }) {
  const { person } = data;
  const years = personYears(person);

  return (
    <div className={`w-40 rounded-lg border bg-white p-3 shadow-sm transition sm:w-48 ${selected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-border'}`}>
      <Handle className="!h-3 !w-3 !border-2 !border-white !bg-slate-700" type="target" position={Position.Top} />
      <Handle className="!h-3 !w-3 !border-2 !border-white !bg-slate-700" type="source" position={Position.Bottom} />
      <Handle className="!h-3 !w-3 !border-2 !border-white !bg-slate-700" type="source" position={Position.Right} />
      <Handle className="!h-3 !w-3 !border-2 !border-white !bg-slate-700" type="target" position={Position.Left} />
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
        {personInitials(person) === '?' ? <UserRound className="h-6 w-6" /> : personInitials(person)}
      </div>
      <p className="break-words text-sm font-semibold sm:text-base">{personName(person)}</p>
      {years && <p className="text-xs text-slate-500 sm:text-sm">{years}</p>}
    </div>
  );
}
