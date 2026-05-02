import { Handle, Position } from 'reactflow';

export function UnionNode() {
  return (
    <div className="size-3 rounded-full border-2 border-white bg-primary shadow-sm ring-2 ring-primary/15">
      <Handle className="!size-1 !border-0 !bg-transparent !opacity-0" type="target" position={Position.Top} />
      <Handle className="!size-1 !border-0 !bg-transparent !opacity-0" type="source" position={Position.Bottom} />
      <Handle className="!size-1 !border-0 !bg-transparent !opacity-0" type="target" position={Position.Left} />
      <Handle className="!size-1 !border-0 !bg-transparent !opacity-0" type="target" position={Position.Right} />
    </div>
  );
}
