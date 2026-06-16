import { SessionUser } from '../lib/api';
import {
  Activity,
  AppData,
  Attachment,
  Customer,
  Invoice,
  InvoiceItem,
  Lead,
  Material,
  Order,
  Payment,
  PremiumMembership,
  PremiumPlanName,
  Quote,
  QuoteItem,
  Service,
  ServiceCategory,
  HeroSlide,
  WebProduct,
} from '../types/entities';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AppState extends AppData {
  selectedCustomerId: string;
  clientPortalCustomerId: string;
  activeUserId: string | null;
  sessionUser: SessionUser | null;
  authStatus: AuthStatus;
  authError: string | null;
  
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
  
  setSelectedCustomer: (customerId: string) => void;
  setClientPortalCustomer: (customerId: string) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLeadStatus: (leadId: string, status: Lead['status']) => Promise<void>;
  convertLeadToCustomer: (leadId: string) => Promise<void>;
  createQuoteFromLead: (leadId: string) => Promise<string | null>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<string>;
  
  addQuote: (quote: {
    customerId: string;
    leadId?: string;
    items: Array<Omit<QuoteItem, 'id' | 'total'>>;
    estimatedDate: string;
    observations: string;
    discount: number;
    status: Quote['status'];
    followUp: string;
  }) => Promise<string>;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => Promise<void>;
  duplicateQuote: (quoteId: string) => Promise<void>;
  convertQuoteToOrder: (quoteId: string) => Promise<void>;
  createInvoiceFromQuote: (quoteId: string) => Promise<void>;
  
  addOrder: (order: Omit<Order, 'id' | 'number' | 'createdAt'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], progress: number) => Promise<void>;
  assignMaterialsToOrder: (orderId: string, materials: Array<{ materialId: string; quantity: number }>) => Promise<void>;
  
  addManualInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'balance' | 'status'>) => Promise<void>;
  registerPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  
  addMaterial: (material: Omit<Material, 'id'>) => Promise<void>;
  addInventoryMovement: (input: { materialId: string; type: 'entrada' | 'salida'; quantity: number; reason: string; orderId?: string }) => Promise<void>;
  
  assignPremium: (input: Omit<PremiumMembership, 'id' | 'qrCode' | 'status'>) => Promise<void>;
  usePremiumBenefit: (membershipId: string, benefit: string, note: string) => Promise<void>;

  addAttachment: (attachment: Omit<Attachment, 'id'>) => Promise<void>;

  addServiceCategory: (category: Omit<ServiceCategory, 'id'>) => Promise<string>;
  addService: (service: Omit<Service, 'id'>) => Promise<string>;
  updateService: (serviceId: string, patch: Partial<Omit<Service, 'id'>>) => Promise<void>;
  upsertHeroSlide: (slide: HeroSlide) => Promise<void>;
  deleteHeroSlide: (slideId: string) => Promise<void>;
  upsertWebProduct: (product: WebProduct) => Promise<void>;
  deleteWebProduct: (productId: string) => Promise<void>;

  resetDemo: () => Promise<void>;
}
