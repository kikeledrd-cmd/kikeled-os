# Kikeled OS — Backlog de tareas para Claude Code
Derivado de `ANALISIS_Y_MASTER_PLAN.md`. Ejecutar **en orden**: cada tarea asume que las anteriores están hechas.

## Reglas globales (aplican a toda tarea)
- Rama por fase: `fase-0-estabilizacion`, `fase-1-multiusuario`, etc. Un commit por tarea, mensaje `[T0.3] Backup automático de app_state`.
- Guardar todo archivo en UTF-8. No romper el flujo lead→cliente→cotización→orden→factura→pago.
- Al terminar cada tarea: correr `npm run build` (debe salir verde) y los pasos de prueba de la tarea.
- No agregar features fuera del alcance de la tarea, aunque parezcan fáciles.

---

# FASE 0 — Estabilización

### T0.1 — Limpiar repo de artefactos generados
- **Archivos:** `.gitignore`
- **Hacer:** añadir `dist/`, `dist-direct/`, `dist-server/`, `tmp/`, `*.tsbuildinfo`, `server/data/*.db`, `server/data/*fallback.json`, `uploads/`; luego `git rm -r --cached` de todo lo ya trackeado que matchee.
- **Aceptación:** `git status` limpio tras un build; ninguno de esos archivos aparece en `git ls-files`.
- **Prueba:** `npm run build` → `git status` no muestra archivos nuevos; `git ls-files | grep -E "dist/|tsbuildinfo|\.db$"` vacío.

### T0.2 — Eliminar configs duplicados de Vite
- **Archivos:** borrar `vite.config.js`, `vite.config.d.ts`; queda `vite.config.ts`.
- **Aceptación:** un solo config de Vite en el repo.
- **Prueba:** `npm run dev` levanta cliente y servidor; `npm run build` verde.

### T0.3 — Backup automático de app_state
- **Archivos:** `server/state.ts` (o nuevo `server/backup.ts`), `server/db.ts`
- **Hacer:** en `saveAppData`, antes de escribir, copiar el estado actual a `server/data/backups/app-state-YYYYMMDD-HHmmss.json`. Rotación: conservar máximo 30. Carpeta en `.gitignore`.
- **Aceptación:** cada guardado genera un backup; nunca hay más de 30; el guardado no falla si la carpeta no existe.
- **Prueba:** crear un lead desde `/cotizar` → aparece archivo nuevo en `backups/`; crear 31 cambios → quedan 30 archivos.

### T0.4 — Export/import manual del estado
- **Archivos:** `server/index.ts`, `src/pages/admin/SettingsPage.tsx`, `src/lib/api.ts`
- **Hacer:** `GET /api/admin/export` (descarga el AppData como JSON, solo admin) y `POST /api/admin/import` (valida que sea JSON con las claves de AppData, hace backup previo, reemplaza). Dos botones en Configuración.
- **Aceptación:** exportar descarga un JSON completo; importar ese mismo JSON restaura el sistema idéntico; import inválido devuelve 400 sin tocar datos.
- **Prueba:** exportar → borrar un lead → importar → el lead volvió. Importar un `{}` → error 400 y datos intactos.

### T0.5 — Migración de encoding en datos
- **Archivos:** nuevo `scripts/migrate-encoding.ts`
- **Hacer:** script (correr con `tsx`) que carga el app_state, reemplaza en TODOS los strings: `diseÃ±o→diseño`, `impresiÃ³n→impresión`, `instalaciÃ³n→instalación`, `cotizaciÃ³n→cotización` (y cualquier `Ã` residual reportarlo), hace backup previo, guarda. Modo `--dry-run` por defecto que solo imprime qué cambiaría.
- **Aceptación:** dry-run lista los cambios sin escribir; ejecución real deja cero mojibake en datos y genera backup previo.
- **Prueba:** `npx tsx scripts/migrate-encoding.ts` (dry) → lista cambios; con `--apply` → volver a correr dry-run reporta 0 pendientes.

### T0.6 — Limpiar tipos y strings corruptos en código
- **Archivos:** `src/types/entities.ts`, `src/store/slices/salesSlice.ts` (+ grep global)
- **Hacer:** dejar `OrderStatus` solo con estados canónicos (sin variantes `Ã`); corregir strings mojibake en slices; `grep -r "Ã" src/ server/` y corregir todo. Depende de T0.5 (datos ya migrados).
- **Aceptación:** `grep -r "Ã" src/ server/` vacío; build verde; filtros por estado de orden funcionan.
- **Prueba:** abrir `/admin/ordenes`, cambiar una orden a "diseño" y filtrar/verla correctamente; build verde.

