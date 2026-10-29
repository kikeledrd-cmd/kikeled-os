import type { WebProduct } from '../types/entities.js';

const now = '2026-10-29T00:00:00.000Z';

type CatalogExample = Pick<WebProduct, 'name' | 'slug' | 'category' | 'shortDescription' | 'priceFrom'> &
  Partial<Pick<WebProduct, 'description' | 'thumbnailUrl' | 'materials' | 'sizes' | 'deliveryTime' | 'details'>>;

/** Ejemplos provisionales; el administrador puede editar o eliminar cada ficha. */
const examples: CatalogExample[] = [
  {
    name: 'Letras 3D en PVC', slug: 'letras-3d-pvc', category: 'Letras 3D', priceFrom: 4500,
    shortDescription: 'Letras corpóreas en PVC para paredes, recepciones y fachadas comerciales.',
    materials: ['PVC', 'Pintura', 'Separadores'], sizes: ['Personalizable'],
  },
  {
    name: 'Letras 3D en acrílico iluminado', slug: 'letras-3d-acrilico-led', category: 'Letras 3D', priceFrom: 11500,
    shortDescription: 'Letras volumétricas con iluminación LED para potenciar la presencia de tu marca.',
    materials: ['Acrílico', 'PVC', 'LED', 'Fuente eléctrica'], sizes: ['Según proyecto'],
  },
  {
    name: 'Letrero tipo A', slug: 'letrero-tipo-a', category: 'Señalización', priceFrom: 3500,
    shortDescription: 'Letrero portátil de doble cara para entradas, menús y promociones.',
    materials: ['PVC', 'Vinil', 'Estructura'], sizes: ['Personalizable'],
  },
  {
    name: 'Señalética personalizada', slug: 'senaletica-personalizada', category: 'Señalización', priceFrom: 950,
    shortDescription: 'Placas direccionales e identificadores para oficinas, consultorios y comercios.',
    materials: ['Acrílico', 'Sintra', 'Vinil'], sizes: ['Según señal'],
  },
  {
    name: 'Vinil One Vision', slug: 'vinil-one-vision', category: 'Rotulación', priceFrom: 2500,
    shortDescription: 'Gráficos perforados para vitrinas y cristales comerciales.',
    materials: ['Vinil One Vision'], sizes: ['Según superficie'],
  },
  {
    name: 'Placa corporativa en acrílico', slug: 'placa-corporativa-acrilico', category: 'Corporativo', priceFrom: 2800,
    shortDescription: 'Placa institucional o comercial con acabado moderno y separadores.',
    materials: ['Acrílico', 'Vinil UV', 'Separadores'], sizes: ['Personalizable'],
  },
  {
    name: 'Vinil decorativo de pared', slug: 'vinil-decorativo-pared', category: 'Rotulación', priceFrom: 1800,
    shortDescription: 'Diseños y mensajes para ambientar espacios comerciales e interiores.',
    materials: ['Vinil adhesivo'], sizes: ['Según superficie'],
  },
  {
    name: 'Menú luminoso LED', slug: 'menu-luminoso-led', category: 'Fast Food', priceFrom: 4800,
    shortDescription: 'Menú o panel luminoso para cafeterías, restaurantes y negocios de comida.',
    materials: ['Acrílico', 'LED', 'Vinil', 'Estructura'], sizes: ['Personalizable'],
  },
  {
    name: 'Letrero exterior en Sintra', slug: 'letrero-exterior-sintra', category: 'Exterior', priceFrom: 3500,
    shortDescription: 'Panel troquelado o rectangular para identificar un negocio o local comercial.',
    materials: ['Sintra', 'Vinil', 'Estructura opcional'], sizes: ['Según fachada'],
  },
  {
    name: 'Ejemplo · Hamburguesa Neon Crew', slug: 'ejemplo-hamburguesa-neon-crew', category: 'Fast Food Neon / Neon Crew', priceFrom: 3200,
    shortDescription: 'Concepto provisional de letrero neón con inspiración de comida rápida.',
    thumbnailUrl: '/images/chrome/drop-fast-food.webp', materials: ['Neón flex', 'Base acrílica', 'Fuente LED'],
  },
  {
    name: 'Ejemplo · Sabor Dominicano', slug: 'ejemplo-sabor-dominicano-neon', category: 'Fast Food Neon / Dominican Street Food', priceFrom: 3500,
    shortDescription: 'Concepto provisional inspirado en la comida callejera dominicana.',
    thumbnailUrl: '/images/chrome/category-neon.webp', materials: ['Neón flex', 'Base acrílica'],
  },
  {
    name: 'Ejemplo · Donut Sweet Neon', slug: 'ejemplo-donut-sweet-neon', category: 'Fast Food Neon / Sweet Neon', priceFrom: 2900,
    shortDescription: 'Concepto provisional luminoso para reposterías y cafeterías.',
    thumbnailUrl: '/images/chrome/category-neon.webp', materials: ['Neón flex', 'Base acrílica'],
  },
  {
    name: 'Ejemplo · Café Drinks Neon', slug: 'ejemplo-cafe-drinks-neon', category: 'Fast Food Neon / Drinks Neon', priceFrom: 3200,
    shortDescription: 'Concepto provisional para bares, cafeterías y puntos de bebidas.',
    thumbnailUrl: '/images/chrome/category-neon.webp', materials: ['Neón flex', 'Base acrílica'],
  },
];

export const temporaryCatalogAdditions: WebProduct[] = examples.map((example, index) => ({
  ...example,
  id: `web-demo-${index + 11}`,
  description: example.description ?? `${example.shortDescription} Medidas, acabados y precio sujetos a cotización personalizada.`,
  thumbnailUrl: example.thumbnailUrl ?? '/brand/kikeled-logo.png',
  galleryUrls: [],
  priceUnit: 'unidad',
  materials: example.materials ?? [],
  sizes: example.sizes ?? ['A definir según medidas'],
  deliveryTime: example.deliveryTime ?? 'A confirmar según el proyecto',
  details: example.details ?? ['Ejemplo de catálogo: precio temporal de referencia', 'Personalizable según medidas y acabados'],
  ctaLabel: 'Personalizar y cotizar',
  isFeatured: index < 5,
  isActive: true,
  order: index + 11,
  createdAt: now,
  updatedAt: now,
}));

/** Importa únicamente fichas ausentes; no reemplaza ediciones realizadas en el administrador. */
export function selectMissingTemporaryCatalogProducts(samples: WebProduct[], existing: WebProduct[]) {
  const existingIds = new Set(existing.map((item) => item.id));
  const existingSlugs = new Set(existing.map((item) => item.slug.trim().toLowerCase()));
  return samples.filter((sample) => !existingIds.has(sample.id) && !existingSlugs.has(sample.slug.trim().toLowerCase()));
}
