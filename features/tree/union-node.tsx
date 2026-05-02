import { Handle, Position } from 'reactflow';

export function UnionNode() {
  return (
    <div className="h-4 w-4 rounded-full border-2 border-white bg-slate-500 shadow-sm">
      <Handle className="!h-2 !w-2 !border-0 !bg-transparent" type="target" position={Position.Top} />
      <Handle className="!h-2 !w-2 !border-0 !bg-transparent" type="source" position={Position.Bottom} />
      <Handle className="!h-2 !w-2 !border-0 !bg-transparent" type="target" position={Position.Left} />
      <Handle className="!h-2 !w-2 !border-0 !bg-transparent" type="target" position={Position.Right} />
    </div>
  );
}
