-- =========================================================
-- Movicell Services C.A  |  Ejecutar en Supabase > SQL Editor
-- =========================================================

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text not null check (category in ('telefonos','tablets','accesorios')),
  price_usd   numeric(10,2) not null check (price_usd >= 0),   -- precio en divisas (efectivo)
  price_bcv_usd numeric(10,2) check (price_bcv_usd >= 0),      -- precio referencial a tasa BCV (opcional)
  stock       integer not null default 0 check (stock >= 0),
  image_url   text,
  images      text[] not null default '{}',   -- galería de fotos
  specs       text,                          -- ficha técnica (una línea por dato)
  active      boolean not null default true,
  created_at  timestamptz default now()
);

create table if not exists settings (
  key        text primary key,
  value      numeric not null,
  updated_at timestamptz default now()
);
insert into settings (key, value) values ('exchange_rate', 0) on conflict do nothing;
insert into settings (key, value) values ('rate_auto', 1)     on conflict do nothing;
insert into settings (key, value) values ('bs_markup', 0)     on conflict do nothing;  -- recargo % pago en Bs
insert into settings (key, value) values ('inspection_fee', 0) on conflict do nothing; -- costo de revisión ($)

-- Seguridad (RLS): lectura pública, escritura solo personal autenticado
alter table products enable row level security;
alter table settings enable row level security;

create policy "Lectura pública de productos" on products for select using (true);
create policy "Personal gestiona productos"  on products for all to authenticated using (true) with check (true);
create policy "Lectura pública de ajustes"   on settings for select using (true);
create policy "Personal actualiza ajustes"   on settings for update to authenticated using (true) with check (true);

-- Realtime (stock y tasa en vivo)
alter publication supabase_realtime add table products, settings;

-- Storage: bucket público para fotos
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict do nothing;

create policy "Imágenes públicas" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "Personal sube imágenes" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "Personal actualiza imágenes" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');
create policy "Personal borra imágenes" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
