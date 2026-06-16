export interface Product {
  id: string;
  name: string;
  description: string;
  materials: string[];
  priceFrom: number;
  measures: string;
  deliveryTime: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 'letrero-circular-led',
    name: 'Letrero circular LED',
    description: 'Pieza redonda iluminada para logos, marcas personales, negocios y decoración interior.',
    materials: ['Acrílico', 'PVC', 'LED', 'Vinil impreso'],
    priceFrom: 4500,
    measures: 'Desde 30 cm hasta 120 cm',
    deliveryTime: '3 a 7 días laborables',
    category: 'LED',
  },
  {
    id: 'letrero-troquelado',
    name: 'Letrero troquelado',
    description: 'Letras o figuras cortadas a la forma del logo para pared, mostrador o fachada.',
    materials: ['PVC', 'Acrílico', 'MDF', 'Vinil'],
    priceFrom: 3800,
    measures: 'Según logo y espacio',
    deliveryTime: '4 a 8 días laborables',
    category: 'Corporativo',
  },
  {
    id: 'caja-de-luz',
    name: 'Caja de luz',
    description: 'Letrero iluminado de alto impacto para fachada, menú, tienda o negocio local.',
    materials: ['Aluminio', 'Acrílico', 'Panaflex', 'LED'],
    priceFrom: 9500,
    measures: 'Desde 60 cm hasta formato fachada',
    deliveryTime: '5 a 10 días laborables',
    category: 'Fachada',
  },
  {
    id: 'panaflex',
    name: 'Panaflex',
    description: 'Solución visible y resistente para fachadas comerciales con impresión a gran formato.',
    materials: ['Panaflex', 'Estructura metálica', 'LED opcional'],
    priceFrom: 6500,
    measures: 'Por metro cuadrado',
    deliveryTime: '3 a 7 días laborables',
    category: 'Exterior',
  },
  {
    id: 'acrilico-led',
    name: 'Acrílico LED',
    description: 'Letrero limpio y moderno con iluminación para marcas que buscan presencia premium.',
    materials: ['Acrílico', 'LED', 'Separadores', 'Fuente eléctrica'],
    priceFrom: 7200,
    measures: 'Según arte y espacio',
    deliveryTime: '5 a 9 días laborables',
    category: 'Premium',
  },
  {
    id: 'letrero-corporativo',
    name: 'Letrero corporativo',
    description: 'Identidad física para oficinas, recepciones, salas de espera y puntos de venta.',
    materials: ['Acrílico', 'PVC', 'Metal', 'Vinil'],
    priceFrom: 8000,
    measures: 'Personalizado',
    deliveryTime: '5 a 10 días laborables',
    category: 'Corporativo',
  },
  {
    id: 'fachada-3d',
    name: 'Fachada 3D',
    description: 'Solución de presencia exterior con volumen, profundidad y acabado comercial.',
    materials: ['PVC', 'ACM', 'Metal', 'LED opcional'],
    priceFrom: 18000,
    measures: 'Levantamiento por proyecto',
    deliveryTime: '7 a 15 días laborables',
    category: 'Exterior',
  },
  {
    id: 'neon-flex',
    name: 'Neón flex',
    description: 'Luz continua y flexible para frases, logos, decoración, eventos y sets de contenido.',
    materials: ['Neón flex LED', 'Acrílico base', 'Fuente'],
    priceFrom: 5500,
    measures: 'Según recorrido del diseño',
    deliveryTime: '4 a 8 días laborables',
    category: 'Decorativo',
  },
  {
    id: 'vinil',
    name: 'Vinil',
    description: 'Rotulación, decoración y señalética para vitrinas, paredes, vehículos y promociones.',
    materials: ['Vinil adhesivo', 'Laminado opcional', 'Impresión digital'],
    priceFrom: 1800,
    measures: 'Por pieza o metro cuadrado',
    deliveryTime: '2 a 5 días laborables',
    category: 'Impresión',
  },
  {
    id: 'gaming-rgb',
    name: 'Gaming RGB',
    description: 'Piezas luminosas para habitaciones, streamers, setups, escritorios y comunidad gamer.',
    materials: ['Acrílico', 'LED RGB', 'Controlador', 'PVC'],
    priceFrom: 5000,
    measures: 'Personalizado',
    deliveryTime: '4 a 9 días laborables',
    category: 'RGB',
  },
];
