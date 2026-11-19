-- Si YA tienes la base de datos creada, ejecuta SOLO este archivo en el SQL Editor.

-- Ajustes propios de la revisión técnica:
--   inspection_markup  = recargo % para el precio en bolívares de la revisión
--   inspection_fee_bcv = precio manual a tasa BCV en $ (0 = calcular con el recargo)
insert into settings (key, value) values ('inspection_markup', 0)  on conflict (key) do nothing;
insert into settings (key, value) values ('inspection_fee_bcv', 0) on conflict (key) do nothing;

-- Permite al personal crear ajustes nuevos desde el panel
drop policy if exists "Personal crea ajustes" on settings;
create policy "Personal crea ajustes" on settings
  for insert to authenticated with check (true);
