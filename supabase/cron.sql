-- =========================================================
-- Actualización automática de la tasa BCV (cada 30 minutos)
-- Ejecutar DESPUÉS de desplegar la Edge Function "update-rate".
-- Reemplaza <TU-PROYECTO> y <CRON_SECRET> (el mismo que pusiste en los secrets).
-- =========================================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'actualizar-tasa-bcv',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://<TU-PROYECTO>.supabase.co/functions/v1/update-rate',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')
  );
  $$
);
