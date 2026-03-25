import { FamilyTree, Person, Relationship } from '@/types/family';

const now = new Date().toISOString();

export const mockTree: FamilyTree = {
  id: 'tree-demo',
  title: 'Наша семья',
  createdAt: now
};

export const mockPersons: Person[] = [
  { id: 'p1', treeId: mockTree.id, firstName: 'Иван', lastName: 'Петров', gender: 'male', birthDate: '1955-05-04', deathDate: null, note: 'Любит рыбалку', photoUrl: null, createdAt: now, updatedAt: now },
  { id: 'p2', treeId: mockTree.id, firstName: 'Мария', lastName: 'Петрова', gender: 'female', birthDate: '1957-08-12', deathDate: null, note: null, photoUrl: null, createdAt: now, updatedAt: now },
  { id: 'p3', treeId: mockTree.id, firstName: 'Алексей', lastName: 'Петров', gender: 'male', birthDate: '1982-03-20', deathDate: null, note: null, photoUrl: null, createdAt: now, updatedAt: now },
  { id: 'p4', treeId: mockTree.id, firstName: 'Ольга', lastName: 'Петрова', gender: 'female', birthDate: '1985-10-11', deathDate: null, note: null, photoUrl: null, createdAt: now, updatedAt: now },
  { id: 'p5', treeId: mockTree.id, firstName: 'Ева', lastName: 'Петрова', gender: 'female', birthDate: '2010-02-01', deathDate: null, note: null, photoUrl: null, createdAt: now, updatedAt: now }
];

export const mockRelationships: Relationship[] = [
  { id: 'r1', treeId: mockTree.id, type: 'partner', fromPersonId: 'p1', toPersonId: 'p2', createdAt: now },
  { id: 'r2', treeId: mockTree.id, type: 'parent_child', fromPersonId: 'p1', toPersonId: 'p3', createdAt: now },
  { id: 'r3', treeId: mockTree.id, type: 'parent_child', fromPersonId: 'p2', toPersonId: 'p3', createdAt: now },
  { id: 'r4', treeId: mockTree.id, type: 'partner', fromPersonId: 'p3', toPersonId: 'p4', createdAt: now },
  { id: 'r5', treeId: mockTree.id, type: 'parent_child', fromPersonId: 'p3', toPersonId: 'p5', createdAt: now },
  { id: 'r6', treeId: mockTree.id, type: 'parent_child', fromPersonId: 'p4', toPersonId: 'p5', createdAt: now }
];
