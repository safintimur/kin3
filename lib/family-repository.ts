import { hasSupabase, supabase } from '@/lib/supabase';
import { FamilyTree, Person, PersonInput, Relationship, RelationshipType } from '@/types/family';

const requireSupabase = () => {
  if (!hasSupabase || !supabase) {
    throw new Error('Supabase environment variables are required.');
  }

  return supabase;
};

export async function loadFamilyData(): Promise<{ tree: FamilyTree; persons: Person[]; relationships: Relationship[] }> {
  const client = requireSupabase();

  const { data: trees, error: treeError } = await client
    .from('family_trees')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1);

  if (treeError) throw treeError;

  if (!trees?.[0]) {
    throw new Error('Family tree is not configured in Supabase.');
  }

  const tree = mapTree(trees[0]);

  const [{ data: persons, error: personsError }, { data: relationships, error: relationshipsError }] = await Promise.all([
    client.from('persons').select('*').eq('tree_id', tree.id).order('created_at', { ascending: true }),
    client.from('relationships').select('*').eq('tree_id', tree.id).order('created_at', { ascending: true })
  ]);

  if (personsError) throw personsError;
  if (relationshipsError) throw relationshipsError;

  return {
    tree,
    persons: (persons ?? []).map(mapPerson),
    relationships: (relationships ?? []).map(mapRelationship)
  };
}

export async function createPerson(input: PersonInput): Promise<Person> {
  const client = requireSupabase();

  const { data, error } = await client
    .from('persons')
    .insert(toPersonRow(input))
    .select('*')
    .single();

  if (error) throw error;
  return mapPerson(data);
}

export async function savePerson(personId: string, patch: Partial<Person>): Promise<Person> {
  const client = requireSupabase();

  const { data, error } = await client
    .from('persons')
    .update(toPersonPatchRow(patch))
    .eq('id', personId)
    .select('*')
    .single();

  if (error) throw error;
  return mapPerson(data);
}

export async function deletePerson(personId: string): Promise<void> {
  const client = requireSupabase();

  const { error } = await client.from('persons').delete().eq('id', personId);
  if (error) throw error;
}

export async function createRelationship(
  treeId: string,
  type: RelationshipType,
  fromPersonId: string,
  toPersonId: string
): Promise<Relationship> {
  const client = requireSupabase();

  const { data, error } = await client
    .from('relationships')
    .insert({
      tree_id: treeId,
      type,
      from_person_id: fromPersonId,
      to_person_id: toPersonId
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRelationship(data);
}

export async function deleteRelationship(relationshipId: string): Promise<void> {
  const client = requireSupabase();

  const { error } = await client.from('relationships').delete().eq('id', relationshipId);
  if (error) throw error;
}

function mapTree(row: Record<string, unknown>): FamilyTree {
  return {
    id: String(row.id),
    title: String(row.title),
    createdAt: String(row.created_at)
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

function mapRelationship(row: Record<string, unknown>): Relationship {
  return {
    id: String(row.id),
    treeId: String(row.tree_id),
    type: String(row.type) as Relationship['type'],
    fromPersonId: String(row.from_person_id),
    toPersonId: String(row.to_person_id),
    createdAt: String(row.created_at)
  };
}

function toPersonRow(input: PersonInput) {
  return {
    tree_id: input.treeId,
    first_name: input.firstName,
    last_name: input.lastName,
    gender: input.gender,
    birth_date: input.birthDate,
    death_date: input.deathDate || null,
    note: input.note || null,
    photo_url: input.photoUrl || null
  };
}

function toPersonPatchRow(patch: Partial<Person>) {
  const row: Record<string, unknown> = {};

  if (patch.firstName !== undefined) row.first_name = patch.firstName;
  if (patch.lastName !== undefined) row.last_name = patch.lastName;
  if (patch.gender !== undefined) row.gender = patch.gender;
  if (patch.birthDate !== undefined) row.birth_date = patch.birthDate;
  if (patch.deathDate !== undefined) row.death_date = patch.deathDate || null;
  if (patch.note !== undefined) row.note = patch.note || null;
  if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl || null;
  row.updated_at = new Date().toISOString();

  return row;
}
