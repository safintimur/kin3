import { Edge, Node } from 'reactflow';
import { Person, Relationship } from '@/types/family';

const personXGap = 250;
const personYGap = 220;
const unionYOffset = 118;

const pairKey = (firstId: string, secondId: string) => [firstId, secondId].sort().join('__');
const soloKey = (personId: string) => `solo__${personId}`;

interface UnionGroup {
  children: Set<string>;
  id: string;
  parents: string[];
  partnerRelId?: string;
}

export function buildFlow(persons: Person[], relationships: Relationship[], selectedPersonId?: string | null) {
  const personById = new Map(persons.map((person) => [person.id, person]));
  const parentRels = relationships.filter((relationship) => relationship.type === 'parent_child');
  const partnerRels = relationships.filter((relationship) => relationship.type === 'partner');
  const partnerPairs = new Set(partnerRels.map((relationship) => pairKey(relationship.fromPersonId, relationship.toPersonId)));
  const generation = new Map<string, number>();

  persons.forEach((person) => generation.set(person.id, 0));

  for (let i = 0; i < persons.length; i += 1) {
    for (const relationship of parentRels) {
      const parentGen = generation.get(relationship.fromPersonId) ?? 0;
      const childGen = generation.get(relationship.toPersonId) ?? 0;
      if (childGen <= parentGen) generation.set(relationship.toPersonId, parentGen + 1);
    }
  }

  partnerRels.forEach((relationship) => {
    const firstGen = generation.get(relationship.fromPersonId) ?? 0;
    const secondGen = generation.get(relationship.toPersonId) ?? 0;
    const aligned = Math.min(firstGen, secondGen);
    generation.set(relationship.fromPersonId, aligned);
    generation.set(relationship.toPersonId, aligned);
  });

  const parentsByChild = new Map<string, string[]>();
  parentRels.forEach((relationship) => {
    parentsByChild.set(relationship.toPersonId, [...(parentsByChild.get(relationship.toPersonId) ?? []), relationship.fromPersonId]);
  });

  const unions = new Map<string, UnionGroup>();

  const ensureUnion = (parents: string[], partnerRelId?: string) => {
    const sortedParents = [...parents].sort();
    const key = sortedParents.length === 1 ? soloKey(sortedParents[0]) : pairKey(sortedParents[0], sortedParents[1]);
    const id = `union__${key}`;
    const existing = unions.get(key);

    if (existing) {
      if (partnerRelId) existing.partnerRelId = partnerRelId;
      return existing;
    }

    const union = { children: new Set<string>(), id, parents: sortedParents, partnerRelId };
    unions.set(key, union);
    return union;
  };

  partnerRels.forEach((relationship) => {
    ensureUnion([relationship.fromPersonId, relationship.toPersonId], relationship.id);
  });

  parentsByChild.forEach((parents, childId) => {
    const uniqueParents = [...new Set(parents)].filter((parentId) => personById.has(parentId));
    if (!uniqueParents.length) return;

    let unionParents = uniqueParents.slice(0, 1);
    if (uniqueParents.length > 1) {
      const partnerPair = findPartnerPair(uniqueParents, partnerPairs);
      unionParents = partnerPair ?? uniqueParents.slice(0, 2);
    }

    ensureUnion(unionParents).children.add(childId);
  });

  const peopleByGeneration = new Map<number, Person[]>();
  persons.forEach((person) => {
    const gen = generation.get(person.id) ?? 0;
    peopleByGeneration.set(gen, [...(peopleByGeneration.get(gen) ?? []), person]);
  });

  const personPositions = new Map<string, { x: number; y: number }>();
  const nodes: Node[] = [];

  [...peopleByGeneration.entries()]
    .sort(([first], [second]) => first - second)
    .forEach(([gen, people]) => {
      const rowWidth = (people.length - 1) * personXGap;
      people.forEach((person, index) => {
        const position = { x: index * personXGap - rowWidth / 2, y: gen * personYGap };
        personPositions.set(person.id, position);
        nodes.push({
          id: person.id,
          type: 'person',
          position,
          selected: selectedPersonId === person.id,
          data: { person }
        });
      });
    });

  const edges: Edge[] = [];

  unions.forEach((union) => {
    const parentPositions = union.parents.map((parentId) => personPositions.get(parentId)).filter(Boolean) as { x: number; y: number }[];
    const childPositions = [...union.children].map((childId) => personPositions.get(childId)).filter(Boolean) as { x: number; y: number }[];
    const allPositions = [...parentPositions, ...childPositions];
    const fallbackIndex = nodes.length;
    const x = allPositions.length ? average(allPositions.map((position) => position.x + 84)) - 8 : fallbackIndex * 48;
    const parentY = parentPositions.length ? Math.max(...parentPositions.map((position) => position.y)) : 0;
    const y = parentY + unionYOffset;

    nodes.push({
      id: union.id,
      type: 'union',
      position: { x, y },
      data: { parents: union.parents }
    });

    union.parents.forEach((parentId) => {
      edges.push({
        id: `${union.id}__parent__${parentId}`,
        source: parentId,
        target: union.id,
        type: 'smoothstep',
        animated: Boolean(union.partnerRelId),
        label: union.partnerRelId ? 'Партнёры' : undefined,
        style: union.partnerRelId ? { strokeDasharray: '4 4' } : undefined
      });
    });

    union.children.forEach((childId) => {
      edges.push({
        id: `${union.id}__child__${childId}`,
        source: union.id,
        target: childId,
        type: 'smoothstep'
      });
    });
  });

  return { nodes, edges };
}

function findPartnerPair(parentIds: string[], partnerPairs: Set<string>) {
  for (let firstIndex = 0; firstIndex < parentIds.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < parentIds.length; secondIndex += 1) {
      const firstId = parentIds[firstIndex];
      const secondId = parentIds[secondIndex];
      if (partnerPairs.has(pairKey(firstId, secondId))) return [firstId, secondId];
    }
  }

  return null;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
