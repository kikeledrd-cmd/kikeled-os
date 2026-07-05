# Kikeled OS — Análisis completo y Master Plan
**Fecha:** 5 de julio de 2026 · **Basado en:** lectura directa del código fuente (src/, server/, api/), git log, README y auditoría previa de abril 2026.

> Nota honesta de arranque: la auditoría anterior (`kikeled_os_audit_report.md`) fue demasiado optimista. El sistema compila y la lógica comercial en memoria funciona, pero tiene **3 defectos estructurales que impiden usarlo en producción real con más de una persona**: persistencia monolítica en un solo JSON, rol de ventas roto, y corrupción de encoding grabada en tipos y datos. Este documento lo detalla todo.

---

## 1. Lectura general del proyecto

**Qué es:** Kikeled OS es una aplicación web full-stack (React 18 + TypeScript + Vite en frontend; Express + SQLite/Postgres/JSON-fallback en backend; Zustand como estado global) que combina tres productos en uno:

1. **Web pública** (`/`, `/catalogo`, `/cotizar`, `/servicios`...): landing comercial de Kikeled Studio con catálogo, paquetes y formulario que crea leads reales.
2. **Panel admin** (`/admin/*`): CRM de leads y clientes, cotizaciones con motor de precios, órdenes de trabajo con ficha técnica y control de calidad, inventario básico, facturación con abonos, Premium Pass (fidelización), contenido web, usuarios y reportes.
3. **Portal cliente** (`/portal/*`): el cliente ve sus cotizaciones, órdenes, facturas y membresía premium, y puede solicitar trabajos.

**Problema que resuelve:** hoy la operación de Kikeled (leads por WhatsApp/Instagram, medidas, cotización, diseño, producción, instalación, cobro) vive dispersa entre chats, notas y memoria. Kikeled OS centraliza el ciclo completo lead → cotización → orden → producción → factura → cobro → fidelización en un solo lugar, con trazabilidad.

**Por qué importa:** un taller de letreros pierde dinero en tres puntos exactos: cotizaciones que no se dan seguimiento, órdenes sin fecha comprometida clara, y balances por cobrar olvidados. El modelo de datos actual ya apunta a esos tres puntos (followUp en Quote, promiseDate en Order, balance en Invoice). La visión es correcta; la ejecución técnica tiene deuda seria.

**Estado real:** ~60% de MVP funcional para **un solo usuario admin**. No está listo para operación multi-usuario ni para datos que importen.

---

## 2. Significado estratégico

Dentro del ecosistema Kikeled (letreros LED, decoración gamer, Docentra, tienda online, contenido, IA):

- **Es la columna vertebral operativa.** Todos los demás frentes (Shopify, redes, Docentra) generan demanda; Kikeled OS es donde esa demanda se convierte en dinero cobrado y producto entregado. Sin él, crecer en marketing solo amplifica el caos.
- **Es el activo de datos.** Cada lead, medida, precio y tiempo de producción registrado es materia prima para la IA (sugerencia de precios, detección de atrasos, resúmenes) y para decidir qué productos empujar.
- **Es el candidato SaaS.** El dominio "talleres de letreros y personalización en LATAM" está mal servido: los CRM genéricos no entienden medidas, materiales, instalación ni ITBIS/NCF dominicano. Si Kikeled OS opera bien internamente 6-12 meses, se convierte en producto vendible con casos reales.
- **Es la vitrina de credibilidad técnica**: "usamos nuestro propio sistema" es argumento de venta para clientes de branding físico-digital.

Prioridad estratégica correcta: **primero herramienta interna que Kikeled use todos los días, después SaaS.** Un SaaS sin uso interno real sería una demo bonita.

---

## 3. Público usuario

| Usuario | Rol en el sistema hoy | Estado real |
|---|---|---|
| **Dueño / admin (Kike)** | `role-admin`, acceso total | Funciona; único rol usable hoy |
| **Ventas** | `role-sales`, rutas permitidas en leads/cotizaciones/facturación | **ROTO**: sus cambios no se guardan y recibe datos vacíos (ver §5) |
| **Producción / taller** | No existe rol; usaría Órdenes, ficha técnica, procesos | Falta rol `production` con vista restringida |
| **Diseño** | No existe; interviene en estado 'diseño' de la orden | Falta cola de diseño y aprobación de artes |
| **Instalación** | No existe; hay campos instalador/fechaInstalacion en ficha técnica | Falta agenda y vista móvil de instalador |
| **Inventario / compras** | Sub-función de admin | Suficiente por ahora dentro de admin |
| **Cliente final** | `role-client`, portal funcional (cotizaciones, facturas, solicitudes) | Funciona, pero es lujo prematuro para el MVP |
| **Empresas externas (SaaS futuro)** | No existe multi-tenant | Fase 6; no intentarlo antes |

Para el MVP interno bastan 3 roles reales: **admin, ventas, producción**. Diseño e instalación pueden ser el mismo rol producción al inicio.

---

## 4. Auditoría de lo existente

### 4.1 Módulos y pantallas (32 páginas)

- **Público (10):** Home, Catálogo, Detalle de paquete, Servicios, Proyectos, Cotizar (form → lead real), Sobre nosotros, Contacto, Acceso/Login. Completo y conectado.
- **Admin (21 rutas):** Dashboard, Leads (+detalle), CRM Clientes (+detalle), Banco de Clientes, Contenido Web (hero slides + productos), Servicios, Motor de Precios, Reglas de precios, Cotizaciones (+detalle +imprimir), Órdenes (+detalle +imprimir +ficha técnica imprimible), Inventario, Facturación (+detalle +imprimir), Premium Pass, Reportes, Usuarios, Configuración, y un segundo dashboard `/os/dashboard`.
- **Portal cliente (7):** Inicio, Cotizaciones, Órdenes, Facturas, Premium Pass, Solicitar trabajo, Perfil.

### 4.2 Lo que funciona de verdad (verificado en código)

