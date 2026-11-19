-- Si YA ejecutaste schema.sql antes, corre SOLO este archivo en el SQL Editor.
alter table products add column if not exists images text[] not null default '{}';
alter table products add column if not exists specs  text;
