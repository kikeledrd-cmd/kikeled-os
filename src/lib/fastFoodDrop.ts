import type { WebProduct } from '../types/entities';
import { brand } from './brand';

export const fastFoodCollections = [
  {
    id: 'neon-crew',
    name: 'Neon Crew',
    category: 'Fast Food Neon / Neon Crew',
    label: 'ÍCONOS DE COMIDA CALLEJERA',
    description: 'Piezas con personalidad para hamburgueserías, pizzerías y negocios que quieren destacar.',
    image: '/images/chrome/drop-fast-food.webp',
  },
  {
    id: 'dominican-street-food',
    name: 'Dominican Street Food',
    category: 'Fast Food Neon / Dominican Street Food',
    label: 'SABOR CON IDENTIDAD LOCAL',
    description: 'Una vitrina dedicada al espíritu de nuestra comida callejera y los negocios dominicanos.',
    image: '/images/chrome/category-lightbox.webp',
  },
  {
    id: 'sweet-neon',
    name: 'Sweet Neon',
    category: 'Fast Food Neon / Sweet Neon',
    label: 'POSTRES QUE BRILLAN',
    description: 'Ideas luminosas para heladerías, reposterías, cafeterías y espacios dulces.',
    image: '/images/chrome/category-neon.webp',
  },
  {
    id: 'drinks-neon',
    name: 'Drinks Neon',
    category: 'Fast Food Neon / Drinks Neon',
    label: 'BARRAS Y BEBIDAS',
    description: 'Diseños pensados para bares, cafeterías, food trucks y puntos de venta de bebidas.',
    image: '/images/chrome/category-circular.webp',
  },
] as const;

export type FastFoodCollectionId = (typeof fastFoodCollections)[number]['id'];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function fastFoodCollectionForProduct(product: WebProduct) {
  return fastFoodCollections.find((collection) => normalize(product.category) === normalize(collection.category));
}

export function fastFoodProductBackUrl(product: WebProduct) {
  const collection = fastFoodCollectionForProduct(product);
  return collection ? `/drops/fast-food-neon?coleccion=${collection.id}#modelos` : '/catalogo';
}

export function selectFastFoodDropProducts(products: WebProduct[], collectionId = '', query = '') {
  const wanted = normalize(query);
  return products
    .filter((product) => product.isActive && Boolean(fastFoodCollectionForProduct(product)))
    .filter((product) => !collectionId || fastFoodCollectionForProduct(product)?.id === collectionId)
    .filter((product) => !wanted || normalize(`${product.name} ${product.shortDescription} ${product.description ?? ''}`).includes(wanted))
    .sort((a, b) => a.order - b.order);
}

export function fastFoodPublishedCountLabel(total: number, scoped: number, matches: number, collectionName: string, query: string) {
  const count = collectionName ? scoped : total;
  const label = `${count} ${count === 1 ? 'modelo publicado' : 'modelos publicados'}${collectionName ? ` en ${collectionName}` : ''}`;
  return query.trim() ? `${label} · ${matches} ${matches === 1 ? 'resultado' : 'resultados'}` : label;
}

export function fastFoodDropWhatsAppUrl(collectionName?: string, productName?: string) {
  const message = productName
    ? `Hola, Kikeled Letreros. Me interesa el modelo ${productName} de la colección ${collectionName ?? 'Fast Food Neon'}. Quiero personalizarlo y cotizarlo.`
    : collectionName
      ? `Hola, Kikeled Letreros. Quiero conocer los diseños de la colección ${collectionName} de Fast Food Neon.`
      : 'Hola, Kikeled Letreros. Quiero conocer los diseños del drop Fast Food Neon.';
  return `${brand.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
