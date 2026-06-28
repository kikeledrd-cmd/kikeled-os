export type KikeledPackage = {
  slug: string;
  name: string;
  price: string;
  description: string;
  audience: string;
  promise: string;
  includes: string[];
  deliverables: string[];
  productSlugs: string[];
  steps: string[];
};

export const packages: KikeledPackage[] = [
  {
    slug: 'kikeled-start',
    name: 'Kikeled Start',
    price: 'Desde RD$4,500',
    description: 'Para negocios nuevos que necesitan verse profesionales rapido.',
    audience: 'Ideal para emprendedores, tiendas pequenas, barberias, salones, food trucks y negocios que necesitan abrir con presencia visual clara.',
    promise: 'Tu marca queda lista para verse profesional en el punto de venta y empezar a recibir clientes por WhatsApp.',
    includes: ['Letrero basico', 'Imagen visual inicial', 'Catalogo digital simple', 'Enlace directo a WhatsApp'],
    deliverables: ['Mockup inicial con tu logo', 'Propuesta visual para aprobacion', 'Producto fisico basico', 'QR o enlace de contacto directo'],
    productSlugs: ['letrero-circular-led', 'letrero-troquelado', 'vinil-rotulacion'],
    steps: ['Nos envias tu logo', 'Preparamos mockup rapido', 'Aprobamos materiales y medidas', 'Fabricamos y entregamos'],
  },
  {
    slug: 'kikeled-pro',
    name: 'Kikeled Pro',
    price: 'Desde RD$18,500',
    description: 'Para negocios que quieren mejorar su presencia fisica y captar mas clientes.',
    audience: 'Pensado para locales activos que quieren verse mas premium, renovar fachada y convertir visitas en contactos reales.',
    promise: 'Tu negocio gana presencia fisica, mejor percepcion de marca y un flujo mas claro para recibir solicitudes.',
    includes: ['Fachada o letrero premium', 'Senaletica o pared de marca', 'Catalogo digital', 'Formulario de clientes'],
    deliverables: ['Mockup de fachada o interior', 'Letrero premium o pieza principal', 'Elementos de marca para el espacio', 'Catalogo o formulario conectado a ventas'],
    productSlugs: ['caja-de-luz', 'panaflex', 'acrilico-led', 'letrero-corporativo'],
    steps: ['Evaluamos tu local', 'Creamos propuesta visual', 'Definimos paquete de piezas', 'Instalamos y dejamos canal de ventas'],
  },
  {
    slug: 'kikeled-360',
    name: 'Kikeled 360',
    price: 'Cotizacion personalizada',
    description: 'Para negocios que quieren relanzarse completo con presencia fisica y sistema digital.',
    audience: 'Para marcas que necesitan una transformacion completa: fachada, interior, contenido, web, catalogo y seguimiento comercial.',
    promise: 'Conectamos el espacio fisico con herramientas digitales para que tu marca se vea, se sienta y venda mejor.',
    includes: ['Diseno de espacio', 'Fachada', 'Branding fisico', 'Web o landing', 'Catalogo digital', 'WhatsApp automatizado', 'CRM / cotizador'],
    deliverables: ['Direccion visual del relanzamiento', 'Mockups de fachada e interior', 'Piezas fisicas de marca', 'Landing o catalogo conectado', 'Flujo de WhatsApp y CRM'],
    productSlugs: ['fachada-3d', 'letrero-corporativo', 'acrilico-led', 'gaming-rgb', 'neon-flex'],
    steps: ['Diagnostico de marca', 'Mapa de presencia fisica y digital', 'Mockups y plan de produccion', 'Implementacion por etapas', 'Sistema comercial conectado'],
  },
];

export function getPackageBySlug(slug?: string) {
  return packages.find((item) => item.slug === slug);
}