- Flujo lead → cliente → cotización → orden → factura → pago con vínculos por ID (`convertLeadToCustomer`, `createQuoteFromLead`, `convertQuoteToOrder`, `createInvoiceFromQuote`, `registerPayment` con balance = `max(total - paid, 0)`).
- Auth real: JWT en cookie, bcrypt, rate-limit en login, helmet, CORS con allowlist, Zod en endpoints públicos. `JWT_SECRET` obligatorio en producción.
- Formulario público de cotización con subida de archivo (multer, whitelist de MIME, límite 50MB) → crea lead con actividad.
- Ficha técnica de producción muy completa (commit más reciente): medidas, iluminación, voltaje, procesos con responsables, control de calidad con checklist, changelog de la orden. Esto es oro para el nicho.
- Contenido web administrable (hero slides con ventanas de publicación, productos con galería).
- ITBIS 18% calculado en cotizaciones.
- Store refactorizado en 9 slices (la auditoría de abril pedía esto; ya está hecho).

### 4.3 Estructura técnica

- **Persistencia:** TODO el estado de negocio (`AppData`: 22 colecciones) se serializa como **un solo string JSON** en una fila `app_state` (SQLite local / Postgres-Supabase en prod / archivo JSON como fallback). Usuarios y media assets sí tienen tablas propias.
- **Sincronización:** cada mutación en el cliente llama `syncAdminState`, que hace `PUT /api/app-state` con **todo el estado completo**. El servidor lo guarda tal cual, sin validar el contenido.
- **Despliegue:** Vercel (funciones en `/api` reexportan la app Express) + Supabase Postgres. Uploads van a `/tmp` en Vercel.
- **Modo alternativo Windows:** `scripts/*-direct.ps1` + `esbuild.exe` commiteado en `.tools/` para evitar `spawn EPERM`.

### 4.4 Funciones falsas, simuladas o solo visuales

- **Reportes** (`ReportsPage.tsx`, 29 líneas): "Ventas por mes" muestra el **total histórico**, no por mes. "Servicios más vendidos" muestra los primeros 4 servicios del catálogo, **no los más vendidos**. Etiquetas que mienten.
- **Rol ventas**: las rutas lo aceptan, pero es teatro — no persiste ni ve datos (§5.1).
- **Premium Pass QR**: genera un string `qrCode`, no un QR escaneable ni validación real.
- **"Motor de Precios" avanzado** (`advancedPricing.ts`): los perfiles de materiales/instalación/ciudades se guardan en **localStorage del navegador** — cada dispositivo tiene su propia configuración de precios; no es dato del sistema.
- **Permisos de roles**: `permissions: ['*']` decorativos; la autorización real es solo por `roleKind`.

### 4.5 Duplicado, confuso o innecesario

- **Dos dashboards**: `AdminDashboardPage` (`/admin`) y `OsDashboardPage` (`/os/dashboard`) hacen lo mismo.
- **Dos configs de Vite**: `vite.config.ts` y `vite.config.js` (+ `.d.ts` generado).
- **Tres carpetas de build commiteadas**: `dist/`, `dist-direct/`, `dist-server/`, más `tsconfig*.tsbuildinfo`, `tmp/dev.log`, `.tools/esbuild.exe` y `server/data/kikeled-os.db` (¡base de datos en git!).
- **Carpetas documentales `00-inbox` … `99-archive`** mezcladas dentro del repo de código, casi todas vacías; `AGENTS.md`, `CHANGELOG.md`, `PROJECT_INDEX.md`, `SOURCE_MAP.md` son stubs de una línea.
- **Banco de Clientes** vs **CRM Clientes**: el "banco" es solo una vista segmentada; no justifica módulo aparte en el menú.
- **`OrderStatus` con estados duplicados corruptos**: `'diseño' | 'diseÃ±o' | 'impresión' | 'impresiÃ³n' | 'instalación' | 'instalaciÃ³n'` — el mismo estado existe en versión sana y en versión mojibake, y hay strings corruptos grabados en código (`type: 'cotizaciÃ³n'` en `salesSlice.ts`).

---

## 5. Diagnóstico del problema

### 5.1 Los 3 problemas que impiden uso real

**A. Persistencia monolítica de un solo escritor** (`server/state.ts`, `src/store/utils.ts`)
Todo el negocio vive en un JSON que el cliente reescribe completo en cada acción. Consecuencias: (1) si dos personas usan el sistema a la vez, **el último en guardar borra los cambios del otro** sin aviso; (2) un bug del cliente puede subir un estado vacío y destruir todo (el endpoint no valida contenido); (3) el payload crece sin límite (ya hay `limit: '15mb'`) y cada guardado reescribe todo; (4) no hay transacciones ni histórico. Es el equivalente a que toda la empresa edite el mismo archivo Excel por turnos, sin turnos.

**B. Rol ventas inoperante** (`syncAdminState` + `filterAppDataForUser`)
`syncAdminState` hace `return` si el usuario no es admin → un vendedor crea leads/cotizaciones y **se pierden en silencio al recargar**. Además `filterAppDataForUser` solo contempla admin o cliente-con-customerId; un usuario `sales` sin customerId recibe **todas las colecciones vacías**. El segundo usuario del sistema —el más importante para vender— no puede trabajar.

**C. Corrupción de encoding institucionalizada**
Archivos guardados con encoding mixto produjeron mojibake dentro de los propios tipos (`OrderStatus`) y de strings de actividad. Hay datos con estados corruptos y el type union los legitima. Todo filtro/reporte por estado será poco fiable hasta limpiar tipos + datos + archivos fuente (normalizar a UTF-8).

### 5.2 Resto del diagnóstico

- **Arquitectura:** el cliente es la autoridad del estado (server = caja tonta). Sin API por entidad no hay permisos granulares, ni validación, ni concurrencia, ni SaaS posible.
- **Datos:** numeración de cotizaciones/facturas por `length` del array (`COT-2026-${quotes.length + 41}`) → números duplicados al borrar o al chocar dos sesiones. Sin soft-delete, sin auditoría de quién hizo qué (solo strings de "owner").
- **Operación:** no existe agenda (instalaciones/entregas), ni tareas, ni recordatorios de seguimiento; el inventario no se descuenta al producir; no hay alertas de cotizaciones vencidas ni facturas por vencer.
- **UX:** botón "Dejar sistema en cero" (`resetDemo`) a un click en Configuración, **sin confirmación** — un dedo resbalado borra la empresa. Reportes engañosos. Dos dashboards confunden cuál es "el" panel.
- **Seguridad:** `PUT /api/app-state` acepta cualquier JSON de un admin sin validación de schema; `rejectUnauthorized: false` en Postgres; credencial demo admin publicada en README (si es la real en producción, cambiarla YA); uploads públicos servidos sin autenticación.
- **Escalabilidad:** con ~2.000 registros el guardado completo por acción se vuelve lento y frágil; imposible multi-tenant.
- **Calidad:** cero tests, cero CI, builds y DB commiteados al repo.
- **Claridad de producto:** conviven web pública, ERP interno y portal cliente en un solo repo/app sin separación clara; el README describe un flujo pero hay dos dashboards y carpetas muertas.

