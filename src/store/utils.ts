import { DocumentEntity, SessionUser, StateConflictError, apiNextDocumentNumber, apiSaveAppState } from '../lib/api';
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
  stateVersion: null as string | null,
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

/**
 * Número de documento desde la secuencia del servidor (única e irrepetible).
 * Si el servidor no responde, cae al esquema local anterior para no bloquear la operación.
 */
export async function nextDocumentNumber(entity: DocumentEntity, fallbackSeq: number): Promise<string> {
  const prefixes: Record<DocumentEntity, string> = { quote: 'COT', order: 'KR', invoice: 'FAC' };
  try {
    const response = await apiNextDocumentNumber(entity);
    return response.number;
  } catch {
    return `${prefixes[entity]}-${new Date().getFullYear()}-${String(fallbackSeq).padStart(3, '0')}`;
  }
}

export function registerActivity(state: AppState, patch: Partial<AppData>, activity: Activity): Partial<AppData> {
  return {
    ...patch,
    activities: [activity, ...state.activities],
  };
}

/** Sincroniza el estado al servidor. Admin y ventas persisten; el portal cliente no (usa endpoints propios). */
export async function syncAdminState(get: () => AppState, set: (partial: Partial<AppState>) => void) {
  const state = get();
  const roleKind = state.sessionUser?.roleKind;
  if (roleKind !== 'admin' && roleKind !== 'sales') return;
  try {
    const response = await apiSaveAppState(extractAppData(state), state.stateVersion);
    set({
      ...response.appData,
      stateVersion: response.stateVersion,
      sessionUser: response.sessionUser,
      activeUserId: response.sessionUser.id,
      clientPortalCustomerId: response.sessionUser.customerId ?? get().clientPortalCustomerId,
      authStatus: 'authenticated',
      authError: null,
    });
  } catch (error) {
    if (error instanceof StateConflictError) {
      // Otro usuario guardó primero: se adopta el estado fresco del servidor y se avisa.
      set({
        ...error.payload.appData,
        stateVersion: error.payload.stateVersion,
        sessionUser: error.payload.sessionUser,
        authStatus: 'authenticated',
        authError: null,
      });
      if (typeof window !== 'undefined') {
        window.alert('Otro usuario guardó cambios mientras trabajabas. Se recargaron los datos: revisa y repite tu última acción si hace falta.');
      }
      return;
    }
    throw error;
  }
}
