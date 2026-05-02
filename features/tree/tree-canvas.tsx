'use client';

import { useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import { Maximize2, Plus } from 'lucide-react';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Dialog, Sheet } from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { PersonForm } from '@/features/person/person-form';
import { PersonNode } from '@/features/tree/person-node';
import { buildFlow } from '@/features/tree/tree-layout';
import { UnionNode } from '@/features/tree/union-node';
import { personName } from '@/lib/person-format';
import { useFamilyStore } from '@/store/family-store';

const nodeTypes = { person: PersonNode, union: UnionNode };

type PendingConnection = {
  sourceId: string;
  targetId: string;
};

export function TreeCanvas() {
  return (
    <ReactFlowProvider>
      <TreeCanvasContent />
    </ReactFlowProvider>
  );
}

function TreeCanvasContent() {
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const persons = useFamilyStore((s) => s.persons);
  const relationships = useFamilyStore((s) => s.relationships);
  const selectedPersonId = useFamilyStore((s) => s.selectedPersonId);
  const tree = useFamilyStore((s) => s.tree);
  const selectPerson = useFamilyStore((s) => s.selectPerson);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const addRelationship = useFamilyStore((s) => s.addRelationship);
  const reactFlow = useReactFlow();

  const personIds = useMemo(() => new Set(persons.map((person) => person.id)), [persons]);
  const personById = useMemo(() => new Map(persons.map((person) => [person.id, person])), [persons]);
  const { nodes, edges } = useMemo(
    () => buildFlow(persons, relationships, selectedPersonId),
    [persons, relationships, selectedPersonId]
  );

  const sourcePerson = pendingConnection ? personById.get(pendingConnection.sourceId) : null;
  const targetPerson = pendingConnection ? personById.get(pendingConnection.targetId) : null;

  const centerTree = () => {
    reactFlow.fitView({ duration: 350, padding: 0.24 });
  };

  const closeConnectionDialog = () => setPendingConnection(null);

  const createRelationship = async (kind: 'source-parent' | 'target-parent' | 'partner') => {
    if (!pendingConnection) return;

    if (kind === 'source-parent') {
      await addRelationship('parent_child', pendingConnection.sourceId, pendingConnection.targetId);
    }
    if (kind === 'target-parent') {
      await addRelationship('parent_child', pendingConnection.targetId, pendingConnection.sourceId);
    }
    if (kind === 'partner') {
      await addRelationship('partner', pendingConnection.sourceId, pendingConnection.targetId);
    }

    selectPerson(pendingConnection.targetId);
    closeConnectionDialog();
    window.setTimeout(centerTree, 80);
  };

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-lg border border-border bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.7}
        onConnect={(connection: Connection) => {
          if (!connection.source || !connection.target) return;
          if (connection.source === connection.target) return;
          if (!personIds.has(connection.source) || !personIds.has(connection.target)) return;
          setPendingConnection({ sourceId: connection.source, targetId: connection.target });
        }}
        onNodeClick={(_, node) => {
          if (node.type === 'person') selectPerson(node.id);
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap className="hidden sm:block" zoomable pannable />
        <Background gap={24} size={1} />
      </ReactFlow>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between gap-2">
        <div className="pointer-events-auto rounded-lg border border-border bg-white/95 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur">
          Дерево
        </div>
        <div className="pointer-events-auto flex gap-2">
          <Tooltip label="Центрировать дерево">
            <Button aria-label="Центрировать дерево" type="button" variant="icon" onClick={centerTree}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip label="Добавить человека">
            <Button aria-label="Добавить человека" type="button" variant="icon" onClick={() => setCreateOpen(true)}>
              <Plus className="h-5 w-5" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <Sheet open={createOpen} title="Быстро добавить человека" side="bottom" onOpenChange={setCreateOpen}>
        <PersonForm
          title="Новый человек"
          submitLabel="Создать"
          onSubmit={async (payload) => {
            if (!tree) return;
            const personId = await addPerson({ ...payload, treeId: tree.id, gender: payload.gender || 'unknown', photoUrl: null });
            selectPerson(personId);
            setCreateOpen(false);
            window.setTimeout(centerTree, 80);
          }}
        />
      </Sheet>

      <Dialog
        open={Boolean(pendingConnection && sourcePerson && targetPerson)}
        title="Создать связь"
        description={sourcePerson && targetPerson ? `${personName(sourcePerson)} ↔ ${personName(targetPerson)}` : undefined}
        onOpenChange={(open) => !open && closeConnectionDialog()}
      >
        {sourcePerson && targetPerson && (
          <div className="grid gap-2">
            <Button variant="secondary" onClick={() => createRelationship('source-parent')}>
              {personName(sourcePerson)} родитель {personName(targetPerson)}
            </Button>
            <Button variant="secondary" onClick={() => createRelationship('target-parent')}>
              {personName(targetPerson)} родитель {personName(sourcePerson)}
            </Button>
            <Button onClick={() => createRelationship('partner')}>Партнёры</Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