---

## 6. Qué debe corregirse primero

### CRÍTICO (impide funcionar)

| # | Qué está mal | Por qué importa | Qué hacer | Archivos | Resultado esperado |
|---|---|---|---|---|---|
| C1 | Estado completo se reescribe con PUT `app-state` (last-write-wins) | Pérdida de datos con 2+ usuarios; corrupción total posible | Corto plazo: bloqueo optimista con `updatedAt` (rechazar si el estado del servidor cambió) + backup automático por guardado. Mediano: migrar a API por entidad (§10 Fase 1) | `server/state.ts`, `server/index.ts`, `src/store/utils.ts` | Nunca se pierde trabajo de otro usuario; siempre hay copia de respaldo |
| C2 | Rol ventas no persiste ni ve datos | El primer empleado no puede usar el sistema | Permitir a `sales` cargar el appData de negocio (sin usuarios/config) y persistir sus mutaciones; o de una vez endpoints por entidad con permisos | `server/state.ts` (`filterAppDataForUser`), `src/store/utils.ts` (`syncAdminState`) | Un vendedor crea lead y cotización, recarga, y todo sigue ahí |
| C3 | Mojibake en tipos y datos (`diseÃ±o`, `cotizaciÃ³n`) | Filtros, reportes y estados poco fiables; deuda que crece con cada registro | Script de migración que normalice estados en datos guardados; limpiar `OrderStatus` a un solo set; guardar fuentes en UTF-8 | `src/types/entities.ts`, `src/store/slices/salesSlice.ts`, datos en DB | Un único set de estados limpio en tipos, código y datos |
| C4 | Numeración por longitud de array | Números de cotización/factura duplicados = problema legal/comercial | Secuencia persistida en servidor (tabla `counters` o MAX+1 transaccional) | `salesSlice.ts`, `billingSlice.ts`, server | Números únicos e irrepetibles |
| C5 | `resetDemo` sin confirmación en producción | Borrado total accidental | Modal de confirmación con texto a escribir + backup previo automático; ocultar en producción | `SettingsPage.tsx`, `systemSlice.ts` | Imposible borrar todo por accidente |

### ALTO (afecta operación real)

| # | Qué está mal | Qué hacer | Archivos |
|---|---|---|---|
| A1 | Uploads en Vercel van a `/tmp` (se pierden) | Storage persistente (Supabase Storage) o guardar todo en tabla `media_assets` que ya existe | `server/index.ts` |
| A2 | Configuración de precios avanzada en localStorage | Moverla a `AppData`/DB para que sea compartida y respaldada | `src/lib/advancedPricing.ts` |
| A3 | Inventario no se descuenta al completar órdenes | Trigger: orden → estado final ⇒ movimientos `salida` por `orderMaterials` | `operationsSlice.ts`, `inventorySlice.ts` |
| A4 | Reportes con etiquetas falsas | Corregir: ventas agrupadas por mes real, servicios más vendidos desde items de facturas | `ReportsPage.tsx` |
| A5 | Sin backup/restore | Export/import JSON manual + backup automático diario | server |
| A6 | `PUT app-state` sin validación de contenido | Zod schema del AppData completo en el servidor (mientras exista el endpoint) | `server/index.ts` |

### MEDIO (mejora importante)

- M1: Unificar los dos dashboards en uno (`/admin`), redirigir `/os/dashboard`.
- M2: Fusionar "Banco de Clientes" como pestaña dentro de CRM Clientes.
- M3: Limpiar repo: sacar `dist*`, `tmp/`, `*.tsbuildinfo`, `server/data/*.db` a `.gitignore`; borrar `vite.config.js` duplicado; mover carpetas `00-…99-` a un repo/carpeta de documentación aparte.
- M4: Validación de formularios con react-hook-form + zod (ya son dependencias, casi no se usan).
- M5: Rol `production` con vista limitada a órdenes.
- M6: Registrar autor real (userId de sesión) en actividades y changelog, no strings sueltos.

### BAJO (refinamiento)

- B1: QR real en Premium Pass. B2: animaciones/copys landing. B3: dark/light. B4: `rejectUnauthorized` correcto con CA de Supabase. B5: paginación de tablas.

---

## 7. Qué funciones faltan

Evaluación de la lista propuesta contra lo que ya existe:

| Función | Estado | Veredicto |
|---|---|---|
| CRM de clientes | ✅ Existe | Completar: adjuntos por cliente, recordatorios de seguimiento |
| Leads desde WhatsApp/IG/FB | ⚠️ Solo campo `source` manual + form web | **Falta y es vital**: botón "pegar chat de WhatsApp" que parsee a lead (MVP), luego API oficial |
| Cotizador de letreros | ⚠️ Motor por reglas + perfiles, pero config en localStorage | Persistir config; añadir cálculo por m² real (ancho×alto) como primera clase |
| Cotización PDF | ⚠️ Página imprimible (print del navegador) | Suficiente para MVP; generar PDF descargable + link compartible por WhatsApp en Fase 2 |
| Gestión de pedidos | ✅ Órdenes completas con ficha técnica | Añadir tablero kanban por estado |
| Estados de producción | ✅ Procesos con responsables | Conectar con notificaciones/alertas de atraso |
| Inventario de materiales | ⚠️ CRUD + movimientos manuales | Descuento automático por orden (A3), alertas de stock mínimo en dashboard |
| Agenda de instalación | ❌ No existe | **Construir**: calendario de instalaciones/entregas con instalador asignado |
| Catálogo de productos | ✅ WebProducts + Servicios | OK |
| Historial de clientes | ✅ Actividades + métricas | OK |
| Reportes de ventas | ❌ Falsos (§4.4) | Rehacer con datos reales por mes/servicio/vendedor |
| Reportes de producción | ❌ No existe | Tiempos por proceso, órdenes atrasadas, carga del taller |
| Panel diario | ⚠️ Dashboard genérico | Rehacer como "hoy": leads sin contactar, cotizaciones por vencer, órdenes con promesa esta semana, cobros pendientes, instalaciones de hoy |
| Sistema de tareas | ❌ No existe | Tareas simples ligadas a lead/orden/cliente con fecha y responsable |
| Gestión de pagos | ✅ Abonos y balance | Añadir recordatorios de cobro |
| Automatizaciones | ❌ No existe | Empezar con reglas internas (§14), no con n8n/Zapier |
| IA ventas/cotización | ❌ No existe | Ver §14 |
| IA resumen operativo | ❌ No existe | Ver §14 |
| IA sugerencia de precios | ❌ No existe | Requiere 3-6 meses de datos reales primero |
| Shopify | ❌ | Fase 5; no antes |
| WhatsApp Business API | ❌ | Fase 5; mientras tanto links `wa.me` con mensajes pre-generados |
| Facturación fiscal (NCF/e-CF DGII) | ❌ | Investigar requisitos; al menos campo NCF manual en factura en Fase 2 |

