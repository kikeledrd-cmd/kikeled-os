import { StateCreator } from 'zustand';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { premiumFromPlan, registerActivity, syncAdminState } from '../utils';

export const createPremiumSlice: StateCreator<AppState, [], [], Pick<AppState, 'assignPremium' | 'usePremiumBenefit'>> = (set, get) => ({
  assignPremium: async (input) => {
    set((state) => {
      const plan = state.premiumPlans.find((item) => item.id === input.planId);
      const premiumName = plan?.name ?? 'Base';
      return {
        ...registerActivity(
          state,
          {
            premiumMemberships: [
              {
                ...input,
                id: createId('mem'),
                qrCode: `${premiumName}-${input.customerId}-${new Date().getFullYear()}`,
                status: 'activa',
              },
              ...state.premiumMemberships,
            ],
            customers: state.customers.map((customer) =>
              customer.id === input.customerId
                ? { ...customer, premiumLevel: premiumFromPlan(premiumName), commercialStatus: 'cliente premium' }
                : customer,
            ),
          },
          {
            id: createId('act'),
            type: 'premium',
            customerId: input.customerId,
            description: `Se asignó membresía premium ${premiumName}.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },

  usePremiumBenefit: async (membershipId, benefit, note) => {
    set((state) => {
      const membership = state.premiumMemberships.find((item) => item.id === membershipId);
      if (!membership) return state;
      return {
        ...registerActivity(
          state,
          {
            premiumBenefitUsage: [
              {
                id: createId('pbu'),
                membershipId,
                customerId: membership.customerId,
                benefit,
                note,
                createdAt: new Date().toISOString(),
              },
              ...state.premiumBenefitUsage,
            ],
            premiumMemberships: state.premiumMemberships.map((item) =>
              item.id === membershipId ? { ...item, usedBenefits: item.usedBenefits + 1 } : item,
            ),
          },
          {
            id: createId('act'),
            type: 'premium',
            customerId: membership.customerId,
            description: `Se usó el beneficio premium "${benefit}".`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },
});
