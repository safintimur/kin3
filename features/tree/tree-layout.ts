import { Edge, Node } from 'reactflow';
import { Person, Relationship } from '@/types/family';

export function buildFlow(persons: Person[], relationships: Relationship[]) {
  const parentRels = relationships.filter((r) => r.type === 'parent_child');
  const generation = new Map<string, number>();

  persons.forEach((p) => generation.set(p.id, 0));

  for (let i = 0; i < persons.length; i += 1) {
    for (const rel of parentRels) {
      const parentGen = generation.get(rel.fromPersonId) ?? 0;
      const childGen = generation.get(rel.toPersonId) ?? 0;
      if (childGen <= parentGen) generation.set(rel.toPersonId, parentGen + 1);
    }
  }

  const groups = new Map<number, Person[]>();
  persons.forEach((p) => {
    const g = generation.get(p.id) ?? 0;
    groups.set(g, [...(groups.get(g) ?? []), p]);
  });

  const nodes: Node[] = [];
  const xGap = 250;
  const yGap = 180;

  [...groups.entries()].forEach(([g, people]) => {
    people.forEach((person, idx) => {
      nodes.push({
        id: person.id,
        type: 'person',
        position: { x: idx * xGap, y: g * yGap },
        data: { person }
      });
    });
  });

  const edges: Edge[] = relationships.map((rel) => ({
    id: rel.id,
    source: rel.fromPersonId,
    target: rel.toPersonId,
    type: 'smoothstep',
    animated: rel.type === 'partner',
    label: rel.type === 'partner' ? 'Партнёры' : undefined,
    style: rel.type === 'partner' ? { strokeDasharray: '4 4' } : undefined
  }));

  return { nodes, edges };
}
