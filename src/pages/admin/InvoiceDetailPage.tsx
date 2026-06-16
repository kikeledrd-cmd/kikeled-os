import { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowLeft, Printer, ReceiptText } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function InvoiceDetailPage() {
  const { invoiceId = '' } = useParams();
  const {
    invoices,
    customers,
    quotes,
    orders,
    payments,
    activities,
    registerPayment,
  } = useAppStore((state) => state);

  const invoice = invoices.find((item) => item.id === invoiceId);

  if (!invoice) {
    return (
      <SectionCard title="Factura no encontrada" description="El enlace no coincide con una factura disponible.">
        <Link to="/admin/facturacion" className="btn-secondary">
          <ArrowLeft size={16} className="mr-2" />
          Volver a facturacion
        </Link>
      </SectionCard>
    );
  }

  const customer = customers.find((item) => item.id === invoice.customerId);
  const quote = invoice.quoteId ? quotes.find((item) => item.id === invoice.quoteId) : null;
  const order = invoice.orderId
    ? orders.find((item) => item.id === invoice.orderId)
    : orders.find((item) => item.quoteId === invoice.quoteId);
  const invoicePayments = payments.filter((payment) => payment.invoiceId === invoice.id);
  const invoiceActivities = activities.filter((activity) => activity.customerId === invoice.customerId);

  function handlePayment(event: FormEvent<HTMLFormElement>, targetInvoiceId: string, targetCustomerId: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    registerPayment({
      invoiceId: targetInvoiceId,
      customerId: targetCustomerId,
      amount: Number(formData.get('amount')),
      method: String(formData.get('method')) as 'efectivo' | 'transferencia' | 'tarjeta' | 'mixto',
      note: String(formData.get('note')),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de factura"
        title={invoice.number}
        description={customer ? `Balance financiero de ${customer.business}.` : 'Factura sin cliente visible.'}
        action={
          <Link to="/admin/facturacion" className="btn-secondary">
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Estado" value={<StatusBadge label={invoice.status} />} />
        <Metric label="Total" value={currency(invoice.total)} />
        <Metric label="Pagado" value={currency(invoice.paidAmount)} />
        <Metric label="Balance" value={currency(invoice.balance)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <SectionCard title="Factura" description="Items facturados y resumen financiero.">
          <ShellTable columns={['Descripcion', 'Cantidad', 'Unitario', 'Total']}>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-white">{item.description}</td>
                <td className="px-4 py-3 text-soft">{item.quantity}</td>
                <td className="px-4 py-3 text-soft">{currency(item.unitPrice)}</td>
                <td className="px-4 py-3 text-soft">{currency(item.total)}</td>
              </tr>
            ))}
          </ShellTable>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Info label="Emision" value={shortDate(invoice.issuedAt)} />
            <Info label="Vencimiento" value={invoice.dueAt ? shortDate(invoice.dueAt) : 'No aplica'} />
            <Info label="Metodo" value={invoice.paymentMethod} />
            <Info label="Cliente" value={customer?.business ?? 'No encontrado'} />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-ink/60 p-5">
            <p className="text-sm font-semibold text-white">Observaciones</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-soft">{invoice.observations || 'Sin observaciones.'}</p>
          </div>

          <div className="mt-5 ml-auto w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <Row label="Subtotal" value={currency(invoice.subtotal)} />
            <Row label="ITBIS" value={currency(invoice.tax)} />
            <Row label="Descuento" value={currency(invoice.discount)} />
            <Row label="Pagado" value={currency(invoice.paidAmount)} />
            <div className="border-t border-white/10 pt-3">
              <Row label="Balance" value={currency(invoice.balance)} strong />
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Acciones" description="Cobro, impresion y documentos relacionados.">
            <div className="space-y-3">
              <Link className="btn-secondary w-full" to={`/admin/facturacion/${invoice.id}/imprimir`}>
                <Printer size={16} className="mr-2" />
                Imprimir factura
              </Link>
              {quote && (
                <Link className="btn-secondary w-full" to={`/admin/cotizaciones/${quote.id}`}>
                  <ReceiptText size={16} className="mr-2" />
                  Ver cotizacion
                </Link>
              )}
              {order && (
                <Link className="btn-secondary w-full" to={`/admin/ordenes/${order.id}`}>
                  Ver orden
                </Link>
              )}
              {customer && (
                <Link className="btn-secondary w-full" to={`/admin/clientes/${customer.id}`}>
                  Ver cliente
                </Link>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Registrar abono" description="Aplica pago parcial o total a esta factura.">
            <form onSubmit={(event) => handlePayment(event, invoice.id, invoice.customerId)} className="grid gap-3">
              <input name="amount" className="field" type="number" min="1" max={invoice.balance || invoice.total} placeholder="Monto" required />
              <select name="method" className="field" defaultValue="transferencia">
                <option value="efectivo">efectivo</option>
                <option value="transferencia">transferencia</option>
                <option value="tarjeta">tarjeta</option>
                <option value="mixto">mixto</option>
              </select>
              <textarea name="note" className="field" rows={3} placeholder="Nota del pago" />
              <button className="btn-primary" type="submit" disabled={invoice.balance <= 0}>
                Registrar pago
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Actividad" description="Eventos financieros y comerciales.">
            <div className="space-y-3">
              {invoiceActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{activity.description}</p>
                  <p className="mt-1 text-sm text-soft">{shortDate(activity.createdAt)}</p>
                </div>
              ))}
              {invoiceActivities.length === 0 && <p className="text-sm text-soft">Sin actividad relacionada todavia.</p>}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Pagos registrados" description="Historial de abonos aplicados a la factura.">
        <ShellTable columns={['Fecha', 'Monto', 'Metodo', 'Nota']}>
          {invoicePayments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-3 text-white">{shortDate(payment.createdAt)}</td>
              <td className="px-4 py-3 text-soft">{currency(payment.amount)}</td>
              <td className="px-4 py-3 text-soft">{payment.method}</td>
              <td className="px-4 py-3 text-soft">{payment.note}</td>
            </tr>
          ))}
        </ShellTable>
      </SectionCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-soft">{label}</p>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="label mb-2">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-soft">{label}</span>
      <span className={strong ? 'text-xl font-semibold text-white' : 'text-sm font-medium text-white'}>{value}</span>
    </div>
  );
}
