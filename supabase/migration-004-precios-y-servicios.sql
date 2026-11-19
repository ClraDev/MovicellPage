-- Si YA tienes la base de datos creada, ejecuta SOLO este archivo en el SQL Editor.

-- 1) Precio referencial a tasa BCV por producto (opcional)
alter table products add column if not exists price_bcv_usd numeric(10,2) check (price_bcv_usd >= 0);

-- 2) Ajustes nuevos: recargo % para pagos en Bs y costo de la revisión técnica
insert into settings (key, value) values ('bs_markup', 0)      on conflict (key) do nothing;
insert into settings (key, value) values ('inspection_fee', 0) on conflict (key) do nothing;

-- 3) El servicio técnico ya no usa tabla (son 2 servicios fijos)
drop table if exists services;
