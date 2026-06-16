import { StateCreator } from 'zustand';
import { apiGetAppState, apiGetSession, apiLogin, apiLogout } from '../../lib/api';
import { emptyData } from '../../data/empty';
import { AppState } from '../types';
import { baseUiState } from '../utils';
import { normalizeLeadStatus } from '../../lib/leadStatus';

function normalizeIncomingAppData<T extends typeof emptyData>(appData: T): T {
  return {
    ...appData,
    leads: appData.leads.map((lead) => ({
      ...lead,
      status: normalizeLeadStatus(lead.status),
      updatedAt: lead.updatedAt ?? lead.createdAt,
    })),
  };
}

function resolveInitialCustomerId(appData: typeof emptyData, sessionCustomerId?: string) {
  if (sessionCustomerId && appData.customers.some((customer) => customer.id === sessionCustomerId)) {
    return sessionCustomerId;
  }
  return appData.customers.find((customer) => customer.id === 'cust-1')?.id ?? '';
}

export const createAuthSlice: StateCreator<AppState, [], [], Pick<AppState, 'initialize' | 'login' | 'logout'>> = (set) => ({
  initialize: async () => {
    try {
      const session = await apiGetSession();
      const app = await apiGetAppState();
      const appData = normalizeIncomingAppData(app.appData);
      const initialCustomerId = resolveInitialCustomerId(appData, session.sessionUser.customerId);
      set({
        ...appData,
        sessionUser: session.sessionUser,
        activeUserId: session.sessionUser.id,
        clientPortalCustomerId: initialCustomerId,
        selectedCustomerId: initialCustomerId,
        authStatus: 'authenticated',
        authError: null,
      });
    } catch {
      set({
        ...emptyData,
        ...baseUiState,
        authStatus: 'anonymous',
      });
    }
  },
  login: async (email, password) => {
    set({ authStatus: 'loading', authError: null });
    try {
      await apiLogin(email, password);
      const app = await apiGetAppState();
      const appData = normalizeIncomingAppData(app.appData);
      const initialCustomerId = resolveInitialCustomerId(appData, app.sessionUser.customerId);
      set({
        ...appData,
        sessionUser: app.sessionUser,
        activeUserId: app.sessionUser.id,
        clientPortalCustomerId: initialCustomerId,
        selectedCustomerId: initialCustomerId,
        authStatus: 'authenticated',
        authError: null,
      });
      return app.sessionUser;
    } catch (error) {
      set({
        authStatus: 'anonymous',
        authError: error instanceof Error ? error.message : 'No se pudo iniciar sesión.',
      });
      throw error;
    }
  },
  logout: async () => {
    await apiLogout();
    set({
      ...emptyData,
      ...baseUiState,
      authStatus: 'anonymous',
    });
  },
});
