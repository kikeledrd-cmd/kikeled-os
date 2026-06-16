# Kikeled OS

Kikeled OS es la app funcional de Kikeled Letreros Publicitarios. Convive con la estructura documental `../Kikeled_OS/RGB_Control`, que sigue funcionando como cerebro operativo para branding, contenido, prompts, QA, Remotion, agentes IA y documentacion.

## Modulos actuales

- `/`: homepage publico oficial de Kikeled Studio SRL con estetica dark RGB, servicios, metodo, catalogo, paquetes, formulario y CTA.
- `/catalogo`: catalogo inicial de productos y precios desde.
- `/cotizar`: formulario publico que crea leads reales en el sistema.
- `/os/dashboard`: CRM basico interno para revisar leads, cambiar estado y ver detalle.
- `/admin`: panel operativo avanzado existente.
- `/portal`: portal cliente existente.

## Flujo operativo

1. El cliente entra a la landing y revisa servicios o catalogo.
2. El cliente envia el formulario de `/cotizar` con datos, medidas y logo/referencia.
3. El lead queda guardado en SQLite dentro del estado de la app.
4. El equipo entra a `/os/dashboard` para contactar, cambiar estado y preparar cotizacion.
5. RGB Control mantiene la documentacion, prompts, assets y QA de la operacion.

## Datos base

- `src/lib/brand.ts`: identidad comercial.
- `src/lib/services.ts`: servicios y proceso.
- `src/lib/packages.ts`: paquetes comerciales.
- `src/lib/products.ts`: catalogo de productos.
- `src/components/brand/Logo.tsx`: logo reusable con fallback textual.
- `src/components/landing/QuoteForm.tsx`: formulario publico reusable conectado a `/api/public/leads`.

## Probar formulario publico

1. Abre `http://localhost:4002/` o `http://localhost:4002/cotizar`.
2. Completa los campos obligatorios y opcionalmente adjunta logo, foto o PDF.
3. Envia el formulario.
4. Debe mostrarse: `Solicitud creada. Ya esta guardada como lead en Kikeled OS.`
5. Entra a `/os/dashboard` o `/admin/leads` para ver el lead nuevo.

## Desarrollo local

```bash
npm.cmd run dev
```

Si Windows bloquea `concurrently`, `tsx`, Vite o `esbuild`, usa el modo preview Express:

```bash
powershell -ExecutionPolicy Bypass -File scripts/start-direct.ps1
```

Luego abre:

- `http://localhost:4002/`

Este modo compila React usando `esbuild.exe` directo, evitando la API de Node que falla con `spawn EPERM` cuando intenta abrir pipes. Luego Express sirve la app real desde `dist-direct`.

Credencial demo admin:

- Email: `kike@kikeled.com`
- Password: `KikeledAdmin#2026`

## Nota tecnica

El MVP intenta usar SQLite mediante `better-sqlite3` y `app_state`. Si el modulo nativo no coincide con la version de Node, cae automaticamente a `server/data/kikeled-os-fallback.json` para que la app pueda arrancar en local. Prisma queda recomendado para una fase posterior si se quiere normalizar modelos como `Lead`, `Product` y `Quote` en tablas separadas.
