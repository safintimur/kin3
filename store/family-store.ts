'use client';

import { create } from 'zustand';
import {
  createPerson,
  createRelationship,
  deletePerson,
  deleteRelationship,
  savePerson
} from '@/lib/family-repository';
import { FamilyTree, Person, PersonInput, Relationship, RelationshipType } from '@/types/family';

interface FamilyState {
  tree: FamilyTree | null;
  persons: Person[];
  relationships: Relationship[];
  selectedPersonId: string | null;
  search: string;
  error: string | null;
  setInitial: (tree: FamilyTree, persons: Person[], relationships: Relationship[]) => void;
  setError: (error: string | null) => void;
  selectPerson: (id: string | null) => void;
  setSearch: (search: string) => void;
  addPerson: (input: PersonInput) => Promise<string>;
  updatePerson: (id: string, patch: Partial<Person>) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
  addRelationship: (type: RelationshipType, fromPersonId: string, toPersonId: string) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;
}

const message = (error: unknown) => (error instanceof Error ? error.message : 'Не удалось сохранить изменения');

export const useFamilyStore = create<FamilyState>()((set, get) => ({
  tree: null,
  persons: [],
  relationships: [],
  selectedPersonId: null,
  search: '',
  error: null,
  setInitial: (tree, persons, relationships) => set({ tree, persons, relationships, error: null }),
  setError: (error) => set({ error }),
  selectPerson: (selectedPersonId) => set({ selectedPersonId }),
  setSearch: (search) => set({ search }),
  addPerson: async (input) => {
    try {
      const person = await createPerson({ ...input, gender: input.gender || 'unknown' });
      set((state) => ({ persons: [...state.persons, person], selectedPersonId: person.id, error: null }));
      return person.id;
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },
  updatePerson: async (personId, patch) => {
    const previous = get().persons.find((person) => person.id === personId);
    if (!previous) return;

    try {
      const person = await savePerson(personId, patch);
      set((state) => ({
        persons: state.persons.map((item) => (item.id === personId ? person : item)),
        error: null
      }));
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },
  removePerson: async (personId) => {
    try {
      await deletePerson(personId);
      set((state) => ({
        persons: state.persons.filter((person) => person.id !== personId),
        relationships: state.relationships.filter((r) => r.fromPersonId !== personId && r.toPersonId !== personId),
        selectedPersonId: state.selectedPersonId === personId ? null : state.selectedPersonId,
        error: null
      }));
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },
  addRelationship: async (type, fromPersonId, toPersonId) => {
    const treeId = get().tree?.id;
    if (!treeId) {
      set({ error: 'Семейное дерево не загружено' });
      throw new Error('Family tree is not loaded');
    }

    const sourceId = type === 'partner' && fromPersonId > toPersonId ? toPersonId : fromPersonId;
    const targetId = type === 'partner' && fromPersonId > toPersonId ? fromPersonId : toPersonId;
    const exists = get().relationships.some((relationship) => {
      if (relationship.type !== type) return false;
      if (type === 'partner') {
        const relSourceId = relationship.fromPersonId < relationship.toPersonId ? relationship.fromPersonId : relationship.toPersonId;
        const relTargetId = relationship.fromPersonId < relationship.toPersonId ? relationship.toPersonId : relationship.fromPersonId;
        return relSourceId === sourceId && relTargetId === targetId;
      }

      return relationship.fromPersonId === fromPersonId && relationship.toPersonId === toPersonId;
    });

    if (exists) {
      set({ error: null });
      return;
    }

    try {
      const relationship = await createRelationship(treeId, type, sourceId, targetId);
      set((state) => ({ relationships: [...state.relationships, relationship], error: null }));
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  },
  removeRelationship: async (relId) => {
    try {
      await deleteRelationship(relId);
      set((state) => ({
        relationships: state.relationships.filter((r) => r.id !== relId),
        error: null
      }));
    } catch (error) {
      set({ error: message(error) });
      throw error;
    }
  }
}));
