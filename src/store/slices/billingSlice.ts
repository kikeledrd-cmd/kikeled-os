import { StateCreator } from 'zustand';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { registerActivity, syncAdminState } from '../utils';

export const createBillingSlice: StateCreator<AppState, [], [], Pick<AppState, 'addManualInvoice' | 'registerPayment'>> = (set, get) => ({
  addManualInvoice: async (invoice) => {
    set((state) => ({
      ...registerActivity(
        state,
        {
          invoices: [
            {
              ...invoice,
              id: createId('inv'),
              number: `FAC-${new Date().getFullYear()}-${String(state.invoices.length + 101).padStart(3, '0')}`,
              balance: invoice.total - invoice.paidAmount,
              status: invoice.paidAmount === 0 ? 'pendiente' : invoice.paidAmount >= invoice.total ? 'pagado' : 'abonado',
            },
            ...state.invoices,
          ],
        },
        {
          id: createId('act'),
          type: 'factura',
          customerId: invoice.customerId,
          description: `Factura manual registrada por ${invoice.total}.`,
          createdAt: new Date().toISOString(),
        },
      ),
    }));
    await syncAdminState(get, set);
  },

  registerPayment: async (payment) => {
    set((state) => {
      const invoice = state.invoices.find((item) => item.id === payment.invoiceId);
      if (!invoice) return state;
      const paidAmount = invoice.paidAmount + payment.amount;
      const balance = Math.max(invoice.total - paidAmount, 0);
      return {
        ...registerActivity(
          state,
          {
            payments: [
              {
                ...payment,
                id: createId('pay'),
                createdAt: new Date().toISOString(),
              },
              ...state.payments,
            ],
            invoices: state.invoices.map((item) =>
              item.id === payment.invoiceId
                ? {
                    ...item,
                    paidAmount,
                    balance,
                    status: balance === 0 ? 'pagado' : 'abonado',
                    paymentMethod: payment.method,
                  }
                : item,
            ),
          },
          {
            id: createId('act'),
            type: 'pago',
            customerId: payment.customerId,
            description: `Pago registrado por RD$${payment.amount.toLocaleString('es-DO')} en la factura ${invoice.number}.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },
});