---

## 8. Mapa ideal de módulos

| Módulo | Propósito | Usuario | Funciones clave | Datos que consume → genera | Prioridad |
|---|---|---|---|---|---|
| **1. Panel Diario (Hoy)** | Centro de comando: qué hacer hoy | Todos | Leads sin contactar, cotizaciones por vencer, órdenes atrasadas, instalaciones y cobros de hoy, alertas de stock | Todo → nada (lectura) | P0 |
| **2. Leads** | Capturar y convertir demanda | Ventas | Kanban, captura manual/web/WhatsApp-paste, seguimiento con próxima acción y fecha, conversión | Fuentes → clientes, cotizaciones | P0 |
| **3. Clientes (CRM)** | Historial y valor de cada cliente | Ventas/Admin | Ficha 360°, notas, adjuntos, segmentación (absorbe Banco de Clientes), recompra | Leads, facturas → actividades | P0 |
| **4. Cotizador** | Precio correcto en minutos | Ventas | Items por servicio con m²/materiales/instalación/ciudad, versiones, PDF/link, vencimiento, duplicar | Servicios, reglas de precio → cotizaciones | P0 |
| **5. Órdenes / Producción** | Cumplir lo prometido | Producción | Kanban de estados, ficha técnica, procesos, QC, materiales asignados, fotos | Cotizaciones, materiales → movimientos, entregas | P0 |
| **6. Agenda** | Instalaciones y entregas sin choques | Producción/Instalador | Calendario semanal, asignación de instalador, dirección, checklist de instalación | Órdenes → eventos, cierres | P1 |
| **7. Facturación y Cobros** | Cobrar todo | Admin/Ventas | Facturas, abonos, balances, recordatorios de cobro, campo NCF | Cotizaciones/órdenes → pagos | P0 |
| **8. Inventario** | No parar producción por falta de material | Producción/Admin | Stock, mínimos, movimientos automáticos por orden, compras sugeridas | Órdenes → movimientos, alertas | P1 |
| **9. Catálogo y Precios** | Fuente única de servicios y reglas | Admin | Servicios, categorías, reglas por medida, perfiles de material/instalación/ciudad (en DB) | — → configuración | P0 |
| **10. Reportes** | Decidir con números | Dueño | Ventas por mes/servicio/vendedor, embudo de conversión, producción (tiempos/atrasos), por cobrar | Todo → lecturas | P1 |
| **11. Tareas** | Nada se olvida | Todos | Tarea con responsable, fecha, vínculo a lead/orden/cliente | — → tareas | P1 |
| **12. Web Pública + Contenido** | Generar leads | Marketing/Admin | Landing, catálogo, form cotizar, hero slides, productos | — → leads | P0 (ya existe) |
| **13. Portal Cliente** | Autoservicio y confianza | Cliente | Ver cotizaciones/órdenes/facturas, aprobar cotización, solicitar trabajo | Datos propios → aprobaciones | P2 |
| **14. Premium Pass** | Fidelización | Admin/Cliente | Planes, beneficios, puntos | Facturas → membresías | P2 (congelar) |
| **15. Configuración y Usuarios** | Control del sistema | Admin | Usuarios/roles (admin, ventas, producción), empresa, impuestos, backups | — → config | P0 |
| **16. Asistente IA** | Copiloto operativo | Todos | Resumen diario, borradores de mensajes, clasificación de leads | Todo → sugerencias | P2 |

---

## 9. Flujo operativo ideal (cliente real)

1. **Entrada del lead:** cliente escribe por WhatsApp/IG/FB o llena `/cotizar`. Web → lead automático (ya existe). Chat → botón "Nuevo lead desde chat": se pega la conversación y se extraen nombre, negocio, teléfono, producto (IA simple en Fase 4; manual antes).
2. **Registro:** lead con `source`, tipo de interés, urgencia, presupuesto. Estado `nuevo`. El Panel Diario lo muestra como "sin contactar".
3. **Contacto y medidas:** vendedor responde (mensaje pre-generado con link `wa.me`), pide medidas y foto del espacio. Lead → `contactado`, con `nextAction` y fecha.
4. **Tipo de producto:** se selecciona servicio del catálogo; si requiere medidas/diseño/instalación, el sistema lo exige.
5. **Cotización:** cotizador calcula por m² + perfil de material + instalación + ciudad + ITBIS. Se genera PDF/link y se envía por WhatsApp. Estado `enviada` con vencimiento. Sin respuesta en X días → alerta de seguimiento.
6. **Diseño:** aprobada la cotización, tarea de diseño; el arte se adjunta a la orden y se marca aprobación del cliente (por WhatsApp al inicio; en portal después).
7. **Pago/abono:** se factura desde la cotización y se registra el anticipo (regla de negocio: no entra a producción sin abono ≥ 50%, configurable).
8. **Producción:** orden en kanban: diseño → corte → impresión → ensamblaje → QC → listo. Materiales asignados se descuentan del inventario. Atraso vs `promiseDate` → alerta.
9. **Instalación/entrega:** evento en Agenda con instalador, dirección y checklist (ya existe en ficha técnica). Fotos del trabajo terminado adjuntas.
10. **Cierre:** cobro del balance, factura `pagada`, orden `cerrada`.
11. **Seguimiento:** a los 7 días, tarea automática "pedir reseña de Google" con mensaje pre-generado; a los 3-6 meses, tarea de recompra según tipo de producto.
12. **Recompra/fidelización:** el gasto acumulado sugiere upgrade de Premium Pass.

