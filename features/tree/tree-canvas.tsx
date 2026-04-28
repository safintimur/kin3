'use client';

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { buildFlow } from '@/features/tree/tree-layout';
import { PersonNode } from '@/features/tree/person-node';
import { useFamilyStore } from '@/store/family-store';

const nodeTypes = { person: PersonNode };

export function TreeCanvas() {
  const persons = useFamilyStore((s) => s.persons);
  const relationships = useFamilyStore((s) => s.relationships);
  const selectPerson = useFamilyStore((s) => s.selectPerson);

  const { nodes, edges } = buildFlow(persons, relationships);

  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-white [&_.react-flow__minimap]:hidden sm:[&_.react-flow__minimap]:block">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.6}
        onNodeClick={(_, node) => selectPerson(node.id)}
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}