### T0.7 — Confirmación destructiva en reset
- **Archivos:** `src/pages/admin/SettingsPage.tsx`, `src/store/slices/systemSlice.ts`
- **Hacer:** modal que exige escribir `BORRAR` antes de `resetDemo`; el servidor ya habrá hecho backup por T0.3.
- **Aceptación:** click en "Dejar sistema en cero" nunca borra directo; cancelar no toca nada.
- **Prueba:** click → modal; escribir otra cosa → botón deshabilitado; escribir BORRAR → resetea y existe backup previo en `backups/`.

### T0.8 — Unificar dashboards
- **Archivos:** `src/app/App.tsx`, `src/components/layout/navigation.ts`, borrar `src/pages/admin/OsDashboardPage.tsx`
- **Hacer:** `/os/dashboard` → `<Navigate to="/admin" replace />`; quitar referencias.
- **Aceptación:** una sola pantalla de dashboard; la URL vieja redirige.
- **Prueba:** visitar `/os/dashboard` logueado → aterriza en `/admin`; build verde.

### T0.9 — Quitar ruta debug de producción
- **Archivos:** `server/index.ts`
- **Hacer:** eliminar `GET /api/debug/auth` (o moverlo detrás de `NODE_ENV !== 'production'` además del flag).
- **Aceptación:** en producción la ruta devuelve 404 siempre.
- **Prueba:** `curl /api/debug/auth` con `NODE_ENV=production` → 404.

### T0.10 — README + CLAUDE.md reales
- **Archivos:** `README.md`, nuevo `CLAUDE.md`
- **Hacer:** README: qué es, stack, cómo correr (un camino), estructura, env vars (sin credenciales reales — quitar la contraseña demo publicada). CLAUDE.md: arquitectura, convenciones (UTF-8, estados canónicos, español UI), flujos que no se deben romper, comandos.
- **Aceptación:** una persona nueva levanta el proyecto solo con el README; ninguna contraseña en el repo.
- **Prueba:** `grep -ri "KikeledAdmin" .` (fuera de node_modules) vacío; seguir el README desde cero funciona.

---

# FASE 1 — Multi-usuario real

### T1.1 — Bloqueo optimista en PUT /api/app-state
- **Archivos:** `server/index.ts`, `server/state.ts`, `server/db.ts`, `src/lib/api.ts`, `src/store/utils.ts`
- **Hacer:** el GET devuelve `stateVersion` (el `updated_at` guardado); el PUT exige ese `stateVersion` y responde 409 si no coincide con el actual. En 409, el cliente recarga estado y muestra "Otro usuario guardó cambios; se recargaron los datos".
- **Aceptación:** dos sesiones editando ya no se sobrescriben en silencio: la segunda recibe 409 y recarga.
- **Prueba:** abrir dos navegadores como admin; crear lead en A; crear lead en B → B recibe aviso, recarga, y existen ambos leads (B reintenta su acción sobre datos frescos).

### T1.2 — Validar AppData en el servidor
- **Archivos:** nuevo `server/appDataSchema.ts`, `server/index.ts`
- **Hacer:** schema Zod (puede ser laxo por colección: array de objetos con `id` string + campos mínimos) aplicado al body del PUT; rechazar 400 si falta alguna de las 22 colecciones o no son arrays.
- **Aceptación:** un payload vacío/malformado jamás reemplaza el estado.
- **Prueba:** `curl -X PUT /api/app-state -d '{}'` con cookie admin → 400; datos intactos. Flujo normal de la app sigue guardando bien.

### T1.3 — Numeración segura en servidor
- **Archivos:** `server/db.ts` (tabla `counters`), `server/index.ts` (`POST /api/counters/next {entity}`), `src/store/slices/salesSlice.ts`, `src/store/slices/billingSlice.ts`, `src/store/slices/operationsSlice.ts`
- **Hacer:** tabla `counters(entity, year, last_number)`; endpoint transaccional que devuelve el siguiente (`COT-2026-042`, `FAC-…`, `ORD-…`); los slices lo piden en vez de usar `length + 41`. Inicializar counters con el máximo existente en datos.
- **Aceptación:** números únicos incluso borrando registros o con dos sesiones creando a la vez.
- **Prueba:** crear cotización, borrarla (o duplicar varias), crear otra → número nuevo, no repetido; dos ventanas creando cotización simultánea → números distintos.

