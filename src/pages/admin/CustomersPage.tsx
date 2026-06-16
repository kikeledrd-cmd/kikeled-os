import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore, useCustomerMetrics } from '../../store/useAppStore';

export function CustomersPage() {
  const navigate = useNavigate();
  const { customers, addCustomer, setSelectedCustomer } = useAppStore((state) => state);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addCustomer({
      name: String(formData.get('name')),
      business: String(formData.get('business')),
      phone: String(formData.get('phone')),
      email: String(formData.get('email')),
      whatsapp: String(formData.get('whatsapp')),
      address: String(formData.get('address')),
      clientType: String(formData.get('clientType')),
      commercialStatus: 'cliente activo',
      premiumLevel: 'Sin plan',
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM unificado"
        title="CRM Clientes"
        description="Cada cliente agrupa su ciclo de vida comercial, operativo, financiero y premium."
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="Lista de clientes" description="Visión comercial con indicadores de valor.">
          <ShellTable columns={['Cliente', 'Tipo', 'Cotizado', 'Facturado', 'Pagado', 'Balance', 'Última compra', 'Premium']}>
            {customers.map((customer) => (
              <CustomerRow key={customer.id} customerId={customer.id} onOpen={() => { setSelectedCustomer(customer.id); navigate(`/admin/clientes/${customer.id}`); }} />
            ))}
          </ShellTable>
        </SectionCard>
        <SectionCard title="Crear cliente" description="Alta manual para casos directos o reactivaciones.">
          <form onSubmit={handleSubmit} className="grid gap-3">
            <input name="name" className="field" placeholder="Nombre comercial" required />
            <input name="business" className="field" placeholder="Negocio" required />
            <input name="phone" className="field" placeholder="Teléfono" required />
            <input name="whatsapp" className="field" placeholder="WhatsApp" required />
            <input name="email" className="field" placeholder="Correo" type="email" required />
            <input name="address" className="field" placeholder="Dirección" required />
            <input name="clientType" className="field" placeholder="Tipo de cliente" required />
            <button className="btn-primary" type="submit">Guardar cliente</button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}

function CustomerRow({ customerId, onOpen }: { customerId: string; onOpen: () => void }) {
  const customer = useAppStore((state) => state.customers.find((item) => item.id === customerId)!);
  const metrics = useCustomerMetrics(customerId);
  return (
    <tr className="cursor-pointer hover:bg-white/5" onClick={onOpen}>
      <td className="px-4 py-3">
        <p className="font-medium text-white">{customer.business}</p>
        <p className="text-sm text-soft">{customer.phone}</p>
      </td>
      <td className="px-4 py-3 text-soft">{customer.clientType}</td>
      <td className="px-4 py-3 text-soft">{currency(metrics.totalQuoted)}</td>
      <td className="px-4 py-3 text-soft">{currency(metrics.totalInvoiced)}</td>
      <td className="px-4 py-3 text-soft">{currency(metrics.totalPaid)}</td>
      <td className="px-4 py-3 text-soft">{currency(metrics.balance)}</td>
      <td className="px-4 py-3 text-soft">{metrics.lastPurchase ? shortDate(metrics.lastPurchase) : 'Sin compras'}</td>
      <td className="px-4 py-3"><StatusBadge label={customer.premiumLevel} /></td>
    </tr>
  );
}
