import { StateCreator } from 'zustand';
import { apiCreateClientRequest } from '../../lib/api';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { buildQuoteTotals, registerActivity, syncAdminState } from '../utils';

export const createCrmSlice: StateCreator<AppState, [], [], Pick<AppState, 'setSelectedCustomer' | 'setClientPortalCustomer' | 'addLead' | 'updateLeadStatus' | 'convertLeadToCustomer' | 'createQuoteFromLead' | 'addCustomer'>> = (set, get) => ({
  setSelectedCustomer: (customerId) => set({ selectedCustomerId: customerId }),
  setClientPortalCustomer: (customerId) => set({ clientPortalCustomerId: customerId }),
  
  addLead: async (lead) => {
    if (get().sessionUser?.roleKind === 'client') {
      const response = await apiCreateClientRequest({
        interestType: lead.interestType,
        description: lead.description,
        estimatedBudget: lead.estimatedBudget,
      });
      set({
        ...response.appData,
        sessionUser: response.sessionUser,
        activeUserId: response.sessionUser.id,
        clientPortalCustomerId: response.sessionUser.customerId ?? get().clientPortalCustomerId,
      });
      return;
    }

    set((state) => ({
      ...registerActivity(
        state,
        {
          leads: [
            {
              ...lead,
              id: createId('lead'),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.leads,
          ],
        },
        {
          id: createId('act'),
          type: 'lead',
          description: `Nuevo lead registrado para ${lead.business}.`,
          createdAt: new Date().toISOString(),
        },
      ),
    }));
    await syncAdminState(get, set);
  },

  updateLeadStatus: async (leadId, status) => {
    const updatedAt = new Date().toISOString();
    set((state) => ({
      ...registerActivity(
        state,
        {
          leads: state.leads.map((lead) => (lead.id === leadId ? { ...lead, status, updatedAt } : lead)),
        },
        {
          id: createId('act'),
          type: 'lead',
          leadId,
          description: `Estado de lead actualizado a ${status}.`,
          createdAt: new Date().toISOString(),
        },
      ),
    }));
    await syncAdminState(get, set);
  },

  convertLeadToCustomer: async (leadId) => {
    set((state) => {
      const lead = state.leads.find((item) => item.id === leadId);
      if (!lead || lead.customerId) return state;
      const customerId = createId('cust');
      return {
        ...registerActivity(
          state,
          {
            customers: [
              {
                id: customerId,
                name: lead.business,
                business: lead.business,
                phone: lead.phone,
                email: lead.email,
                whatsapp: lead.whatsapp,
                address: lead.address,
                clientType: 'prospecto',
                commercialStatus: 'cliente activo',
                premiumLevel: 'Sin plan',
                createdAt: new Date().toISOString(),
              },
              ...state.customers,
            ],
            leads: state.leads.map((item) => (item.id === leadId ? { ...item, customerId, status: 'aprobado', updatedAt: new Date().toISOString() } : item)),
          },
          {
            id: createId('act'),
            type: 'crm',
            customerId,
            leadId,
            description: `Lead ${lead.business} convertido en cliente.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },

  createQuoteFromLead: async (leadId) => {
    let createdQuoteId: string | null = null;
    set((state) => {
      const lead = state.leads.find((item) => item.id === leadId);
      if (!lead) return state;

      const existingQuote = state.quotes.find((quote) => quote.leadId === leadId && quote.status === 'borrador');
      if (existingQuote) {
        createdQuoteId = existingQuote.id;
        return state;
      }

      const existingCustomer = lead.customerId
        ? state.customers.find((customer) => customer.id === lead.customerId)
        : state.customers.find((customer) => customer.email === lead.email || customer.whatsapp === lead.whatsapp || customer.business === lead.business);

      const customerId = existingCustomer?.id ?? createId('cust');
      const service = state.services.find((item) => item.name.toLowerCase().includes(lead.interestType.toLowerCase())) ?? state.services[0];
      const quoteItems = buildQuoteTotals([
        {
          serviceId: service?.id ?? 'srv-custom',
          description: lead.description || lead.interestType,
          measures: lead.measures ?? 'por definir',
          quantity: 1,
          materials: ['A definir'],
          lighting: /led|luz|neon|rgb/i.test(lead.interestType),
          designIncluded: true,
          installationIncluded: false,
          transportIncluded: false,
          unitPrice: lead.estimatedBudget || service?.basePrice || 3500,
        },
      ]);
      const quoteId = createId('quote');
      const now = new Date().toISOString();
      const estimatedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      createdQuoteId = quoteId;

      return {
        ...registerActivity(
          state,
          {
            customers: existingCustomer
              ? state.customers
              : [
                  {
                    id: customerId,
                    name: lead.name,
                    business: lead.business,
                    phone: lead.phone,
                    email: lead.email,
                    whatsapp: lead.whatsapp,
                    address: lead.address,
                    clientType: 'prospecto',
                    commercialStatus: 'cotizando',
                    premiumLevel: 'Sin plan',
                    createdAt: now,
                  },
                  ...state.customers,
                ],
            leads: state.leads.map((item) =>
              item.id === leadId
                ? { ...item, customerId, status: 'en_cotizacion', updatedAt: now }
                : item,
            ),
            quotes: [
              {
                id: quoteId,
                number: `COT-${new Date().getFullYear()}-${String(state.quotes.length + 41).padStart(3, '0')}`,
                customerId,
                leadId,
                items: quoteItems.items,
                estimatedDate,
                observations: `Cotizacion generada desde lead ${lead.business}. ${lead.notes}`.trim(),
                subtotal: quoteItems.subtotal,
                tax: quoteItems.tax,
                discount: 0,
                total: quoteItems.total,
                status: 'borrador',
                version: 1,
                followUp: lead.nextAction || 'Enviar propuesta por WhatsApp',
                createdAt: now,
              },
              ...state.quotes,
            ],
          },
          {
            id: createId('act'),
            type: 'cotizacion',
            customerId,
            leadId,
            description: `Cotizacion borrador generada desde lead ${lead.business}.`,
            createdAt: now,
          },
        ),
      };
    });
    await syncAdminState(get, set);
    return createdQuoteId;
  },

  addCustomer: async (customer) => {
    const customerId = createId('cust');
    set((state) => ({
      ...registerActivity(
        state,
        {
          customers: [
            {
              ...customer,
              id: customerId,
              createdAt: new Date().toISOString(),
            },
            ...state.customers,
          ],
        },
        {
          id: createId('act'),
          type: 'crm',
          customerId,
          description: `Se registró el cliente ${customer.business}.`,
          createdAt: new Date().toISOString(),
        },
      ),
    }));
    await syncAdminState(get, set);
    return customerId;
  },
});
