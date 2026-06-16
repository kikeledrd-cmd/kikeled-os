import type { AppData } from '../types/entities.js';

/**
 * Estructura base vacía para producción.
 * Conserva: roles del sistema, catálogo de servicios, reglas de precios y planes premium.
 * Vacío: clientes, leads, cotizaciones, órdenes, facturas, pagos, inventario, actividades.
 */
export const emptyData: AppData = {
  roles: [
    { id: 'role-admin', name: 'Administrador', permissions: ['*'] },
    { id: 'role-sales', name: 'Comercial', permissions: ['crm', 'quotes', 'billing'] },
    { id: 'role-client', name: 'Cliente', permissions: ['portal'] },
  ],
  users: [
    { id: 'user-1', name: 'Kike Ventura', roleId: 'role-admin', email: 'kike@kikeled.com', avatar: 'KV' },
    { id: 'user-2', name: 'Mariela Peña', roleId: 'role-sales', email: 'ventas@kikeled.com', avatar: 'MP' },
  ],
  serviceCategories: [
    { id: 'cat-led', name: 'letreros LED' },
    { id: 'cat-acrilico', name: 'acrílico' },
    { id: 'cat-fachadas', name: 'fachadas' },
    { id: 'cat-cajas', name: 'cajas de luz' },
    { id: 'cat-panaflex', name: 'panaflex' },
    { id: 'cat-coroplast', name: 'coroplast' },
    { id: 'cat-vinil', name: 'vinil' },
    { id: 'cat-branding', name: 'branding integral' },
    { id: 'cat-custom', name: 'personalizados' },
  ],
  services: [
    { id: 'srv-1', name: 'Letrero circular LED 18x18', description: 'Acrílico iluminado con terminación premium.', categoryId: 'cat-led', basePrice: 3500, calculationType: 'por tamaño', requiresMeasures: true, requiresDesign: true, requiresInstallation: false, requiresTransport: false, suggestedMaterials: ['Acrílico', 'Módulos LED', 'Fuentes de poder'], isActive: true, image: 'led-circular' },
    { id: 'srv-2', name: 'Caja de luz para fachada', description: 'Caja luminosa con perfilería y frente impreso.', categoryId: 'cat-cajas', basePrice: 18500, calculationType: 'por área', requiresMeasures: true, requiresDesign: true, requiresInstallation: true, requiresTransport: true, suggestedMaterials: ['Panaflex', 'Perfilería', 'Tiras LED'], isActive: true, image: 'light-box' },
    { id: 'srv-3', name: 'Fachada ACM con letras 3D', description: 'Revestimiento ACM con letras corpóreas.', categoryId: 'cat-fachadas', basePrice: 42000, calculationType: 'por proyecto', requiresMeasures: true, requiresDesign: true, requiresInstallation: true, requiresTransport: true, suggestedMaterials: ['ACM', 'Acrílico', 'Cables'], isActive: true, image: 'acm-3d' },
    { id: 'srv-4', name: 'Coroplast publicitario', description: 'Impresión para promociones y señalización temporal.', categoryId: 'cat-coroplast', basePrice: 850, calculationType: 'por unidad', requiresMeasures: true, requiresDesign: false, requiresInstallation: false, requiresTransport: false, suggestedMaterials: ['Coroplast', 'Vinil adhesivo'], isActive: true, image: 'coroplast' },
    { id: 'srv-5', name: 'Panaflex iluminado', description: 'Frente gran formato para puntos comerciales.', categoryId: 'cat-panaflex', basePrice: 16200, calculationType: 'por área', requiresMeasures: true, requiresDesign: true, requiresInstallation: true, requiresTransport: true, suggestedMaterials: ['Panaflex', 'Perfilería', 'Fuentes de poder'], isActive: true, image: 'panaflex' },
    { id: 'srv-6', name: 'Letrero troquelado en acrílico', description: 'Pieza decorativa con corte y acabado profesional.', categoryId: 'cat-acrilico', basePrice: 7400, calculationType: 'por pieza', requiresMeasures: true, requiresDesign: true, requiresInstallation: false, requiresTransport: false, suggestedMaterials: ['Acrílico', 'Resina epóxica'], isActive: true, image: 'acrylic-cut' },
    { id: 'srv-7', name: 'Rotulación en vinil comercial', description: 'Aplicación para vitrinas, paredes y vehículos.', categoryId: 'cat-vinil', basePrice: 6800, calculationType: 'por área', requiresMeasures: true, requiresDesign: true, requiresInstallation: true, requiresTransport: false, suggestedMaterials: ['Vinil adhesivo', 'Vinil transparente'], isActive: true, image: 'vinyl-wrap' },
  ],
  pricingRules: [
    { id: 'pr-1', serviceId: 'srv-1', label: '14x14', minMeasure: 14, maxMeasure: 14, price: 2500 },
    { id: 'pr-2', serviceId: 'srv-1', label: '18x18', minMeasure: 18, maxMeasure: 18, price: 3500 },
    { id: 'pr-3', serviceId: 'srv-1', label: '20x20', minMeasure: 20, maxMeasure: 20, price: 4000 },
    { id: 'pr-4', serviceId: 'srv-1', label: '25x25', minMeasure: 25, maxMeasure: 25, price: 5000 },
    { id: 'pr-5', serviceId: 'srv-1', label: 'Mayor de 25', minMeasure: 26, maxMeasure: null, price: 0 },
  ],
  premiumPlans: [
    { id: 'plan-base', name: 'Base', description: 'Primer nivel de fidelización para clientes recurrentes.', discountPercent: 5, benefits: ['descuento porcentual', 'acceso a promociones privadas'], thresholdAmount: 25000, thresholdFrequency: 2 },
    { id: 'plan-neon', name: 'Neon', description: 'Prioridad comercial y soporte de diseño.', discountPercent: 8, benefits: ['descuento porcentual', 'prioridad en producción', 'revisión de diseño bonificada', 'atención preferente'], thresholdAmount: 75000, thresholdFrequency: 4 },
    { id: 'plan-rgb', name: 'RGB Elite', description: 'Nivel premium con atención prioritaria y beneficios extendidos.', discountPercent: 12, benefits: ['descuento porcentual', 'prioridad en producción', 'revisión de diseño bonificada', 'acceso a promociones privadas', 'atención preferente', 'garantía extendida', 'acceso anticipado a nuevas líneas'], thresholdAmount: 150000, thresholdFrequency: 6 },
  ],

  // --- Todo lo siguiente inicia vacío en producción ---
  customers: [],
  leads: [],
  customerNotes: [],
  quotes: [],
  orders: [],
  materials: [],
  inventoryMovements: [],
  orderMaterials: [],
  invoices: [],
  payments: [],
  premiumMemberships: [],
  premiumBenefitUsage: [],
  activities: [],
  attachments: [],
};
