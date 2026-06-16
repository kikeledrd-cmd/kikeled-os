import { SessionUser, apiSaveAppState } from '../lib/api';
import { createId, sum } from '../lib/utils';
import { AppData, QuoteItem, Customer, PremiumPlanName, Activity } from '../types/entities';
import { AppState, AuthStatus } from './types';

export const baseUiState = {
  selectedCustomerId: 'cust-1',
  clientPortalCustomerId: 'cust-1',
  activeUserId: null as string | null,
  sessionUser: null as SessionUser | null,
  authStatus: 'loading' as AuthStatus,
  authError: null as string | null,
};

export function extractAppData(state: AppState): AppData {
  return {
    users: state.users,
    roles: state.roles,
    leads: state.leads,
    customers: state.customers,
    customerNotes: state.customerNotes,
    services: state.services,
    serviceCategories: state.serviceCategories,
    pricingRules: state.pricingRules,
    quotes: state.quotes,
    orders: state.orders,
    materials: state.materials,
    inventoryMovements: state.inventoryMovements,
    orderMaterials: state.orderMaterials,
    invoices: state.invoices,
    payments: state.payments,
    premiumPlans: state.premiumPlans,
    premiumMemberships: state.premiumMemberships,
    premiumBenefitUsage: state.premiumBenefitUsage,
    activities: state.activities,
    attachments: state.attachments,
    heroSlides: state.heroSlides,
    webProducts: state.webProducts,
  };
}

export function buildQuoteTotals(items: Array<Omit<QuoteItem, 'id' | 'total'>>) {
  const normalizedItems = items.map((item) => ({
    ...item,
    id: createId('qi'),
    total: item.unitPrice * item.quantity,
  }));
  const subtotal = sum(normalizedItems.map((item) => item.total));
  const tax = Math.round(subtotal * 0.18);
  return {
    items: normalizedItems,
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

export function premiumFromPlan(name: PremiumPlanName | 'Sin plan'): Customer['premiumLevel'] {
  return name;
}

export function registerActivity(state: AppState, patch: Partial<AppData>, activity: Activity): Partial<AppData> {
  return {
    ...patch,
    activities: [activity, ...state.activities],
  };
}

export async function syncAdminState(get: () => AppState, set: (partial: Partial<AppState>) => void) {
  const state = get();
  if (state.sessionUser?.roleKind !== 'admin') return;
  const response = await apiSaveAppState(extractAppData(state));
  set({
    ...response.appData,
    sessionUser: response.sessionUser,
    activeUserId: response.sessionUser.id,
    clientPortalCustomerId: response.sessionUser.customerId ?? get().clientPortalCustomerId,
    authStatus: 'authenticated',
    authError: null,
  });
}