### T1.4 — Rol ventas: ver datos
- **Archivos:** `server/state.ts` (`filterAppDataForUser`)
- **Hacer:** caso `roleKind === 'sales'`: devolver datos de negocio completos (leads, customers, quotes, orders, invoices, payments, activities, services, pricing, materials) pero `users` solo el propio y sin config sensible.
- **Aceptación:** un usuario sales logueado ve leads/clientes/cotizaciones reales.
- **Prueba:** crear usuario sales en `/admin/usuarios`, loguear en ventana privada → `/admin/leads` muestra los leads existentes (antes: vacío).

### T1.5 — Rol ventas: persistir cambios
- **Archivos:** `src/store/utils.ts` (`syncAdminState` → `syncState`), `server/index.ts`, `server/state.ts`
- **Hacer:** permitir PUT de estado a `sales`; en el servidor, hacer merge restringido: un sales solo puede modificar colecciones comerciales (leads, customers, customerNotes, quotes, invoices, payments, activities, attachments); el resto se toma del estado del servidor. Mantener el check de versión de T1.1.
- **Aceptación:** un vendedor crea lead y cotización, recarga, y todo persiste; no puede alterar users, services ni config.
- **Prueba:** como sales: crear lead → F5 → sigue ahí; intentar (via consola/fetch) mandar `services` alterados → el servidor los ignora.

### T1.6 — Autor real en actividades y órdenes
- **Archivos:** `src/store/utils.ts`, slices que crean actividades/changelog
- **Hacer:** helper que tome `sessionUser.name`/`id` del store y lo grabe en `Activity` (nuevo campo `userId`) y en `OrderChangeLog.author`.
- **Aceptación:** toda actividad nueva registra quién la hizo.
- **Prueba:** crear lead como sales → la actividad muestra el nombre del vendedor, no un string fijo.

### T1.7 — Config de precios avanzada a la base de datos
- **Archivos:** `src/lib/advancedPricing.ts`, `src/types/entities.ts` (+`pricingConfig` en AppData), `src/data/empty.ts`, `src/data/demo.ts`, `src/pages/admin/PricingRulesSettingsPage.tsx`, `src/pages/admin/PricingEnginePage.tsx`
- **Hacer:** mover `AdvancedPricingConfig` de localStorage a `AppData.pricingConfig` (con default actual como semilla); migración: si hay config en localStorage y no en DB, importarla una vez.
- **Aceptación:** la misma configuración de precios aparece en cualquier dispositivo/usuario.
- **Prueba:** editar un multiplicador en un navegador → abrir otro navegador/usuario → mismo valor. Borrar localStorage → config persiste.

### T1.8 — Reportes veraces
- **Archivos:** `src/pages/admin/ReportsPage.tsx`, nuevo `src/lib/reports.ts`
- **Hacer:** `ventasPorMes` (agrupar invoices por mes de `issuedAt`, últimos 6 meses), `topServicios` (desde items de facturas/cotizaciones facturadas, no del catálogo), embudo leads (nuevo→contactado→cotizado→aprobado→perdido). Corregir etiquetas.
- **Aceptación:** cada cifra del reporte es reproducible a mano desde los datos; ninguna etiqueta miente.
- **Prueba:** con datos demo, sumar a mano las facturas de un mes → coincide; el servicio más facturado encabeza "más vendidos".

### T1.9 — Panel Diario v1
- **Archivos:** `src/pages/admin/AdminDashboardPage.tsx`, `src/lib/reports.ts`
- **Hacer:** reordenar el dashboard en 3 franjas: (1) Requiere acción: leads `nuevo` sin contactar, cotizaciones `enviada` con >7 días, órdenes con `promiseDate` vencida, facturas con balance vencido; cada item con link directo. (2) Órdenes en curso por estado. (3) Números del mes.
- **Aceptación:** todo lo listado en "Requiere acción" es real y clickeable; si no hay pendientes, lo dice.
- **Prueba:** crear lead nuevo → aparece en franja 1; convertirlo/contactarlo → desaparece; orden con promesa ayer → aparece como atrasada.

### T1.10 — Módulo de tareas
- **Archivos:** `src/types/entities.ts` (+`Task`, +colección `tasks`), `src/data/empty.ts`, nuevo `src/store/slices/tasksSlice.ts`, `src/store/useAppStore.ts`, `src/store/types.ts`, nueva `src/pages/admin/TasksPage.tsx`, `src/app/App.tsx`, `navigation.ts`
- **Hacer:** Task: title, dueAt, assignedTo, relatedType/relatedId, status (pendiente/completada), createdBy. CRUD + lista con filtros (mías/todas, vencidas). Tareas vencidas aparecen en Panel Diario.
- **Aceptación:** crear/completar tareas ligadas a un lead u orden; vencidas visibles en el panel.
- **Prueba:** crear tarea con fecha ayer → aparece en panel como vencida; completarla → desaparece; ligarla a un lead → link abre el lead.

