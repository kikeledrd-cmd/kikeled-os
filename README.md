# Kikeled OS

Centro de comando interno de Kikeled Studio SRL (letreros, decoración gamer y personalizados en RD). Combina tres frentes en una sola app:

- **Web pública** (`/`, `/catalogo`, `/cotizar`): landing comercial que crea leads reales.
- **Panel admin** (`/admin`): leads, CRM, cotizaciones, órdenes con ficha técnica, inventario, facturación, Premium Pass, contenido web, usuarios y reportes.
- **Portal cliente** (`/portal`): cotizaciones, órdenes, facturas y solicitudes del cliente.

Documentos clave: `ANALISIS_Y_MASTER_PLAN.md` (diagnóstico y plan por fases), `TAREAS_CLAUDE_CODE.md` (backlog ejecutable), `CLAUDE.md` (guía para agentes).

## Stack

React 18 + TypeScript + Vite · Zustand (slices) · Express 5 · Zod · JWT (cookie) + bcrypt · Tailwind.
Persistencia: Postgres (Supabase, vía `DATABASE_URL`) o, en local, SQLite (`better-sqlite3`) con fallback automático a JSON (`server/data/kikeled-os-fallback.json`).

## Desarrollo local

```bash
npm install
npm run dev        # cliente (Vite) + servidor (tsx watch) en paralelo
```

Cliente en `http://localhost:5173`, API en `http://localhost:4000`. Crea el primer usuario admin según la semilla de `server/db.ts` o gestiona usuarios en `/admin/usuarios`. Las credenciales nunca van en este repo.

Si Windows bloquea esbuild/tsx (`spawn EPERM`), existe un modo alterno: `npm run start:direct` (ver `scripts/start-direct.ps1`). Es una solución temporal; el camino oficial es `npm run dev`.

## Build y despliegue

```bash
npm run build      # tsc + vite build + build del servidor
npm start          # sirve dist-server
```

Deploy actual: Vercel (funciones en `api/` reexportan la app Express) + Supabase Postgres. Variables en `.env.example`: `DATABASE_URL`, `JWT_SECRET` (obligatoria en producción), `KIKELED_APP_URL`, `ENABLE_DEBUG_ROUTES`.

## Respaldos y datos

- Cada guardado del estado crea un backup automático en `server/data/backups/` (rotación: 30).
- Export/import manual completo desde `/admin/configuracion` (solo admin).
- Migración de encoding (mojibake): `npx tsx scripts/migrate-encoding.ts` (dry-run) y `--apply` para ejecutar. Corre contra el backend activo según `DATABASE_URL`.

## Estructura

```
api/          funciones Vercel (reexportan server/)
server/       Express: auth, estado, DB (pg/sqlite/json)
src/app/      rutas y App
src/pages/    public/ · admin/ · client/
src/store/    Zustand en slices (auth, crm, sales, operations, billing, inventory, premium, system)
src/types/    entidades del dominio (fuente de verdad de tipos)
src/lib/      api client, pricing, utils
scripts/      migraciones y utilidades
```

## Estado del proyecto

Fase 0 (estabilización) completada: backups, export/import, encoding limpio, reset con confirmación, dashboards unificados. Fase 1 (multi-usuario real: API por entidad, rol ventas, numeración en servidor) es el siguiente paso — ver `ANALISIS_Y_MASTER_PLAN.md` §11.
