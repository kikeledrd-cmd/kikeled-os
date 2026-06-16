import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { currency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function ReportsPage() {
  const { invoices, quotes, services, customers, orders, materials, premiumBenefitUsage } = useAppStore((state) => state);
  const topCustomers = [...customers].sort((a, b) => {
    const aTotal = invoices.filter((invoice) => invoice.customerId === a.id).reduce((sum, invoice) => sum + invoice.total, 0);
    const bTotal = invoices.filter((invoice) => invoice.customerId === b.id).reduce((sum, invoice) => sum + invoice.total, 0);
    return bTotal - aTotal;
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inteligencia comercial" title="Reportes" description="Lecturas mínimas para operar, priorizar y decidir sobre ventas, órdenes y fidelización." />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Ventas por mes"><p className="text-4xl font-semibold text-white">{currency(invoices.reduce((sum, invoice) => sum + invoice.total, 0))}</p></SectionCard>
        <SectionCard title="Cotizaciones aprobadas vs rechazadas"><p className="text-white">Aprobadas: {quotes.filter((quote) => quote.status === 'aprobada').length} / Rechazadas: {quotes.filter((quote) => quote.status === 'rechazada').length}</p></SectionCard>
        <SectionCard title="Servicios más vendidos"><div className="space-y-2">{services.slice(0, 4).map((service) => <p key={service.id} className="text-soft">{service.name}</p>)}</div></SectionCard>
        <SectionCard title="Clientes top"><div className="space-y-2">{topCustomers.map((customer) => <p key={customer.id} className="text-soft">{customer.business}</p>)}</div></SectionCard>
        <SectionCard title="Balances pendientes"><p className="text-4xl font-semibold text-white">{currency(invoices.reduce((sum, invoice) => sum + invoice.balance, 0))}</p></SectionCard>
        <SectionCard title="Órdenes por estado"><div className="space-y-2">{['diseño', 'ensamblaje', 'instalación'].map((status) => <p key={status} className="text-soft">{status}: {orders.filter((order) => order.status === status).length}</p>)}</div></SectionCard>
        <SectionCard title="Materiales críticos"><div className="space-y-2">{materials.filter((material) => material.stock <= material.minStock).map((material) => <p key={material.id} className="text-soft">{material.name}</p>)}</div></SectionCard>
        <SectionCard title="Uso de beneficios premium"><p className="text-4xl font-semibold text-white">{premiumBenefitUsage.length}</p></SectionCard>
      </div>
    </div>
  );
}