### T1.11 — Rol producción
- **Archivos:** `server/auth.ts`, `server/state.ts`, `server/index.ts` (enum de roles), `src/data/empty.ts` (rol), `src/app/App.tsx` (allow), `navigation.ts`
- **Hacer:** nuevo `role-production`/`roleKind: 'production'`: acceso solo a `/admin/ordenes*`, `/admin/inventario`, tareas propias y dashboard; `filterAppDataForUser` le da órdenes/materiales/tareas sin dinero (sin invoices/payments/quotes montos).
- **Aceptación:** usuario producción actualiza estados de orden y ficha técnica; no ve facturación ni cotizaciones.
- **Prueba:** loguear como producción → menú reducido; `/admin/facturacion` redirige; cambiar estado de una orden funciona y persiste.

---

# FASE 2 — Cotizador + PDF + flujo de pedidos

### T2.1 — Vencimiento de cotizaciones
- **Archivos:** `src/types/entities.ts` (`Quote.validUntil`, `sentAt`), `salesSlice.ts`, `QuotesPage.tsx`, `QuoteDetailPage.tsx`
- **Hacer:** default configurable (15 días); al pasar la fecha sin aprobación, estado visual `vencida`; genera tarea de seguimiento automática al día 7 sin respuesta.
- **Aceptación:** ninguna cotización enviada queda sin fecha límite ni seguimiento.
- **Prueba:** crear cotización con vencimiento ayer → se lista como vencida; cotización enviada hace 8 días → existe tarea de seguimiento.

### T2.2 — PDF de cotización en servidor
- **Archivos:** `server/index.ts` (`GET /api/quotes/:id/pdf`), nuevo `server/pdf.ts`, `QuoteDetailPage.tsx` (botón Descargar PDF)
- **Hacer:** render HTML de la cotización (reusar layout de `QuotePrintPage`) → PDF con Playwright/Chromium headless. Marca Kikeled sobria, ITBIS desglosado, validez, condiciones.
- **Aceptación:** PDF descargable idéntico entre navegadores, legible en móvil.
- **Prueba:** descargar PDF de una cotización demo → abre en el teléfono, montos correctos, logo presente.

### T2.3 — Envío por WhatsApp con un click
- **Archivos:** `QuoteDetailPage.tsx`, `InvoiceDetailPage.tsx`, nuevo `src/lib/whatsapp.ts`, `message_templates` en AppData
- **Hacer:** botón "Enviar por WhatsApp": abre `wa.me/<whatsapp del cliente>?text=<plantilla con nombre, número de cotización, total y link/adjunto>`; marca `sentAt` y estado `enviada`. Plantillas editables en Configuración.
- **Aceptación:** de cotización creada a mensaje listo en WhatsApp: 2 clicks.
- **Prueba:** click → se abre WhatsApp con mensaje correcto y datos del cliente; la cotización queda `enviada` con fecha.

### T2.4 — Cotizador wizard
- **Archivos:** nueva `src/pages/admin/QuoteWizardPage.tsx`, `App.tsx`, reuso de `advancedPricing.ts`
- **Hacer:** pasos: cliente/lead → servicio → medidas (ancho×alto → m²) → material → instalación/ciudad → resumen con ITBIS → crear. Validación por paso (rhf+zod). El form actual queda como "modo rápido".
- **Aceptación:** un vendedor sin conocer precios produce una cotización correcta en <5 minutos.
- **Prueba:** completar wizard con caja de luz 2×1 m → total = base + material + instalación + transporte + ITBIS según reglas; cotización creada y vinculada al cliente.

### T2.5 — Anticipo requerido para producción
- **Archivos:** `operationsSlice.ts`, `OrderDetailPage.tsx`, `settings` (porcentaje configurable)
- **Hacer:** al convertir cotización en orden, si la factura ligada no tiene abono ≥ X% (default 50), la orden nace `pendiente` con aviso "falta anticipo"; bloqueo suave (warning, no candado) para pasar a producción.
- **Aceptación:** ninguna orden entra a producción sin que el sistema avise que falta anticipo.
- **Prueba:** orden sin abono → banner de anticipo; registrar abono 50% → banner desaparece.

