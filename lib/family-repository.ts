import { mockPersons, mockRelationships, mockTree } from '@/lib/mock-data';
import { hasSupabase, supabase } from '@/lib/supabase';
import { FamilyTree, Person, Relationship } from '@/types/family';

export async function loadFamilyData(): Promise<{ tree: FamilyTree; persons: Person[]; relationships: Relationship[] }> {
  if (!hasSupabase || !supabase) {
    return { tree: mockTree, persons: mockPersons, relationships: mockRelationships };
  }

  const { data: trees } = await supabase.from('family_trees').select('*').limit(1);
  const tree = trees?.[0] as FamilyTree;

  const [{ data: persons }, { data: relationships }] = await Promise.all([
    supabase.from('persons').select('*').eq('tree_id', tree.id),
    supabase.from('relationships').select('*').eq('tree_id', tree.id)
  ]);

  return {
    tree,
    persons: (persons ?? []).map(mapPerson),
    relationships: (relationships ?? []).map(mapRel)
  };
}

function mapPerson(row: Record<string, unknown>): Person {
  return {
    id: String(row.id),
    treeId: String(row.tree_id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    gender: String(row.gender) as Person['gender'],
    birthDate: String(row.birth_date),
    deathDate: row.death_date ? String(row.death_date) : null,
    note: row.note ? String(row.note) : null,
    photoUrl: row.photo_url ? String(row.photo_url) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapRel(row: Record<string, unknown>): Relationship {
  return {
    id: String(row.id),
    treeId: String(row.tree_id),
    type: String(row.type) as Relationship['type'],
    fromPersonId: String(row.from_person_id),
    toPersonId: String(row.to_person_id),
    createdAt: String(row.created_at)
  };
}
