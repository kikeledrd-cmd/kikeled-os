import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency } from '../../lib/utils';
import { useAppStore, useCustomerMetrics } from '../../store/useAppStore';

export function ClientInvoicesPage() {
  const customerId = useAppStore((state) => state.clientPortalCustomerId);
  const metrics = useCustomerMetrics(customerId);
  return (
    <SectionCard title="Mis Facturas" description="Transparencia financiera dentro del portal cliente.">
      <ShellTable columns={['Factura', 'Total', 'Pagado', 'Balance', 'Estado']}>
        {metrics.invoices.map((invoice) => (
          <tr key={invoice.id}>
            <td className="px-4 py-3 text-white">{invoice.number}</td>
            <td className="px-4 py-3 text-soft">{currency(invoice.total)}</td>
            <td className="px-4 py-3 text-soft">{currency(invoice.paidAmount)}</td>
            <td className="px-4 py-3 text-soft">{currency(invoice.balance)}</td>
            <td className="px-4 py-3"><StatusBadge label={invoice.status} /></td>
          </tr>
        ))}
      </ShellTable>
    </SectionCard>
  );
}
