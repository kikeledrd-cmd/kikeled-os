import { MetricStrip } from '../../components/shared/MetricStrip';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency } from '../../lib/utils';
import { useAppStore, useCustomerMetrics } from '../../store/useAppStore';

export function ClientHomePage() {
  const customerId = useAppStore((state) => state.clientPortalCustomerId);
  const customer = useAppStore((state) => state.customers.find((item) => item.id === customerId)!);
  const metrics = useCustomerMetrics(customerId);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Portal cliente" title={`Hola, ${customer.business}`} description="Tu operación con Kikeled en tiempo real: cotizaciones, órdenes, facturas y beneficios premium." />
      <MetricStrip items={[{ label: 'Órdenes activas', value: String(metrics.orders.filter((order) => !['entregado', 'cerrado'].includes(order.status)).length) }, { label: 'Facturas pendientes', value: String(metrics.invoices.filter((invoice) => invoice.balance > 0).length) }, { label: 'Total invertido', value: currency(metrics.totalInvoiced) }, { label: 'Nivel premium', value: customer.premiumLevel }]} />
      <SectionCard title="Estado actual" description="Lo más importante para decidir hoy.">
        <div className="grid gap-4 lg:grid-cols-3">
          {metrics.orders.slice(0, 3).map((order) => (
            <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium text-white">{order.number}</p>
              <p className="mt-1 text-sm text-soft">{order.service}</p>
              <div className="mt-3"><StatusBadge label={order.status} /></div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
