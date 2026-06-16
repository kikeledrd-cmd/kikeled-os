import { StateCreator } from 'zustand';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { buildQuoteTotals, registerActivity, syncAdminState } from '../utils';
import { InvoiceItem } from '../../types/entities';

export const createSalesSlice: StateCreator<AppState, [], [], Pick<AppState, 'addQuote' | 'updateQuoteStatus' | 'duplicateQuote' | 'convertQuoteToOrder' | 'createInvoiceFromQuote'>> = (set, get) => ({
  addQuote: async (quote) => {
    const quoteId = createId('quote');
    set((state) => {
      const totals = buildQuoteTotals(quote.items);
      return {
        ...registerActivity(
          state,
          {
            quotes: [
              {
                ...quote,
                ...totals,
                total: totals.total - quote.discount,
                id: quoteId,
                number: `COT-${new Date().getFullYear()}-${String(state.quotes.length + 41).padStart(3, '0')}`,
                version: 1,
                createdAt: new Date().toISOString(),
              },
              ...state.quotes,
            ],
          },
          {
            id: createId('act'),
            type: 'cotización',
            customerId: quote.customerId,
            leadId: quote.leadId,
            description: `Nueva cotización creada para cliente ${quote.customerId}.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
    return quoteId;
  },

  updateQuoteStatus: async (quoteId, status) => {
    set((state) => {
      const quote = state.quotes.find((item) => item.id === quoteId);
      if (!quote) return state;
      return {
        ...registerActivity(
          state,
          {
            quotes: state.quotes.map((item) => (item.id === quoteId ? { ...item, status } : item)),
          },
          {
            id: createId('act'),
            type: 'cotizacion',
            customerId: quote.customerId,
            leadId: quote.leadId,
            description: `Estado de ${quote.number} actualizado a ${status}.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },

  duplicateQuote: async (quoteId) => {
    set((state) => {
      const quote = state.quotes.find((item) => item.id === quoteId);
      if (!quote) return state;
      return {
        quotes: [
          {
            ...quote,
            id: createId('quote'),
            number: `COT-${new Date().getFullYear()}-${String(state.quotes.length + 41).padStart(3, '0')}`,
            status: 'borrador',
            version: quote.version + 1,
            createdAt: new Date().toISOString(),
          },
          ...state.quotes,
        ],
        activities: [
          {
            id: createId('act'),
            type: 'cotización',
            customerId: quote.customerId,
            description: `Se duplicó la cotización ${quote.number}.`,
            createdAt: new Date().toISOString(),
          },
          ...state.activities,
        ],
      };
    });
    await syncAdminState(get, set);
  },

  convertQuoteToOrder: async (quoteId) => {
    set((state) => {
      const quote = state.quotes.find((item) => item.id === quoteId);
      if (!quote) return state;
      const existing = state.orders.some((order) => order.quoteId === quoteId);
      if (existing) return state;
      return {
        ...registerActivity(
          state,
          {
            orders: [
              {
                id: createId('ord'),
                number: `OT-${new Date().getFullYear()}-${String(state.orders.length + 20).padStart(3, '0')}`,
                customerId: quote.customerId,
                quoteId: quote.id,
                service: quote.items[0]?.description ?? 'Orden personalizada',
                items: quote.items.map((item) => ({
                  id: createId('oi'),
                  serviceId: item.serviceId,
                  description: item.description,
                  quantity: item.quantity,
                  measures: item.measures,
                })),
                materialIds: [],
                owner: 'Producción Kikeled',
                startDate: new Date().toISOString().slice(0, 10),
                promiseDate: quote.estimatedDate,
                priority: 'media',
                status: 'pendiente',
                progress: 5,
                technicalNotes: quote.observations,
                installationNotes: '',
                referenceFiles: [],
                createdAt: new Date().toISOString(),
              },
              ...state.orders,
            ],
            quotes: state.quotes.map((item) => (item.id === quoteId ? { ...item, status: 'convertida en orden' } : item)),
          },
          {
            id: createId('act'),
            type: 'orden',
            customerId: quote.customerId,
            description: `La cotización ${quote.number} se convirtió en orden de trabajo.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },

  createInvoiceFromQuote: async (quoteId) => {
    set((state) => {
      const quote = state.quotes.find((item) => item.id === quoteId);
      if (!quote) return state;
      const existing = state.invoices.some((invoice) => invoice.quoteId === quoteId);
      if (existing) return state;
      const items: InvoiceItem[] = quote.items.map((item) => ({
        id: createId('ii'),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      }));
      return {
        ...registerActivity(
          state,
          {
            invoices: [
              {
                id: createId('inv'),
                number: `FAC-${new Date().getFullYear()}-${String(state.invoices.length + 101).padStart(3, '0')}`,
                customerId: quote.customerId,
                quoteId: quote.id,
                items,
                subtotal: quote.subtotal,
                tax: quote.tax,
                discount: quote.discount,
                total: quote.total,
                paidAmount: 0,
                balance: quote.total,
                issuedAt: new Date().toISOString().slice(0, 10),
                dueAt: quote.estimatedDate,
                paymentMethod: 'transferencia',
                observations: `Factura creada desde ${quote.number}.`,
                status: 'pendiente',
              },
              ...state.invoices,
            ],
            quotes: state.quotes.map((item) => (item.id === quoteId ? { ...item, status: 'facturada' } : item)),
          },
          {
            id: createId('act'),
            type: 'factura',
            customerId: quote.customerId,
            description: `Se creó una factura desde la cotización ${quote.number}.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },
});
