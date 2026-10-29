# Kikeled Letreros — Chrome Edition V1

## Alcance

Primera versión de la **web pública comercial** dentro del repositorio existente de Kikeled OS. No cambia el CRM, la facturación, el panel de clientes, las reglas de acceso ni los procesos internos.

El aspecto visual parte del logo oficial de Kikeled Letreros: negro grafito, plata, cian y acentos ámbar. Es un sitio normal de venta asistida; no simula un escritorio ni un sistema operativo.

## Rutas públicas

| Ruta | Función |
| --- | --- |
| `/` | Portada, categorías, productos destacados, Fast Food Neon, ofertas y Business 360 opcional |
| `/catalogo` | Buscador, categorías, catálogo completo y precios de referencia |
| `/catalogo/:slug` | Ficha individual, galería, materiales, precio y personalización |
| `/cotizar?producto=...` | Formulario de solicitud preexistente de Kikeled OS |
| `/acceso` | Inicio de sesión preexistente para clientes y equipo |

Las rutas existentes de proyectos, servicios y contacto siguen disponibles. Los accesos privados no fueron alterados.

## Cómo publicar productos y fotografías

1. Un administrador usa el editor ya existente en `/admin/contenido`.
2. Crea o edita un producto, define nombre, categoría, descripción, precio de referencia y disponibilidad pública.
3. Sube la **miniatura** (foto principal) y hasta cuatro imágenes en la **galería** desde los controles existentes.
4. Guarda el producto. La portada y el catálogo consultan `/api/public/products`; la ficha utiliza su `slug`, `thumbnailUrl` y `galleryUrls`.
5. Verifica los precios antes de publicar: los incluidos en `defaultWebProducts` son datos iniciales preexistentes, no tarifas nuevas aprobadas.

Cuando faltan fotografías reales, hay referencias conceptuales en `public/images/chrome/` para la presentación. No deben comercializarse como fotografías de obras ejecutadas por la empresa.

## Ventas

- Cada producto tiene `Personalizar` y `WhatsApp`. La ficha también ofrece ambos caminos.
- La conversación comercial y la aprobación del importe final se mantienen en manos del negocio.
- Business 360 se presenta como **complemento opcional**, no como compra obligatoria.
- El bloque Fast Food Neon anuncia el drop; la carga de sus modelos finales, fotos y precios queda pendiente de contenido comercial aprobado.

## Verificación ejecutada

- `npm run test:chrome`: pruebas de identidad visual, navegación, categorías, filtros y ficha individual.
- `npm run build`: compilación cliente y servidor.
- Revisión en navegador local: portada, catálogo, filtro LED, ficha de circular LED y apertura del formulario de cotización con producto seleccionado.

## Antes de publicar a producción

- Sustituir referencias conceptuales por fotos de productos y trabajos auténticos.
- Confirmar lista de precios, condiciones, tiempos e información de contacto.
- Revisar diseño en móvil real y hacer pruebas del backend con los servicios configurados.
- Auditar y probar los flujos privados en un entorno de pruebas antes de ajustar cualquier integración de Kikeled OS.
