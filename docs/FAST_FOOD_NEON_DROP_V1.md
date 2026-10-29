# Kikeled Letreros — Fast Food Neon, Drop 01

## Propósito

Convertir el drop Fast Food Neon en una colección pública navegable, con cuatro familias de diseños, filtros, fotografías, fichas individuales y contacto por WhatsApp.

Esta fase no modifica la base de datos, los roles, los pedidos ni el panel privado de Kikeled OS. Reutiliza el catálogo público `WebProduct` existente.

## Ruta

`/drops/fast-food-neon`

## Cómo publicar cada diseño

En el editor actual `/admin/contenido`, crea un producto para cada modelo. Utiliza **exactamente uno** de estos valores en el campo `Categoría`:

| Colección | Valor del campo Categoría |
| --- | --- |
| Neon Crew | `Fast Food Neon / Neon Crew` |
| Dominican Street Food | `Fast Food Neon / Dominican Street Food` |
| Sweet Neon | `Fast Food Neon / Sweet Neon` |
| Drinks Neon | `Fast Food Neon / Drinks Neon` |

Completa nombre, descripción, precio de referencia (o `0` para mostrar «Consultar precio»), materiales, tamaños, miniatura y galería. Marca `Publicado` para que el diseño aparezca en la web. La ficha individual se crea automáticamente usando el `slug` del producto y el enlace `/catalogo/:slug`.

Los modelos se ordenan por el campo `Orden`. Un modelo oculto no aparece en el drop. Las fichas existentes siguen usando el formulario `/cotizar?producto=...` y enlaces de WhatsApp; ningún botón cobra por internet.

## Contenido pendiente

- Incorporar las fotografías y artes **reales y aprobados** de los 30 modelos creados en conversaciones anteriores. Este repositorio no contiene esos 30 archivos.
- Confirmar precios, medidas recomendadas, tiempo de fabricación y materiales antes de publicar cada modelo.
- Sustituir las cuatro imágenes editoriales conceptuales por portadas oficiales si así se decide.
- Revisar el comportamiento móvil y el backend en entorno QA antes de despliegue productivo.

La página no muestra modelos ficticios ni declara que los 30 diseños estén publicados. Cuando una colección no tiene artículos activos, presenta un estado vacío y la opción de consultar por WhatsApp.
Si falla la conexión con el catálogo público, se muestra un aviso de error y un botón **Reintentar carga**, distinto al estado de colección vacía.
El contador de publicaciones se ajusta a la colección seleccionada y la búsqueda indica sus coincidencias. Al regresar de una ficha, se conserva la ruta de origen y sus filtros.

## Pruebas

- `npm run test:drops` comprueba categorías, selección de productos activos, filtros, navegación editorial, WhatsApp, recuentos por colección y resistencia a hashes incorrectos.
- `npm run test:chrome` protege el escaparate público preexistente.
- `npm run build` comprueba cliente y servidor.
