import { personName } from '@/lib/person-format';
import { Person, Relationship } from '@/types/family';

export interface KinshipItem {
  description?: string;
  directRelationshipId?: string;
  directType?: 'parent' | 'child' | 'partner';
  personId: string;
  source: 'direct' | 'derived';
}

export interface KinshipGroup {
  items: KinshipItem[];
  title: string;
}

const unique = (values: string[]) => [...new Set(values)];

export function buildKinshipGroups(personId: string, persons: Person[], relationships: Relationship[]): KinshipGroup[] {
  const personById = new Map(persons.map((person) => [person.id, person]));
  const parents = parentsOf(personId, relationships);
  const children = childrenOf(personId, relationships);
  const partners = partnersOf(personId, relationships);
  const siblings = siblingsOf(personId, persons, relationships, parents);
  const grandparents = unique(parents.flatMap((parentId) => parentsOf(parentId, relationships)));
  const greatGrandparents = unique(grandparents.flatMap((grandparentId) => parentsOf(grandparentId, relationships)));
  const grandchildren = unique(children.flatMap((childId) => childrenOf(childId, relationships)));
  const greatGrandchildren = unique(grandchildren.flatMap((grandchildId) => childrenOf(grandchildId, relationships)));
  const parentsSiblings = unique(parents.flatMap((parentId) => siblingsOf(parentId, persons, relationships, parentsOf(parentId, relationships)).map((item) => item.id)));

  const directRelationshipId = (targetId: string, type: Relationship['type']) =>
    relationships.find((relationship) => {
      if (relationship.type !== type) return false;
      if (type === 'partner') {
        return (
          (relationship.fromPersonId === personId && relationship.toPersonId === targetId) ||
          (relationship.fromPersonId === targetId && relationship.toPersonId === personId)
        );
      }

      return (
        (relationship.fromPersonId === targetId && relationship.toPersonId === personId) ||
        (relationship.fromPersonId === personId && relationship.toPersonId === targetId)
      );
    })?.id;

  const groups: KinshipGroup[] = [
    {
      title: 'Партнёры',
      items: partners.map((partnerId) => ({
        directRelationshipId: directRelationshipId(partnerId, 'partner'),
        directType: 'partner',
        personId: partnerId,
        source: 'direct'
      }))
    },
    {
      title: 'Родители',
      items: parents.map((parentId) => ({
        directRelationshipId: directRelationshipId(parentId, 'parent_child'),
        directType: 'parent',
        personId: parentId,
        source: 'direct'
      }))
    },
    {
      title: 'Дети',
      items: children.map((childId) => ({
        directRelationshipId: directRelationshipId(childId, 'parent_child'),
        directType: 'child',
        personId: childId,
        source: 'direct'
      }))
    },
    {
      title: 'Братья и сёстры',
      items: siblings.map((sibling) => ({
        description: sibling.kind === 'half' ? 'сводн.' : undefined,
        personId: sibling.id,
        source: 'derived'
      }))
    },
    {
      title: 'Дедушки и бабушки',
      items: grandparents.map((grandparentId) => ({ personId: grandparentId, source: 'derived' }))
    },
    {
      title: 'Прадедушки и прабабушки',
      items: greatGrandparents.map((greatGrandparentId) => ({ personId: greatGrandparentId, source: 'derived' }))
    },
    {
      title: 'Внуки',
      items: grandchildren.map((grandchildId) => ({ personId: grandchildId, source: 'derived' }))
    },
    {
      title: 'Правнуки',
      items: greatGrandchildren.map((greatGrandchildId) => ({ personId: greatGrandchildId, source: 'derived' }))
    },
    {
      title: 'Дяди и тёти',
      items: parentsSiblings.map((relativeId) => ({ personId: relativeId, source: 'derived' }))
    }
  ];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => personById.has(item.personId))
    }))
    .filter((group) => group.items.length);
}

export function kinshipItemLabel(item: KinshipItem, persons: Person[]) {
  const person = persons.find((candidate) => candidate.id === item.personId);
  if (!person) return 'Неизвестно';
  return item.description ? `${personName(person)} · ${item.description}` : personName(person);
}

function parentsOf(personId: string, relationships: Relationship[]) {
  return unique(
    relationships
      .filter((relationship) => relationship.type === 'parent_child' && relationship.toPersonId === personId)
      .map((relationship) => relationship.fromPersonId)
  );
}

function childrenOf(personId: string, relationships: Relationship[]) {
  return unique(
    relationships
      .filter((relationship) => relationship.type === 'parent_child' && relationship.fromPersonId === personId)
      .map((relationship) => relationship.toPersonId)
  );
}

function partnersOf(personId: string, relationships: Relationship[]) {
  return unique(
    relationships
      .filter((relationship) => relationship.type === 'partner')
      .map((relationship) => {
        if (relationship.fromPersonId === personId) return relationship.toPersonId;
        if (relationship.toPersonId === personId) return relationship.fromPersonId;
        return null;
      })
      .filter(Boolean) as string[]
  );
}

function siblingsOf(personId: string, persons: Person[], relationships: Relationship[], parentIds: string[]) {
  if (!parentIds.length) return [];
  const parentSet = new Set(parentIds);

  return persons
    .filter((person) => person.id !== personId)
    .map((person) => {
      const candidateParents = parentsOf(person.id, relationships);
      const shared = candidateParents.filter((parentId) => parentSet.has(parentId));
      if (!shared.length) return null;

      const sameParentSet =
        candidateParents.length === parentIds.length && candidateParents.every((parentId) => parentSet.has(parentId));

      return { id: person.id, kind: sameParentSet && parentIds.length > 1 ? 'full' : 'half' };
    })
    .filter(Boolean) as Array<{ id: string; kind: 'full' | 'half' }>;
}
