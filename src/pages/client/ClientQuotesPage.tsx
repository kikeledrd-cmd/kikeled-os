import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency } from '../../lib/utils';
import { useAppStore, useCustomerMetrics } from '../../store/useAppStore';

export function ClientQuotesPage() {
  const customerId = useAppStore((state) => state.clientPortalCustomerId);
  const metrics = useCustomerMetrics(customerId);
  return (
    <SectionCard title="Mis Cotizaciones" description="Propuestas activas y su estado actual.">
      <ShellTable columns={['Número', 'Fecha estimada', 'Total', 'Estado']}>
        {metrics.quotes.map((quote) => (
          <tr key={quote.id}>
            <td className="px-4 py-3 text-white">{quote.number}</td>
            <td className="px-4 py-3 text-soft">{quote.estimatedDate}</td>
            <td className="px-4 py-3 text-soft">{currency(quote.total)}</td>
            <td className="px-4 py-3"><StatusBadge label={quote.status} /></td>
          </tr>
        ))}
      </ShellTable>
    </SectionCard>
  );
}
