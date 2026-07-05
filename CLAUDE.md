# CLAUDE.md — Guía para agentes en Kikeled OS

## Qué es
ERP/CRM interno de Kikeled Studio (letreros y personalizados, República Dominicana) + web pública + portal cliente. Español en toda la UI. Moneda RD$, impuesto ITBIS 18%.

## Documentos
- `ANALISIS_Y_MASTER_PLAN.md`: diagnóstico completo y plan por fases. Leer antes de cambios grandes.
- `TAREAS_CLAUDE_CODE.md`: backlog ejecutable con criterios de aceptación. Ejecutar UNA tarea por vez.

## Arquitectura (estado actual — Fase 0 completada)
- **Frontend:** React 18 + Vite + Tailwind. Rutas en `src/app/App.tsx`. Estado global Zustand en `src/store/slices/*`.
- **Backend:** Express en `server/index.ts`. Auth JWT por cookie (`server/auth.ts`). Vercel reexporta la app desde `api/`.
- **Persistencia (deuda conocida, se corrige en Fase 1):** TODO el negocio (`AppData`, 22 colecciones tipadas en `src/types/entities.ts`) vive como UN solo JSON en la fila `app_state`. Cada mutación del cliente hace `syncAdminState` → `PUT /api/app-state` con el estado completo (`src/store/utils.ts`). Backend: Postgres si hay `DATABASE_URL`; si no SQLite; si el nativo falla, JSON en `server/data/kikeled-os-fallback.json`.
- **Backups:** cada `saveAppData` respalda el estado anterior en `server/data/backups/` (rotación 30). Export/import manual en `/admin/configuracion`.

## Reglas duras
1. **UTF-8 siempre.** Este repo sufrió mojibake (`diseÃ±o`). Antes de commitear: `grep -rn "Ã" src/ server/` debe devolver solo `scripts/migrate-encoding.ts`.
2. **Estados canónicos de orden** (sin variantes): pendiente, diseño, corte, impresión, ensamblaje, listo para instalar, instalación, entregado, cerrado (`OrderStatus` en `src/types/entities.ts`).
3. **No romper el flujo core:** lead → cliente → cotización → orden → factura → pago (slices `crmSlice`, `salesSlice`, `operationsSlice`, `billingSlice`). Probarlo tras cualquier cambio de store o server.
4. **Roles:** solo `admin` persiste estado hoy; `sales` está roto por diseño actual (se arregla en T1.4/T1.5). No "arreglarlo" a medias fuera de esas tareas.
5. **Sin credenciales en el repo.** Ni en README, ni en seeds, ni en tests.
6. **Numeración** de cotizaciones/facturas usa `length` del array (bug conocido, T1.3). No replicar ese patrón en código nuevo.
7. Un commit por tarea, mensaje `[T<X.Y>] descripción`.

## Comandos
```bash
npm run dev                                # desarrollo (cliente + server)
npm run build                              # build completo (debe salir verde antes de commit)
npx tsc -b && npx tsc -p tsconfig.server.json --noEmit   # type-check rápido
npx tsx scripts/migrate-encoding.ts        # dry-run reparación mojibake (--apply para ejecutar)
```

## Pruebas manuales mínimas (QA smoke)
1. `/cotizar` → enviar formulario → lead visible en `/admin/leads`.
2. Lead → Convertir → Crear cotización → Convertir en orden → Facturar → Registrar pago (balance correcto).
3. Guardar algo → aparece backup nuevo en `server/data/backups/`.
4. `/admin/configuracion` → reset exige escribir BORRAR.
5. `/os/dashboard` redirige a `/admin`.

## Contexto de entorno del dueño
Repo en OneDrive (`.git` sensible a locks/corrupción — si git falla con `index.lock` o "index corrupt", ver historial: borrar lock y `git reset` reconstruye). Windows con bloqueos ocasionales de esbuild (`spawn EPERM`); existe modo alterno `start:direct` como paliativo.
