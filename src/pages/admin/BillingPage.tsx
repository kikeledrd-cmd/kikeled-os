import { Link } from 'react-router-dom';
import { FormEvent } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function BillingPage() {
  const { invoices, customers, addManualInvoice, registerPayment } = useAppStore((state) => state);

  function handleInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customerId = String(formData.get('customerId'));
    if (!customerId) return;
    const total = Number(formData.get('total'));
    addManualInvoice({
      customerId,
      items: [{ id: 'manual-item', description: String(formData.get('description')), quantity: 1, unitPrice: total, total }],
      subtotal: total,
      tax: Math.round(total * 0.18),
      discount: 0,
      total: total + Math.round(total * 0.18),
      paidAmount: 0,
      issuedAt: String(formData.get('issuedAt')),
      dueAt: String(formData.get('dueAt')),
      paymentMethod: String(formData.get('paymentMethod')) as 'efectivo' | 'transferencia' | 'tarjeta' | 'mixto',
      observations: String(formData.get('observations')),
    });
    event.currentTarget.reset();
  }

  function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const invoiceId = String(formData.get('invoiceId'));
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    registerPayment({
      invoiceId,
      customerId: invoice.customerId,
      amount: Number(formData.get('amount')),
      method: String(formData.get('method')) as 'efectivo' | 'transferencia' | 'tarjeta' | 'mixto',
      note: String(formData.get('note')),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Flujo financiero" title="Facturación" description="Facturas, abonos y balance pendiente conectados directamente con cada cliente." />
      <SectionCard title="Facturas activas" description="Estados financieros con actualización automática.">
        <ShellTable columns={['Factura', 'Cliente', 'Total', 'Pagado', 'Balance', 'Estado', 'Salida']}>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-4 py-3">
                <Link to={`/admin/facturacion/${invoice.id}`} className="font-medium text-white transition hover:text-cyan-100">
                  {invoice.number}
                </Link>
              </td>
              <td className="px-4 py-3 text-soft">{customers.find((item) => item.id === invoice.customerId)?.business}</td>
              <td className="px-4 py-3 text-soft">{currency(invoice.total)}</td>
              <td className="px-4 py-3 text-soft">{currency(invoice.paidAmount)}</td>
              <td className="px-4 py-3 text-soft">{currency(invoice.balance)}</td>
              <td className="px-4 py-3"><StatusBadge label={invoice.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/facturacion/${invoice.id}`} className="btn-ghost">Ver detalle</Link>
                  <Link to={`/admin/facturacion/${invoice.id}/imprimir`} className="btn-ghost">Imprimir</Link>
                </div>
              </td>
            </tr>
          ))}
        </ShellTable>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Crear factura manual" description="Útil para casos fuera de cotización u orden.">
          <form onSubmit={handleInvoice} className="grid gap-3">
            <select name="customerId" className="field" defaultValue="" required>
              <option value="">Selecciona cliente</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.business}</option>)}
            </select>
            <input name="description" className="field" placeholder="Descripción" required />
            <input name="total" className="field" type="number" placeholder="Subtotal" required />
            <input name="issuedAt" className="field" type="date" required />
            <input name="dueAt" className="field" type="date" required />
            <select name="paymentMethod" className="field" defaultValue="transferencia"><option value="efectivo">efectivo</option><option value="transferencia">transferencia</option><option value="tarjeta">tarjeta</option><option value="mixto">mixto</option></select>
            <textarea name="observations" className="field" rows={3} placeholder="Observaciones" />
            <button className="btn-primary" type="submit">Guardar factura</button>
          </form>
        </SectionCard>
        <SectionCard title="Registrar abono" description="Aplica pagos parciales o completos.">
          <form onSubmit={handlePayment} className="grid gap-3">
            <select name="invoiceId" className="field" defaultValue={invoices[0]?.id}>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.number}</option>)}</select>
            <input name="amount" className="field" type="number" placeholder="Monto" required />
            <select name="method" className="field" defaultValue="transferencia"><option value="efectivo">efectivo</option><option value="transferencia">transferencia</option><option value="tarjeta">tarjeta</option><option value="mixto">mixto</option></select>
            <textarea name="note" className="field" rows={3} placeholder="Nota del pago" />
            <button className="btn-secondary" type="submit">Registrar pago</button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
