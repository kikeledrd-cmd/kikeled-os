import type { WebProduct } from '../types/entities';
import { brand } from './brand';
import { currency } from './utils';

export const chromeCategories = [
  { name: 'Letreros circulares', subtitle: 'Tu logo iluminado desde cualquier ángulo', image: '/images/chrome/category-circular.webp', search: 'circular' },
  { name: 'Letras 3D', subtitle: 'Volumen y presencia para tu marca', image: '/images/chrome/category-3d.webp', search: '3D' },
  { name: 'Neón Flex', subtitle: 'Luz y personalidad para cada espacio', image: '/images/chrome/category-neon.webp', search: 'neón' },
  { name: 'Cajas de luz', subtitle: 'Impacto visual de día y de noche', image: '/images/chrome/category-lightbox.webp', search: 'caja' },
] as const;

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function selectChromeProducts(products: WebProduct[], query = '', category = '') {
  const wanted = normalize(query);
  return products
    .filter((product) => product.isActive)
    .filter((product) => !category || normalize(product.category) === normalize(category))
    .filter((product) => !wanted || normalize([product.name, product.category, product.shortDescription].join(' ')).includes(wanted))
    .sort((a, b) => a.order - b.order);
}

export function chromeProductImage(product: WebProduct) {
  if (product.thumbnailUrl && !product.thumbnailUrl.includes('kikeled-logo.png')) return product.thumbnailUrl;
  const uploadedPhoto = product.galleryUrls?.find((url) => url && !url.includes('kikeled-logo.png'));
  if (uploadedPhoto) return uploadedPhoto;
  const subject = normalize(`${product.slug} ${product.name} ${product.category}`);
  if (subject.includes('circular')) return '/images/chrome/category-circular.webp';
  if (subject.includes('neon') || subject.includes('neón')) return '/images/chrome/category-neon.webp';
  if (subject.includes('caja') || subject.includes('panaflex')) return '/images/chrome/category-lightbox.webp';
  return '/images/chrome/category-3d.webp';
}

export function chromeProductGallery(product: WebProduct) {
  const photos = [chromeProductImage(product), ...(product.galleryUrls ?? [])]
    .filter((url) => url && !url.includes('kikeled-logo.png'));
  return Array.from(new Set(photos));
}

export function chromePrice(product: WebProduct) {
  return product.priceFrom > 0 ? `Desde ${currency(product.priceFrom)}` : 'Consultar precio';
}

export function chromeWhatsAppUrl(productName?: string) {
  const message = productName
    ? `Hola, Kikeled Letreros. Me interesa ${productName}. Quiero conocer las opciones y cotizarlo.`
    : 'Hola, Kikeled Letreros. Quiero una cotización para mi negocio.';
  return `${brand.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