---

## 10. Modelo de datos recomendado

El modelo de entidades actual (`src/types/entities.ts`) está bien pensado; el problema es que se guarda como blob. La migración es **normalizar las mismas entidades en tablas** (Postgres/Supabase, que ya está configurado). Cambios y adiciones clave:

**Existentes (migrar de blob a tabla, con estos ajustes):**
- `users` (ya es tabla) + `role` enum: admin, sales, production, client.
- `customers` + `rnc` (RNC/cédula, necesario para factura), `createdBy`.
- `leads` + `assignedTo` (userId), `lostReason`, `followUpAt`; estados sin mojibake.
- `services`, `service_categories`, `pricing_rules` (sin cambios de fondo).
- `pricing_profiles` ← **nuevo en DB** (hoy en localStorage): perfiles de material, instalación, ciudad, multiplicadores.
- `quotes` + `validUntil`, `sentAt`, `approvedAt`, `createdBy`; `number` desde secuencia del servidor. `quote_items` como tabla hija.
- `orders` + `assignedTo`, `deliveredAt`; estados limpios: pendiente, diseño, corte, impresión, ensamblaje, listo, instalación, entregado, cerrado. Hijas: `order_items`, `order_materials`, `production_processes`, `technical_sheets`, `quality_controls`, `order_logs`.
- `materials` + `inventory_movements` (con `orderId` y `createdBy`).
- `invoices` + `ncf` (comprobante fiscal), `dueAt` obligatorio; `invoice_items`; `payments`.
- `activities` + `userId` real del autor.
- `attachments`/`media_assets`: unificar en una sola tabla de archivos con vínculo polimórfico (customerId/orderId/quoteId/leadId).
- `hero_slides`, `web_products`, `premium_*` (sin cambios).

**Nuevas:**
- `tasks`: id, title, description, dueAt, assignedTo, relatedType/relatedId (lead/order/customer/invoice), status, createdBy, completedAt.
- `schedule_events` (agenda): id, orderId, type (instalación/entrega/medición), date, timeWindow, address, installerId, status, notes.
- `counters`: entity, year, lastNumber (numeración segura).
- `message_templates`: plantillas WhatsApp (cotización enviada, recordatorio de cobro, pedir reseña).
- `automation_rules` (Fase 4): trigger (evento), condition, action, isActive.
- `audit_log`: quién cambió qué y cuándo (mínimo: entidad, id, acción, userId, timestamp).
- `settings`: empresa, ITBIS, moneda, % de anticipo, días de vencimiento de cotización.
- Futuro SaaS: columna `tenant_id` en todo + tabla `tenants` (no implementar todavía; solo no escribir código que lo imposibilite).

---

## 11. Master Plan de implementación

### Fase 0 — Orden y diagnóstico técnico (1-2 semanas)
- **Objetivo:** repo limpio, sin datos en riesgo, base para trabajar sin romper nada.
- **Construir:** backup automático del `app_state` en cada guardado (carpeta `backups/` con timestamp, rotación de 30); export/import manual JSON; script de migración de encoding.
- **Corregir:** C3 (mojibake en tipos/código/datos), C5 (confirmación en resetDemo), M3 (limpiar repo: .gitignore para dist*/tmp/db/tsbuildinfo, borrar vite.config.js duplicado), mover carpetas documentales fuera del repo de código.
- **Eliminar:** `dist/`, `dist-direct/`, `dist-server/` del control de versiones; `/os/dashboard` (redirect a `/admin`); ruta debug si no se usa.
- **Pantallas:** ninguna nueva.
- **Resultado:** el repo es solo código; los datos tienen respaldo; los estados son consistentes.
- **Riesgos:** migración de encoding sobre datos reales — probar sobre copia.
- **Aceptación:** `npm run build` verde; cero mojibake en grep; backup se genera y restaura; reset pide confirmación.

### Fase 1 — MVP operativo interno (3-4 semanas)
- **Objetivo:** que Kike + 1 vendedor lo usen a diario sin perder datos.
- **Construir:** API por entidad para lo caliente (leads, quotes, orders, invoices, payments, customers) con validación Zod y permisos por rol; secuencias de numeración en servidor (C4); rol ventas funcional (C2); rol producción básico; bloqueo optimista donde quede blob; Panel Diario real; tareas simples; autor real en actividades.
- **Corregir:** C1/C2/C4, A2 (precios a DB), A4 (reportes veraces), A6.
- **Eliminar:** dependencia de `syncAdminState` para las entidades migradas.
- **Pantallas:** Panel Diario (reemplaza dashboard), Tareas; el resto se reconecta.
- **Resultado:** dos usuarios simultáneos sin pisarse; números únicos; el vendedor vive en el sistema.
- **Riesgos:** migración blob→tablas; hacerla entidad por entidad, con el blob como fallback de lectura.
- **Aceptación:** vendedor crea lead→cotización→recarga→persiste; dos sesiones editando no se borran; reportes cuadran con los datos.

### Fase 2 — Cotizador + PDF + flujo de pedidos (2-3 semanas)
- **Objetivo:** cotizar en menos de 5 minutos y enviar por WhatsApp con un click.
- **Construir:** cotizador guiado (servicio → medidas → material → instalación → ciudad → total con ITBIS); PDF descargable con marca Kikeled; link `wa.me` con mensaje pre-armado + archivo; vencimiento y alerta de seguimiento; aprobación → orden con anticipo requerido; campo NCF en factura; plantillas de mensajes.
- **Corregir:** validación de formularios (M4); flujo cotización→orden→factura pulido.
- **Pantallas:** Cotizador wizard, plantillas de mensajes, vista previa PDF.
- **Resultado:** el 100% de cotizaciones de Kikeled salen del sistema.
- **Riesgos:** fidelidad del PDF; usar HTML→PDF en servidor (p.ej. Playwright/Chromium) y no depender del print del navegador.
- **Aceptación:** cotización nueva a WhatsApp en <5 min; PDF correcto en móvil; sin respuesta en X días genera tarea.

