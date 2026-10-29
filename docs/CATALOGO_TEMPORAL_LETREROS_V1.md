# Catálogo temporal de Kikeled Letreros — V1

## Objetivo

Mostrar tipos de letreros con precios de referencia mientras se sustituyen los ejemplos por fichas, precios y fotografías reales. **Estas cantidades no son una lista de precios aprobada ni una oferta comercial cerrada.** Las ventas y la aprobación de presupuestos siguen por WhatsApp.

## Inventario de demostración

- La base de ejemplo conserva las 10 fichas originales y añade 9 tipos de letreros (letras 3D, señalética, rotulación, placas, letrero tipo A y menú luminoso).
- Fast Food Neon recibe **cuatro fichas expresamente identificadas como «Ejemplo»**, una por colección. No representan los 30 diseños aprobados y no usan nombres de esos modelos.
- Las fotografías de ejemplo están identificadas como conceptuales. Cada artículo puede recibir miniatura y hasta cuatro fotos desde el editor.
- Los precios son estimaciones temporales en RD$, no presupuestos finales. El cliente personaliza y consulta por WhatsApp.

## Cómo se editan o se importan

1. Ingresa como administrador a `/admin/contenido`, sección **Catálogo editable**.
2. En un proyecto nuevo, los ejemplos forman parte del estado inicial.
3. En una instalación con datos persistentes, usa **Agregar ejemplos faltantes** una sola vez si deseas incorporarlos. La importación es manual y publica los registros que falten.
4. El importador omite IDs y slugs ya existentes; **no sobrescribe** precios, fotos o nombres que hayas personalizado.
5. Haz clic en cualquier ficha para cambiar nombre, slug, categoría, precio, fotografías, materiales, medidas, descripción y si está publicada.
6. Reemplaza cada ficha «Ejemplo» de Fast Food Neon por uno de tus modelos reales o márcala como oculta hasta tener el material listo.

## Restricciones y seguridad

- Sin cambios al backend, CRM, facturación, pedidos, usuarios ni clientes.
- No se importan datos automáticamente sobre estados persistidos.
- La sincronización sigue el mecanismo de administrador existente. Si falla durante la importación, informa cuántas fichas se añadieron y permite reintentar únicamente las restantes.
- No se tocará la rama `main` ni habrá despliegue productivo como parte de esta fase.

## Pruebas

`npm run test:catalog-examples`, `npm run test:chrome`, `npm run test:drops` y `npm run build`.