### T2.6 — Campo NCF en facturas
- **Archivos:** `src/types/entities.ts` (`Invoice.ncf?`), `BillingPage.tsx`, `InvoiceDetailPage.tsx`, `InvoicePrintPage.tsx`
- **Hacer:** campo opcional NCF (y RNC/cédula en Customer si falta) visible en la factura impresa.
- **Aceptación:** una factura con NCF y RNC se imprime con formato fiscal correcto.
- **Prueba:** asignar NCF a factura demo → aparece en la vista de impresión.

---

# FASE 3 — Producción + inventario + agenda

### T3.1 — Kanban de órdenes
- **Archivos:** `OrdersPage.tsx` (o nueva `OrdersBoardPage.tsx`)
- **Hacer:** columnas por estado canónico; drag & drop cambia estado (con el mismo `updateOrderStatus`); toggle tabla/kanban.
- **Aceptación:** arrastrar tarjeta = cambio de estado persistido con actividad registrada.
- **Prueba:** mover orden de "corte" a "impresión" → recargar → sigue en impresión; changelog registra el cambio y el autor.

### T3.2 — Descuento automático de inventario
- **Archivos:** `operationsSlice.ts`, `inventorySlice.ts`
- **Hacer:** al pasar una orden a `entregado` (o `cerrado`), generar movimientos `salida` por cada `orderMaterial` (una sola vez; marcar orden como `stockDescontado`). Si el stock queda bajo mínimo, crear alerta/tarea.
- **Aceptación:** completar una orden descuenta stock exactamente una vez, incluso repitiendo el cambio de estado.
- **Prueba:** orden con 2 materiales asignados → marcar entregada → stock baja; volver a cambiar estado → no vuelve a bajar; material bajo mínimo aparece en panel.

### T3.3 — Agenda de instalaciones/entregas
- **Archivos:** `src/types/entities.ts` (+`ScheduleEvent`), nuevo `src/store/slices/scheduleSlice.ts`, nueva `src/pages/admin/SchedulePage.tsx`, `App.tsx`, `navigation.ts`, `OrderDetailPage.tsx` (botón "Agendar")
- **Hacer:** evento: orderId, tipo (instalación/entrega/medición), fecha, franja, dirección (pre-cargada de la ficha técnica), instalador, estado. Vista semanal simple (grid por día). Aviso si el instalador ya tiene evento en esa franja.
- **Aceptación:** toda instalación tiene fecha, responsable y dirección; choques advertidos.
- **Prueba:** agendar instalación desde una orden → aparece en la semana; agendar otra al mismo instalador misma franja → warning; eventos de hoy aparecen en Panel Diario.

### T3.4 — Fotos de avance y entrega
- **Archivos:** `OrderDetailPage.tsx`, `attachmentsSlice.ts`, `server/index.ts` (reusar `/api/upload`)
- **Hacer:** subir fotos ligadas a la orden con etiqueta (avance/terminado/instalado); galería en el detalle.
- **Aceptación:** una orden cerrada tiene evidencia fotográfica accesible desde su detalle y desde el cliente (CRM).
- **Prueba:** subir 2 fotos a una orden → visibles en detalle; sobreviven a recarga y redeploy (según storage de T1/uploads).

### T3.5 — Reporte de producción
- **Archivos:** `ReportsPage.tsx`, `src/lib/reports.ts`
- **Hacer:** órdenes atrasadas (hoy > promiseDate y no entregada), tiempo promedio por estado (desde changelog/procesos), carga por responsable.
- **Aceptación:** el dueño identifica cuellos de botella sin preguntar al taller.
- **Prueba:** con datos demo, una orden atrasada aparece listada con días de atraso correctos.

---

## Orden de ejecución y dependencias
1. Fase 0 completa (T0.1→T0.10) antes de tocar Fase 1. T0.5 antes que T0.6.
2. En Fase 1: T1.1 y T1.2 primero (protegen datos); T1.3 independiente; T1.4→T1.5 juntas; el resto en orden listado.
3. Fase 2 requiere T1.3 (numeración) y T1.7 (precios en DB). Fase 3 requiere T1.10 (tareas) para alertas.
4. Cada tarea = un commit = una sesión corta de Claude Code. Si una tarea crece más de ~6 archivos, dividirla.

## Prompt plantilla por tarea
```
Lee CLAUDE.md y TAREAS_CLAUDE_CODE.md. Ejecuta SOLO la tarea T<X.Y> en la rama <rama-de-fase>.
No toques nada fuera de su alcance. Al terminar: npm run build verde, corre los pasos de prueba
de la tarea y repórtame el resultado de cada uno, los archivos cambiados y por qué.
Si el criterio de aceptación no se cumple, no marques la tarea como hecha: explica qué falta.
```