### Fase 3 — Inventario + producción + agenda (2-3 semanas)
- **Objetivo:** el taller y las instalaciones dentro del sistema.
- **Construir:** kanban de órdenes; descuento automático de materiales (A3); alertas de stock mínimo; Agenda de instalaciones/entregas con instalador; fotos de avance y entrega; reportes de producción (atrasos, tiempos).
- **Pantallas:** Kanban órdenes, Agenda semanal, vista móvil simple para instalador.
- **Resultado:** promesa de entrega visible y confiable; inventario refleja la realidad.
- **Aceptación:** completar una orden descuenta stock; agenda sin dobles reservas; el dueño ve atrasos sin preguntar.

### Fase 4 — IA + automatizaciones (2-4 semanas)
- **Objetivo:** el sistema avisa y redacta; nadie persigue datos.
- **Construir:** motor simple de reglas internas (evento→acción: crear tarea, marcar vencida, alertar); resumen diario generado por IA (API de Claude) al abrir el panel; "lead desde chat pegado" con extracción IA; borradores de mensajes (seguimiento, cobro, reseña); clasificación de leads (caliente/tibio/frío).
- **Resultado:** cero seguimientos olvidados; mensajes en 1 click.
- **Riesgos:** costo/latencia de IA — todo asincrónico y opcional, con fallback manual.
- **Aceptación:** resumen diario preciso contra datos; parse de chat con >80% de campos correctos.

### Fase 5 — Integraciones externas (según prioridad de negocio)
- WhatsApp Business API (recepción de leads y envío de documentos), Shopify (pedidos → órdenes), email transaccional, facturación fiscal e-CF/DGII si el volumen lo exige, pasarela de pago (tarjeta/transferencia confirmada).
- **Aceptación:** un mensaje entrante crea/actualiza lead sin copiar-pegar.

### Fase 6 — SaaS vendible
- Multi-tenant (tenant_id + aislamiento estricto), onboarding self-service, branding por empresa, planes y cobro (Stripe), documentación, demo con data semilla, hardening de seguridad y auditoría completa.
- **Precondición dura:** 6+ meses de uso interno estable y 2-3 talleres piloto dominicanos dispuestos a pagar.

---

## 12. Backlog técnico priorizado

### P0 — imprescindible
| Tarea | Descripción | Dificultad | Impacto | Módulo | Aceptación |
|---|---|---|---|---|---|
| Backup automático + export/import | Copia con timestamp en cada save; restore probado | Baja | Crítico | server | Restaurar un backup deja el sistema idéntico |
| Migración de encoding | Script normaliza estados/strings en DB y código; types limpios | Media | Crítico | entities/DB | grep sin mojibake; filtros por estado correctos |
| Persistencia segura (optimista → entidades) | `updatedAt` check en PUT app-state; luego endpoints CRUD leads/quotes/orders/invoices/customers/payments con Zod+roles | Alta | Crítico | server/store | Dos usuarios simultáneos no se pisan |
| Arreglar rol ventas | Sales ve datos de negocio y persiste | Media | Crítico | state.ts/utils.ts | Vendedor opera de punta a punta |
| Numeración en servidor | Tabla counters transaccional | Baja | Alto | server | Sin números duplicados jamás |
| Confirmación resetDemo | Modal "escribe BORRAR" + backup previo | Baja | Alto | Settings | Imposible borrado accidental |
| Validar app-state en servidor | Zod del AppData mientras exista el blob | Media | Alto | server | Payload malformado rechazado |

### P1 — necesario para operar
| Tarea | Descripción | Dificultad | Impacto | Módulo | Aceptación |
|---|---|---|---|---|---|
| Panel Diario | Hoy: leads nuevos, cotizaciones por vencer, órdenes atrasadas, cobros, instalaciones | Media | Alto | dashboard | Refleja datos reales del día |
| Reportes veraces | Ventas por mes real, top servicios desde facturas, embudo | Media | Alto | reportes | Cifras cuadran a mano |
| Precios avanzados a DB | pricing_profiles compartidos | Baja | Alto | pricing | Igual config en dos dispositivos |
| Descuento automático de stock | Orden entregada ⇒ salidas por order_materials | Media | Alto | inventario | Stock baja al completar |
| Tareas | CRUD ligado a lead/orden/cliente con responsable y fecha | Media | Alto | tareas | Tarea vencida aparece en panel |
| Agenda instalaciones | Calendario semanal con instalador | Media | Alto | agenda | Sin dobles reservas |
| PDF servidor + link WhatsApp | HTML→PDF descargable; wa.me pre-armado | Media | Alto | cotizador | PDF correcto en móvil |
| Uploads persistentes | Supabase Storage o media_assets para todo | Media | Alto | server | Archivo sobrevive redeploy |
| Rol producción | Vista limitada a órdenes/agenda | Baja | Medio | auth | Producción no ve dinero |
| Kanban de órdenes | Columnas por estado con drag | Media | Medio | órdenes | Cambiar columna = cambiar estado |

### P2 — mejora de experiencia
Unificar dashboards y fusionar Banco de Clientes; validación rhf+zod en formularios; plantillas de mensajes; recordatorios de cobro; fotos en órdenes; resumen diario IA; lead-desde-chat IA; clasificación de leads; paginación y búsqueda global; auditoría (audit_log); tests de flujos críticos + CI.

### P3 — futuro SaaS
Multi-tenant; onboarding y planes de cobro; WhatsApp Business API; Shopify; e-CF DGII; pasarela de pagos; white-label; documentación pública; portal cliente v2 (aprobación de cotizaciones online); Premium Pass v2 con QR real.

---

## 13. Plan visual y UX/UI

**Diagnóstico:** la base es sólida y ya comunica "tech" (dark, glassmorphism `bg-white/5`, bordes `white/10`, acentos RGB, Tailwind consistente, componentes compartidos PageHeader/SectionCard/StatCard/StatusBadge). Los problemas no son de estética sino de **jerarquía y honestidad de la información**.

