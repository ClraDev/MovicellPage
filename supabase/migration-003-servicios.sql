-- Si YA tienes la base de datos creada, ejecuta SOLO este archivo en el SQL Editor.

-- 1) Tabla de servicios
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price_usd   numeric(10,2) check (price_usd >= 0),
  active      boolean not null default true,
  created_at  timestamptz default now()
);
alter table services enable row level security;
create policy "Lectura pública de servicios" on services for select using (true);
create policy "Personal gestiona servicios"  on services for all to authenticated using (true) with check (true);
alter publication supabase_realtime add table services;

-- 2) Los productos ya no tienen la categoría "servicio-tecnico":
--    se ocultan los que existan con esa categoría y se actualiza la regla.
update products set active = false where category = 'servicio-tecnico';
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check
  check (category in ('telefonos','tablets','accesorios')) not valid;
