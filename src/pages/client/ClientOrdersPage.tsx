import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAppStore, useCustomerMetrics } from '../../store/useAppStore';

export function ClientOrdersPage() {
  const customerId = useAppStore((state) => state.clientPortalCustomerId);
  const metrics = useCustomerMetrics(customerId);
  return (
    <SectionCard title="Mis Órdenes" description="Seguimiento claro de producción e instalación.">
      <ShellTable columns={['Orden', 'Servicio', 'Estado', 'Avance']}>
        {metrics.orders.map((order) => (
          <tr key={order.id}>
            <td className="px-4 py-3 text-white">{order.number}</td>
            <td className="px-4 py-3 text-soft">{order.service}</td>
            <td className="px-4 py-3"><StatusBadge label={order.status} /></td>
            <td className="px-4 py-3 text-soft">{order.progress}%</td>
          </tr>
        ))}
      </ShellTable>
    </SectionCard>
  );
}
