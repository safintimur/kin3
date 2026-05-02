alter table persons
  alter column last_name drop not null,
  alter column birth_date drop not null;

delete from relationships a
using relationships b
where a.ctid < b.ctid
  and a.tree_id = b.tree_id
  and a.type = 'parent_child'
  and a.from_person_id = b.from_person_id
  and a.to_person_id = b.to_person_id;

delete from relationships a
using relationships b
where a.ctid < b.ctid
  and a.tree_id = b.tree_id
  and a.type = 'partner'
  and least(a.from_person_id, a.to_person_id) = least(b.from_person_id, b.to_person_id)
  and greatest(a.from_person_id, a.to_person_id) = greatest(b.from_person_id, b.to_person_id);

create unique index if not exists idx_relationships_unique_parent_child
  on relationships (tree_id, from_person_id, to_person_id)
  where type = 'parent_child';

create unique index if not exists idx_relationships_unique_partner_pair
  on relationships (
    tree_id,
    least(from_person_id, to_person_id),
    greatest(from_person_id, to_person_id)
  )
  where type = 'partner';
