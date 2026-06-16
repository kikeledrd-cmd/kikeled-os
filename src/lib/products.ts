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
    description: 'Pieza redonda iluminada para logos, marcas personales, negocios y decoracion interior.',
    materials: ['Acrilico', 'PVC', 'LED', 'Vinil impreso'],
    priceFrom: 4500,
    measures: 'Desde 30 cm hasta 120 cm',
    deliveryTime: '3 a 7 dias laborables',
    category: 'LED',
  },
  {
    id: 'letrero-troquelado',
    name: 'Letrero troquelado',
    description: 'Letras o figuras cortadas a la forma del logo para pared, mostrador o fachada.',
    materials: ['PVC', 'Acrilico', 'MDF', 'Vinil'],
    priceFrom: 3800,
    measures: 'Segun logo y espacio',
    deliveryTime: '4 a 8 dias laborables',
    category: 'Corporativo',
  },
  {
    id: 'caja-de-luz',
    name: 'Caja de luz',
    description: 'Letrero iluminado de alto impacto para fachada, menu, tienda o negocio local.',
    materials: ['Aluminio', 'Acrilico', 'Panaflex', 'LED'],
    priceFrom: 9500,
    measures: 'Desde 60 cm hasta formato fachada',
    deliveryTime: '5 a 10 dias laborables',
    category: 'Fachada',
  },
  {
    id: 'panaflex',
    name: 'Panaflex',
    description: 'Solucion visible y resistente para fachadas comerciales con impresion a gran formato.',
    materials: ['Panaflex', 'Estructura metalica', 'LED opcional'],
    priceFrom: 6500,
    measures: 'Por metro cuadrado',
    deliveryTime: '3 a 7 dias laborables',
    category: 'Exterior',
  },
  {
    id: 'acrilico-led',
    name: 'Acrilico LED',
    description: 'Letrero limpio y moderno con iluminacion para marcas que buscan presencia premium.',
    materials: ['Acrilico', 'LED', 'Separadores', 'Fuente electrica'],
    priceFrom: 7200,
    measures: 'Segun arte y espacio',
    deliveryTime: '5 a 9 dias laborables',
    category: 'Premium',
  },
  {
    id: 'letrero-corporativo',
    name: 'Letrero corporativo',
    description: 'Identidad fisica para oficinas, recepciones, salas de espera y puntos de venta.',
    materials: ['Acrilico', 'PVC', 'Metal', 'Vinil'],
    priceFrom: 8000,
    measures: 'Personalizado',
    deliveryTime: '5 a 10 dias laborables',
    category: 'Corporativo',
  },
  {
    id: 'fachada-3d',
    name: 'Fachada 3D',
    description: 'Solucion de presencia exterior con volumen, profundidad y acabado comercial.',
    materials: ['PVC', 'ACM', 'Metal', 'LED opcional'],
    priceFrom: 18000,
    measures: 'Levantamiento por proyecto',
    deliveryTime: '7 a 15 dias laborables',
    category: 'Exterior',
  },
  {
    id: 'neon-flex',
    name: 'Neon flex',
    description: 'Luz continua y flexible para frases, logos, decoracion, eventos y sets de contenido.',
    materials: ['Neon flex LED', 'Acrilico base', 'Fuente'],
    priceFrom: 5500,
    measures: 'Segun recorrido del diseno',
    deliveryTime: '4 a 8 dias laborables',
    category: 'Decorativo',
  },
  {
    id: 'vinil',
    name: 'Vinil',
    description: 'Rotulacion, decoracion y senaletica para vitrinas, paredes, vehiculos y promociones.',
    materials: ['Vinil adhesivo', 'Laminado opcional', 'Impresion digital'],
    priceFrom: 1800,
    measures: 'Por pieza o metro cuadrado',
    deliveryTime: '2 a 5 dias laborables',
    category: 'Impresion',
  },
  {
    id: 'gaming-rgb',
    name: 'Gaming RGB',
    description: 'Piezas luminosas para habitaciones, streamers, setups, escritorios y comunidad gamer.',
    materials: ['Acrilico', 'LED RGB', 'Controlador', 'PVC'],
    priceFrom: 5000,
    measures: 'Personalizado',
    deliveryTime: '4 a 9 dias laborables',
    category: 'RGB',
  },
];
