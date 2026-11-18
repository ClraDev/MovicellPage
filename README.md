# Movicell Services C.A — Tienda web (React + Vite + Tailwind + Supabase)

## 1. Instalar y correr local
```bash
npm install
cp .env.example .env     # y rellena las claves de Supabase
npm run dev
```

## 2. Supabase
1. Crea un proyecto en supabase.com.
2. SQL Editor → pega y ejecuta `supabase/schema.sql`.
3. Authentication → Providers → Email: desactiva "Allow new users to sign up".
4. Authentication → Users → "Add user" → crea el correo/clave del personal.
5. Settings → API: copia `Project URL` y `anon public key` a `.env`.

## 3. Tasa BCV automática
```bash
npm i -g supabase
supabase login
supabase link --project-ref TU-PROYECTO
supabase secrets set CRON_SECRET=clave-larga-aleatoria
supabase functions deploy update-rate --no-verify-jwt
```
Luego edita `supabase/cron.sql` (tu proyecto y la misma clave) y ejecútalo en el SQL Editor.
Respaldo: en `/#/admin` hay un botón "Traer tasa BCV ahora" y un modo manual.

## 4. Publicar en GitHub Pages
1. Sube el proyecto a https://github.com/ClraDev/MovicellPage (rama `main`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → crea `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Cada `git push` despliega: https://clradev.github.io/MovicellPage/
5. Panel del personal: https://clradev.github.io/MovicellPage/#/admin

## 5. Datos del negocio
Todo (teléfonos, horarios, mapa, redes) se edita en `src/config.js`.

## Actualizaciones recientes
- Ejecuta `npm install` otra vez (se agregó `leaflet` para el mapa de delivery).
- En Supabase ejecuta `supabase/migration-004-precios-y-servicios.sql`.
- En `/#/admin` configura: recargo % para pagos en Bs y costo de la revisión técnica.
