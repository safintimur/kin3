export type Gender = 'male' | 'female' | 'other' | 'unknown';

export type RelationshipType = 'parent_child' | 'partner';

export interface Person {
  id: string;
  treeId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  deathDate?: string | null;
  note?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  treeId: string;
  type: RelationshipType;
  fromPersonId: string;
  toPersonId: string;
  createdAt: string;
}

export interface FamilyTree {
  id: string;
  title: string;
  createdAt: string;
}
