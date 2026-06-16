export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'en_cotizacion'
  | 'aprobado'
  | 'en_produccion'
  | 'instalado'
  | 'cerrado'
  | 'perdido';

export type CommercialStatus =
  | 'lead nuevo'
  | 'contactado'
  | 'cotizando'
  | 'cliente activo'
  | 'cliente frecuente'
  | 'cliente premium'
  | 'inactivo';

export type QuoteStatus =
  | 'borrador'
  | 'enviada'
  | 'pendiente'
  | 'aprobada'
  | 'rechazada'
  | 'vencida'
  | 'convertida en orden'
  | 'facturada';

export type OrderStatus =
  | 'pendiente'
  | 'diseño'
  | 'corte'
  | 'impresión'
  | 'ensamblaje'
  | 'listo para instalar'
  | 'instalación'
  | 'entregado'
  | 'cerrado';

export type InvoiceStatus = 'pendiente' | 'abonado' | 'pagado' | 'vencido' | 'cancelado';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'mixto';
export type PremiumPlanName = 'Base' | 'Neon' | 'RGB Elite';

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  roleId: string;
  email: string;
  avatar: string;
  customerId?: string;
}

export interface Lead {
  id: string;
  name: string;
  business: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city?: string;
  businessType?: string;
  source: string;
  interestType: string;
  measures?: string;
  urgency?: string;
  referenceFileUrl?: string;
  description: string;
  estimatedBudget: number;
  status: LeadStatus;
  owner: string;
  nextAction: string;
  notes: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  calculationType: string;
  requiresMeasures: boolean;
  requiresDesign: boolean;
  requiresInstallation: boolean;
  requiresTransport: boolean;
  suggestedMaterials: string[];
  isActive: boolean;
  image: string;
}

export interface PricingRule {
  id: string;
  serviceId: string;
  label: string;
  minMeasure: number;
  maxMeasure: number | null;
  price: number;
}

export interface QuoteItem {
  id: string;
  serviceId: string;
  description: string;
  measures: string;
  quantity: number;
  materials: string[];
  lighting: boolean;
  designIncluded: boolean;
  installationIncluded: boolean;
  transportIncluded: boolean;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  customerId: string;
  leadId?: string;
  items: QuoteItem[];
  estimatedDate: string;
  observations: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: QuoteStatus;
  version: number;
  followUp: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  description: string;
  quantity: number;
  measures: string;
}

export interface OrderMaterial {
  id: string;
  orderId: string;
  materialId: string;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  quoteId?: string;
  service: string;
  items: OrderItem[];
  materialIds: string[];
  owner: string;
  startDate: string;
  promiseDate: string;
  priority: 'alta' | 'media' | 'baja';
  status: OrderStatus;
  progress: number;
  technicalNotes: string;
  installationNotes: string;
  referenceFiles: string[];
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  unitCost: number;
  supplier: string;
  code: string;
  location: string;
  notes: string;
}

export interface InventoryMovement {
  id: string;
  materialId: string;
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
  orderId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  quoteId?: string;
  orderId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  issuedAt: string;
  dueAt?: string;
  paymentMethod: PaymentMethod;
  observations: string;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  note: string;
  createdAt: string;
}

export interface PremiumPlan {
  id: string;
  name: PremiumPlanName;
  description: string;
  discountPercent: number;
  benefits: string[];
  thresholdAmount: number;
  thresholdFrequency: number;
}

export interface PremiumMembership {
  id: string;
  customerId: string;
  planId: string;
  source: 'compra directa' | 'monto acumulado' | 'frecuencia de compra' | 'manual';
  startDate: string;
  endDate: string;
  points: number;
  spentAmount: number;
  activeBenefits: string[];
  usedBenefits: number;
  qrCode: string;
  status: 'activa' | 'vencida';
}

export interface PremiumBenefitUsage {
  id: string;
  membershipId: string;
  customerId: string;
  benefit: string;
  note: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  customerId?: string;
  leadId?: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  customerId?: string;
  orderId?: string;
  quoteId?: string;
  name: string;
  type: string;
  url: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  badge?: string;
  order: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  priceFrom: number;
  priceUnit?: string;
  materials?: string[];
  sizes?: string[];
  deliveryTime?: string;
  details?: string[];
  ctaLabel?: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  clientType: string;
  commercialStatus: CommercialStatus;
  premiumLevel: PremiumPlanName | 'Sin plan';
  createdAt: string;
}

export interface AppData {
  users: User[];
  roles: Role[];
  leads: Lead[];
  customers: Customer[];
  customerNotes: CustomerNote[];
  services: Service[];
  serviceCategories: ServiceCategory[];
  pricingRules: PricingRule[];
  quotes: Quote[];
  orders: Order[];
  materials: Material[];
  inventoryMovements: InventoryMovement[];
  orderMaterials: OrderMaterial[];
  invoices: Invoice[];
  payments: Payment[];
  premiumPlans: PremiumPlan[];
  premiumMemberships: PremiumMembership[];
  premiumBenefitUsage: PremiumBenefitUsage[];
  activities: Activity[];
  attachments: Attachment[];
  heroSlides: HeroSlide[];
  webProducts: WebProduct[];
}