Mejoras concretas:
- **Dashboard → centro de comando real:** hoy es un collage de métricas totales. Rediseñar en 3 franjas: (1) "Requiere acción hoy" (rojo/ámbar: atrasos, vencimientos, sin contactar), (2) "En movimiento" (kanban resumido de órdenes), (3) "Números del mes". Un dashboard que no ordena qué hacer no es centro de comando.
- **Cards:** reservar el glow RGB para alertas y CTAs; si todo brilla, nada brilla. Cards de datos: neutras, con número grande y delta vs mes anterior.
- **Menú lateral:** 15 entradas es demasiado. Agrupar: Comercial (Leads, Clientes, Cotizaciones), Operación (Órdenes, Agenda, Inventario), Dinero (Facturación, Reportes), Web (Contenido), Sistema (Usuarios, Configuración). Badge de conteo pendiente en Leads y Órdenes.
- **Tablas:** filas más densas, orden por columnas, filtros persistentes, estados como chips de color consistentes (un solo mapa de colores estado→color en todo el sistema), acciones en menú contextual, paginación.
- **Formularios:** wizard para cotizar (paso a paso), errores inline con zod, autosave de borradores.
- **Estados de pedidos:** timeline visual horizontal en el detalle de orden (ya hay datos de procesos para alimentarla).
- **Color:** mantener dark + acentos neón, pero definir tokens semánticos (success/warning/danger/info) separados de los acentos de marca; el rojo debe significar "problema", no "decoración".
- **Tipografía:** una sans geométrica para UI + números tabulares (`tabular-nums`) en tablas de dinero.
- **Móvil:** el admin se usará desde el taller y la calle. Prioridad: Panel Diario, detalle de orden, agenda y registro de pago usables en teléfono. La vista del instalador debe ser móvil-primero.
- **Identidad:** energía gamer/cyberpunk en la web pública y microdetalles del panel (glow en logo, acentos), pero el panel interno debe leerse como herramienta profesional: los documentos que ve el cliente (PDF cotización/factura) deben ser sobrios con acento de marca.

---

## 14. Plan de IA dentro de Kikeled OS

**IA simple (MVP, Fase 4)** — alto valor, bajo riesgo:
1. **Resumen diario operativo:** un prompt con los datos del panel → 5 líneas: qué urge, qué vence, qué cobrar. Botón "Resumen de hoy".
2. **Lead desde chat pegado:** pegar conversación de WhatsApp → extracción de nombre, negocio, teléfono, producto, medidas, urgencia → borrador de lead editable.
3. **Borradores de mensajes:** seguimiento de cotización, recordatorio de cobro, aviso de "su letrero está listo", solicitud de reseña — generados con contexto del cliente, enviados por wa.me.
4. **Clasificación de leads:** caliente/tibio/frío según presupuesto, urgencia y texto.

**IA intermedia (con datos acumulados):**
5. Detección de pedidos en riesgo (comparar avance de procesos vs promiseDate, patrón de atrasos por tipo de producto).
6. Sugerencia de precio: al cotizar, mostrar rango basado en cotizaciones históricas similares (mismo servicio, m² parecido) y su tasa de aprobación.
7. Recomendación de materiales por tipo de trabajo (desde order_materials históricos).
8. Generación de contenido: descripción de producto para catálogo/redes a partir de la ficha técnica y fotos de entrega.

**IA avanzada (futuro):**
9. Asistente de ventas conversacional en WhatsApp (pre-cotización automática con catálogo y reglas de precio).
10. Alertas inteligentes proactivas (patrones: "los clientes de X tipo recompran a los 4 meses; estos 5 tocan esta semana").
11. Pronóstico de compra de materiales según pipeline de cotizaciones.

**Reglas de implementación:** la IA sugiere, nunca ejecuta sola (ni cambia precios ni envía mensajes sin click humano); todo con fallback manual; empezar con API de Claude vía backend (una función `askAI(context, task)` centralizada); registrar cada uso para medir utilidad real.

---

## 15. Qué eliminar o simplificar

Directo:

- **Premium Pass: congelar.** Es el módulo más elaborado en proporción a su urgencia. Un sistema de fidelización con QR y planes, cuando el rol de ventas no guarda datos, es tener postre sin plato fuerte. No borrarlo — dejar de invertirle hasta Fase 5+.
- **Portal cliente: pausar mejoras.** Funciona; déjalo como está. El valor del MVP está en la operación interna. Retomarlo cuando la aprobación de cotizaciones online tenga sentido.
- **`/os/dashboard`: eliminar** (redirect a `/admin`). Dos dashboards = confusión.
- **Banco de Clientes: fusionar** como pestaña "Segmentos" dentro de CRM Clientes.
- **Modo "direct" de Windows (`scripts/*.ps1`, `.tools/esbuild.exe`, `dist-direct`):** infraestructura paralela para esquivar un problema de permisos local. Resolver la causa (permisos/antivirus/Node) y borrar todo el mecanismo. Un solo camino de build.
- **Carpetas `00-inbox`…`99-archive` + stubs (`AGENTS.md`, `PROJECT_INDEX.md`, `SOURCE_MAP.md`):** fuera del repo de código, a una carpeta/repo de documentación. Los stubs de una línea, borrarlos o escribirlos de verdad.
- **`vite.config.js` + `.d.ts` generados:** borrar; queda solo `vite.config.ts`.
- **Ruta `/api/debug/auth`:** eliminarla en producción (aunque tenga flag).
- **Doble type `OrderStatus` corrupto:** eliminar variantes mojibake tras migrar datos.
- **No construir todavía:** integraciones Shopify/WhatsApp API, pasarelas de pago, multi-tenant, chat de soporte, sistema de puntos automático. Todo eso es Fase 5-6.

---

## 16. Roadmap 30 / 60 / 90 días

**Día 30 — "No perdemos nada y vendemos desde el sistema"** (Fases 0 + 1 core)
- Backups automáticos + restore probado. Encoding limpio. Repo limpio.
- Rol ventas operativo; numeración segura; reset con confirmación.
- Persistencia protegida (bloqueo optimista; entidades calientes migrando a API propia).
- Panel Diario v1 y reportes veraces.
- **Criterio:** Kike + vendedor usan el sistema toda la semana sin perder un dato.

**Día 60 — "Cotizar y producir vive aquí"** (Fases 1 fin + 2 + 3 parcial)
- Cotizador wizard + PDF servidor + envío WhatsApp con un click; vencimientos con alerta.
- Tareas; descuento automático de inventario; kanban de órdenes.
- Precios avanzados en DB; uploads persistentes.
- **Criterio:** 100% de cotizaciones del mes salieron del sistema; una orden completada descuenta stock sola.

