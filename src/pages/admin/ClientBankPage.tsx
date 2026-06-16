import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function ClientBankPage() {
  const { customers, invoices } = useAppStore((state) => state);
  const getInvoiced = (customerId: string) =>
    invoices.filter((invoice) => invoice.customerId === customerId).reduce((sum, invoice) => sum + invoice.total, 0);
  const getBalance = (customerId: string) =>
    invoices.filter((invoice) => invoice.customerId === customerId).reduce((sum, invoice) => sum + invoice.balance, 0);
  const groups = {
    frecuentes: customers.filter((customer) => customer.commercialStatus === 'cliente frecuente'),
    premium: customers.filter((customer) => customer.commercialStatus === 'cliente premium'),
    inactivos: customers.filter((customer) => customer.commercialStatus === 'inactivo'),
    balance: customers.filter((customer) => getBalance(customer.id) > 0),
    altoValor: customers.filter((customer) => getInvoiced(customer.id) >= 50000),
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Banco de clientes" title="Segmentación analítica" description="Filtra el valor histórico de la base de clientes para retención, seguimiento y acciones premium." />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groups).map(([label, entries]) => (
          <SectionCard key={label} title={label} description={`Clientes en el grupo ${label}.`}>
            <div className="space-y-3">
              {entries.map((customer) => {
                return (
                  <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{customer.business}</p>
                        <p className="text-sm text-soft">{currency(getInvoiced(customer.id))} facturado</p>
                      </div>
                      <StatusBadge label={customer.premiumLevel} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
