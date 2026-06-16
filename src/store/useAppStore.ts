import { useMemo } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { emptyData } from '../data/empty';
import { sum } from '../lib/utils';
import { AppState } from './types';
import { baseUiState } from './utils';

import { createAuthSlice } from './slices/authSlice';
import { createCrmSlice } from './slices/crmSlice';
import { createSalesSlice } from './slices/salesSlice';
import { createOperationsSlice } from './slices/operationsSlice';
import { createBillingSlice } from './slices/billingSlice';
import { createInventorySlice } from './slices/inventorySlice';
import { createPremiumSlice } from './slices/premiumSlice';
import { createAttachmentsSlice } from './slices/attachmentsSlice';
import { createSystemSlice } from './slices/systemSlice';

export * from './types';

export const useAppStore = create<AppState>()((...a) => ({
  ...emptyData,
  ...baseUiState,
  ...createAuthSlice(...a),
  ...createCrmSlice(...a),
  ...createSalesSlice(...a),
  ...createOperationsSlice(...a),
  ...createBillingSlice(...a),
  ...createInventorySlice(...a),
  ...createPremiumSlice(...a),
  ...createAttachmentsSlice(...a),
  ...createSystemSlice(...a),
}));

export function useSession() {
  return useAppStore(
    useShallow((state) => {
      const user = state.sessionUser;
      const role = user ? state.roles.find((item) => item.id === user.roleId) ?? state.roles[0] : null;
      return { user, role, authStatus: state.authStatus, authError: state.authError };
    }),
  );
}

export function useCustomerMetrics(customerId: string) {
  const quotesSource = useAppStore((state) => state.quotes);
  const invoicesSource = useAppStore((state) => state.invoices);
  const paymentsSource = useAppStore((state) => state.payments);
  const ordersSource = useAppStore((state) => state.orders);
  const membershipsSource = useAppStore((state) => state.premiumMemberships);

  return useMemo(() => {
    const quotes = quotesSource.filter((item) => item.customerId === customerId);
    const invoices = invoicesSource.filter((item) => item.customerId === customerId);
    const payments = paymentsSource.filter((item) => item.customerId === customerId);
    const orders = ordersSource.filter((item) => item.customerId === customerId);
    const membership = membershipsSource.find((item) => item.customerId === customerId && item.status === 'activa');

    return {
      quotes,
      orders,
      invoices,
      payments,
      membership,
      totalQuoted: sum(quotes.map((item) => item.total)),
      totalInvoiced: sum(invoices.map((item) => item.total)),
      totalPaid: sum(payments.map((item) => item.amount)),
      balance: sum(invoices.map((item) => item.balance)),
      lastPurchase: invoices[0]?.issuedAt ?? quotes[0]?.createdAt ?? '',
    };
  }, [customerId, invoicesSource, membershipsSource, ordersSource, paymentsSource, quotesSource]);
}