**Día 90 — "Opera solo y se puede demostrar"** (Fase 3 fin + 4 inicio)
- Agenda de instalaciones; vista móvil del instalador; fotos de entrega.
- Resumen diario IA; lead-desde-chat IA; recordatorios automáticos de seguimiento y cobro.
- Auditoría básica + tests de flujos críticos + CI.
- Demo comercial con data semilla presentable a un taller externo.
- **Criterio:** el dueño abre el Panel Diario y sabe en 60 segundos qué pasa; se puede dar una demo de 15 minutos sin tocar código.

---

## 17. Archivos y documentación a crear

| Documento | Contenido |
|---|---|
| **README.md** | Reescribir: qué es, stack, cómo correr (un solo camino), estructura de carpetas, variables de entorno, deploy. Sin credenciales reales. |
| **CLAUDE.md** | Contexto para agentes: arquitectura, convenciones (UTF-8, español en UI, estados canónicos), qué NO tocar (flujos que funcionan), comandos, dónde está cada cosa. |
| **PRODUCT_BIBLE.md** | Visión, usuarios y roles, flujo operativo ideal (§9), módulos y su propósito (§8), reglas de negocio (anticipo, ITBIS, vencimientos), decisiones tomadas y por qué. |
| **ROADMAP.md** | Fases (§11) y roadmap 30/60/90 (§16), actualizado al cerrar cada fase. |
| **DATABASE_SCHEMA.md** | Entidades, campos, relaciones y enums canónicos (§10); plan de migración blob→tablas; qué está migrado y qué sigue en blob. |
| **UI_DESIGN_SYSTEM.md** | Tokens de color (marca vs semánticos), tipografía, mapa estado→color único, componentes compartidos y cuándo usarlos, reglas responsive. |
| **API_PLAN.md** | Endpoints actuales y objetivo por entidad, contratos (Zod), permisos por rol, versionado. |
| **QA_CHECKLIST.md** | Flujos críticos a probar antes de cada deploy: login por rol, lead→cotización→orden→factura→pago, backup/restore, dos sesiones simultáneas. |
| **CHANGELOG.md** | Reescribir el stub: entradas por fecha con Added/Changed/Fixed. |
| **PROMPTS.md** | Prompts que funcionan para desarrollar el proyecto (incluido el de §18), prompts de las funciones IA internas, y contexto que siempre hay que dar. |

---

## 18. Prompt para la siguiente fase

Copiar y pegar en Claude Code (o aquí) cuando quieras empezar a ejecutar:

```
Actúa como desarrollador senior full-stack del proyecto Kikeled OS (React + TypeScript + Vite + Express + Zustand, persistencia SQLite/Postgres con estado JSON monolítico).

Contexto obligatorio antes de tocar código:
1. Lee ANALISIS_Y_MASTER_PLAN.md completo (raíz del proyecto), en especial las secciones 5 (diagnóstico), 6 (correcciones priorizadas) y 11 (Fase 0 y Fase 1).
2. Lee README.md, src/types/entities.ts, server/state.ts, server/db.ts, server/index.ts y src/store/utils.ts para confirmar la arquitectura actual.
3. Verifica el estado de git y crea una rama segura: git checkout -b fase-0-estabilizacion. No trabajes nunca sobre main.

Alcance ESTRICTO — implementa solo la Fase 0:
- Backup automático del app_state en cada guardado (carpeta backups/ con timestamp, rotación de 30 copias) + endpoint/script de export e import manual.
- Script de migración de encoding: normalizar estados mojibake ('diseÃ±o'→'diseño', 'impresiÃ³n'→'impresión', 'instalaciÃ³n'→'instalación', 'cotizaciÃ³n'→'cotización') en datos guardados; limpiar el type OrderStatus dejando solo estados canónicos; corregir strings corruptos en src/store/slices/*.ts. Probar la migración sobre una copia antes de tocar datos reales.
- Confirmación destructiva en resetDemo (modal que exige escribir BORRAR) + backup previo automático.
- Limpieza de repo: añadir a .gitignore y dejar de trackear dist/, dist-direct/, dist-server/, tmp/, *.tsbuildinfo, server/data/*.db y server/data/*fallback.json; eliminar vite.config.js y vite.config.d.ts (queda vite.config.ts).
- Redirect de /os/dashboard a /admin y eliminar OsDashboardPage de la navegación.

Reglas:
- NO rompas funcionalidades existentes: el flujo lead→cliente→cotización→orden→factura→pago debe seguir funcionando igual.
- NO migres todavía el estado a tablas por entidad (eso es Fase 1). NO agregues features nuevas.
- Cambios pequeños y verificables, un commit por corrección, mensajes claros.
- Guarda todos los archivos en UTF-8.

Al terminar entrega:
1. Lista de cambios por archivo y por qué.
2. Pasos de prueba manual: (a) crear lead desde /cotizar y verlo en /admin/leads; (b) flujo completo hasta pago; (c) provocar un guardado y verificar que aparece backup; (d) restaurar un backup; (e) intentar reset y confirmar que exige confirmación; (f) grep de mojibake devuelve cero resultados.
3. Riesgos pendientes y qué sigue en Fase 1 (persistencia por entidad + arreglo del rol ventas + numeración en servidor).
```

---

## Datos faltantes

Para afinar el plan necesito (no bloquea nada de lo anterior):
1. **Volumen real:** ¿cuántos leads/cotizaciones/órdenes por mes maneja Kikeled hoy? Define cuánta urgencia tiene la migración a tablas.
2. **Usuarios reales hoy:** ¿solo Kike usa el sistema, o ya hay vendedor/taller intentando usarlo? Cambia la prioridad de C2.
3. **Datos en producción:** ¿el deploy de Vercel/Supabase tiene datos reales que haya que proteger antes de migrar encoding? ¿La credencial demo del README es la real?
4. **Facturación fiscal:** ¿Kikeled emite NCF/e-CF con la DGII o factura informal? Define el alcance del módulo de facturación.
5. **Docentra:** qué es exactamente y si toca a Kikeled OS en algún punto (¿comparte clientes? ¿facturación?).
6. **Presupuesto de tiempo:** ¿quién desarrolla y cuántas horas/semana? El roadmap 30/60/90 asume dedicación constante con ayuda de IA.
7. **Dispositivos del taller:** ¿producción tendría tablet/teléfono para actualizar estados? Define cuán móvil-primero debe ser la Fase 3.
