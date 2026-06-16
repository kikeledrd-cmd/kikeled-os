import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore, useCustomerMetrics } from '../../store/useAppStore';

export function ClientPremiumPage() {
  const customerId = useAppStore((state) => state.clientPortalCustomerId);
  const customer = useAppStore((state) => state.customers.find((item) => item.id === customerId)!);
  const metrics = useCustomerMetrics(customerId);
  return (
    <SectionCard title="Mi Premium Pass" description="Tu plan actual, beneficios y acumulados.">
      {metrics.membership ? (
        <div className="space-y-4">
          <StatusBadge label={customer.premiumLevel} />
          <p className="text-soft">Vigencia: {shortDate(metrics.membership.endDate)}</p>
          <p className="text-soft">Puntos: {metrics.membership.points}</p>
          <p className="text-soft">Gasto acumulado: {currency(metrics.membership.spentAmount)}</p>
          <div className="flex flex-wrap gap-2">
            {metrics.membership.activeBenefits.map((benefit) => <span key={benefit} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-soft">{benefit}</span>)}
          </div>
        </div>
      ) : <p className="text-soft">Todavía no tienes un plan activo.</p>}
    </SectionCard>
  );
}
