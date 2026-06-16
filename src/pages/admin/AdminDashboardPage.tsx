import {
  Activity,
  BadgeDollarSign,
  Crown,
  FileText,
  PackageSearch,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function AdminDashboardPage() {
  const { leads, quotes, orders, invoices, customers, materials, activities, payments } = useAppStore((state) => state);
  const monthPayments = payments.reduce((total, payment) => total + payment.amount, 0);
  const balances = invoices.reduce((total, invoice) => total + invoice.balance, 0);
  const lowStock = materials.filter((material) => material.stock <= material.minStock);
  const frequentClients = customers.filter((customer) => ['cliente frecuente', 'cliente premium'].includes(customer.commercialStatus));

  return (
    <>
      <PageHeader
        eyebrow="Control central"
        title="Dashboard operativo de Kikeled OS"
        description="Monitorea leads, cierres, producción, facturación y señales premium desde una sola vista."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Sparkles} label="Leads nuevos" value={String(leads.filter((lead) => lead.status === 'nuevo').length)} hint="Captados por web, Instagram y referidos." />
        <StatCard icon={FileText} label="Cotizaciones pendientes" value={String(quotes.filter((quote) => ['pendiente', 'enviada'].includes(quote.status)).length)} hint="Listas para seguimiento comercial." />
        <StatCard icon={Wrench} label="Órdenes activas" value={String(orders.filter((order) => !['entregado', 'cerrado'].includes(order.status)).length)} hint="Diseño, producción e instalación en curso." />
        <StatCard icon={BadgeDollarSign} label="Pagos del mes" value={currency(monthPayments)} hint="Cobros reales aplicados al flujo financiero." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
        <SectionCard title="Radar diario" description="KPIs accionables para comercial y operaciones.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Cotizaciones aprobadas', quotes.filter((quote) => quote.status === 'aprobada').length.toString()],
              ['Trabajos en instalación', orders.filter((order) => order.status === 'instalación').length.toString()],
              ['Facturas pendientes', invoices.filter((invoice) => invoice.status === 'pendiente').length.toString()],
              ['Balances pendientes', currency(balances)],
              ['Clientes frecuentes', frequentClients.length.toString()],
              ['Materiales críticos', lowStock.length.toString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-soft">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Premium Pass" description="Clientes con ventaja competitiva activa.">
          <div className="space-y-3">
            {customers
              .filter((customer) => customer.premiumLevel !== 'Sin plan')
              .slice(0, 4)
              .map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{customer.business}</p>
                      <p className="text-sm text-soft">{customer.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown size={16} className="text-amber" />
                      <StatusBadge label={customer.premiumLevel} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Actividad reciente" description="Eventos clave disparados por el sistema.">
          <div className="space-y-3">
            {activities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mt-1 rounded-xl bg-white/10 p-2 text-glow">
                  <Activity size={16} />
                </div>
                <div>
                  <p className="font-medium text-white">{activity.description}</p>
                  <p className="mt-1 text-sm text-soft">{shortDate(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Materiales con stock bajo" description="Alertas para no romper promesas de entrega.">
          <ShellTable columns={['Material', 'Stock', 'Mínimo', 'Ubicación']}>
            {lowStock.map((material) => (
              <tr key={material.id}>
                <td className="px-4 py-3 font-medium text-white">{material.name}</td>
                <td className="px-4 py-3 text-soft">{material.stock}</td>
                <td className="px-4 py-3 text-soft">{material.minStock}</td>
                <td className="px-4 py-3 text-soft">{material.location}</td>
              </tr>
            ))}
          </ShellTable>
        </SectionCard>
      </div>
    </>
  );
}
