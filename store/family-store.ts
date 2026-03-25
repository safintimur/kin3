'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FamilyTree, Person, Relationship, RelationshipType } from '@/types/family';

type PersonInput = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;

interface FamilyState {
  tree: FamilyTree | null;
  persons: Person[];
  relationships: Relationship[];
  selectedPersonId: string | null;
  search: string;
  setInitial: (tree: FamilyTree, persons: Person[], relationships: Relationship[]) => void;
  selectPerson: (id: string | null) => void;
  setSearch: (search: string) => void;
  addPerson: (input: PersonInput) => string;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  removePerson: (id: string) => void;
  addRelationship: (type: RelationshipType, fromPersonId: string, toPersonId: string) => void;
  removeRelationship: (id: string) => void;
}

const id = () => crypto.randomUUID();

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      tree: null,
      persons: [],
      relationships: [],
      selectedPersonId: null,
      search: '',
      setInitial: (tree, persons, relationships) =>
        set((state) => (state.persons.length ? state : { tree, persons, relationships })),
      selectPerson: (selectedPersonId) => set({ selectedPersonId }),
      setSearch: (search) => set({ search }),
      addPerson: (input) => {
        const personId = id();
        const now = new Date().toISOString();
        set((state) => ({
          persons: [...state.persons, { ...input, id: personId, createdAt: now, updatedAt: now }]
        }));
        return personId;
      },
      updatePerson: (personId, patch) =>
        set((state) => ({
          persons: state.persons.map((person) =>
            person.id === personId ? { ...person, ...patch, updatedAt: new Date().toISOString() } : person
          )
        })),
      removePerson: (personId) =>
        set((state) => ({
          persons: state.persons.filter((person) => person.id !== personId),
          relationships: state.relationships.filter((r) => r.fromPersonId !== personId && r.toPersonId !== personId),
          selectedPersonId: state.selectedPersonId === personId ? null : state.selectedPersonId
        })),
      addRelationship: (type, fromPersonId, toPersonId) =>
        set((state) => ({
          relationships: [
            ...state.relationships,
            { id: id(), treeId: state.tree?.id ?? 'tree-demo', type, fromPersonId, toPersonId, createdAt: new Date().toISOString() }
          ]
        })),
      removeRelationship: (relId) =>
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== relId)
        }))
    }),
    {
      name: 'family-tree-store',
      partialize: (state) => ({
        tree: state.tree,
        persons: state.persons,
        relationships: state.relationships
      })
    }
  )
);
