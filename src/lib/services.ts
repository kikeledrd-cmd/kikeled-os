import { Zap, Building2, Factory, PackageCheck, Video, MessageCircle } from 'lucide-react';

export const services = [
  {
    title: 'Letreros luminosos',
    description: 'Acrilico LED, cajas de luz, neon flex, troquelados y fachadas 3D para negocios.',
    icon: Zap,
  },
  {
    title: 'Identidad comercial',
    description: 'Piezas fisicas para marcas, puntos de venta, recepciones, eventos y vitrinas.',
    icon: Building2,
  },
  {
    title: 'Produccion y montaje',
    description: 'Flujo desde logo y medidas hasta fabricacion, prueba, instalacion y entrega.',
    icon: Factory,
  },
  {
    title: 'Packaging y unboxing',
    description: 'Stickers, tarjetas, QR, certificados y experiencia premium para cada pedido.',
    icon: PackageCheck,
  },
  {
    title: 'Contenido para redes',
    description: 'Plantillas, reels, ADS y videos Remotion para convertir trabajos en marketing.',
    icon: Video,
  },
  {
    title: 'Cotizacion por WhatsApp',
    description: 'Captura de leads, seguimiento comercial y propuestas listas para aprobar.',
    icon: MessageCircle,
  },
];

export const processSteps = [
  'Recibimos logo, idea, medidas y foto del espacio.',
  'Definimos material, iluminacion, tamano y presupuesto.',
  'Preparamos mockup o propuesta visual para aprobacion.',
  'Fabricamos, probamos iluminacion y preparamos entrega.',
  'Instalamos o entregamos con evidencia y seguimiento.',
];
