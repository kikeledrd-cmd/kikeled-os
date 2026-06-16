import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Download, Printer } from 'lucide-react';
import { brand } from '../../lib/brand';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function InvoicePrintPage() {
  const { invoiceId = '' } = useParams();
  const { invoices, customers, payments } = useAppStore((state) => state);
  const invoice = invoices.find((item) => item.id === invoiceId);
  const customer = customers.find((item) => item.id === invoice?.customerId);
  const invoicePayments = payments.filter((payment) => payment.invoiceId === invoice?.id);

  if (!invoice || !customer) {
    return <div className="min-h-screen bg-white p-10 text-black">Factura no encontrada.</div>;
  }

  return (
    <PrintShell backTo={`/admin/facturacion/${invoice.id}`} documentLabel="Factura">
      <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-2xl shadow-black/10 print:rounded-none print:border-0 print:shadow-none">
        <header className="bg-neutral-950 px-8 py-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-neutral-950">K</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{brand.commercialName}</p>
                  <h1 className="mt-1 text-3xl font-semibold">Factura Comercial</h1>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-300">{brand.tagline}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Factura</p>
              <p className="mt-2 text-2xl font-semibold">{invoice.number}</p>
              <p className="mt-2 text-sm text-neutral-300">Emision: {shortDate(invoice.issuedAt)}</p>
              <p className="text-sm text-neutral-300">Vence: {invoice.dueAt ? shortDate(invoice.dueAt) : 'No aplica'}</p>
            </div>
          </div>
        </header>

        <main className="px-8 py-8 text-neutral-950">
          <section className="grid gap-4 md:grid-cols-3">
            <InfoBlock title="Cliente" lines={[customer.business, customer.name, customer.whatsapp]} />
            <InfoBlock title="Contacto KIKELED" lines={[brand.whatsapp, brand.email, brand.location]} />
            <InfoBlock title="Pago" lines={[`Metodo: ${invoice.paymentMethod}`, `Estado: ${invoice.status}`, `Balance: ${currency(invoice.balance)}`]} />
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Detalle facturado</h2>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-[0.14em] text-neutral-500">
                  <th className="px-3 py-3">Descripcion</th>
                  <th className="px-3 py-3">Cant.</th>
                  <th className="px-3 py-3 text-right">Unitario</th>
                  <th className="px-3 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 align-top">
                    <td className="px-3 py-4 font-medium">{item.description}</td>
                    <td className="px-3 py-4 text-neutral-600">{item.quantity}</td>
                    <td className="px-3 py-4 text-right text-neutral-600">{currency(item.unitPrice)}</td>
                    <td className="px-3 py-4 text-right font-semibold">{currency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-[1fr,340px]">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Observaciones y pagos</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-700">{invoice.observations || 'Sin observaciones adicionales.'}</p>
              <div className="mt-5 space-y-2">
                {invoicePayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm">
                    <span>{shortDate(payment.createdAt)} - {payment.method}</span>
                    <strong>{currency(payment.amount)}</strong>
                  </div>
                ))}
                {invoicePayments.length === 0 && <p className="text-sm text-neutral-600">Sin pagos registrados.</p>}
              </div>
            </div>
            <TotalsCard rows={[
              ['Subtotal', currency(invoice.subtotal)],
              ['ITBIS', currency(invoice.tax)],
              ['Descuento', currency(invoice.discount)],
              ['Pagado', currency(invoice.paidAmount)],
            ]} totalLabel="Balance" total={currency(invoice.balance)} />
          </section>
        </main>

        <footer className="border-t border-neutral-200 px-8 py-5 text-xs text-neutral-500">
          {brand.commercialName} - {brand.whatsapp} - {brand.email}
        </footer>
      </div>
    </PrintShell>
  );
}

function PrintShell({ children, backTo, documentLabel }: { children: ReactNode; backTo: string; documentLabel: string }) {
  return (
    <div className="min-h-screen bg-neutral-100 p-6 text-black md:p-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to={backTo} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm">Volver</Link>
          <button onClick={() => window.print()} className="rounded-xl bg-black px-4 py-2 text-sm text-white">
            <Printer size={16} className="mr-2 inline-block" />
            Imprimir / guardar PDF
          </button>
          <span className="rounded-xl border border-cyan-300/30 bg-cyan-50 px-4 py-2 text-sm text-cyan-900">
            <Download size={16} className="mr-2 inline-block" />
            {documentLabel} lista para PDF
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
      <div className="mt-3 space-y-1 text-sm text-neutral-800">
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
    </div>
  );
}

function TotalsCard({ rows, totalLabel, total }: { rows: Array<[string, string]>; totalLabel: string; total: string }) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5 text-white">
      <div className="space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-neutral-300">
            <span>{label}</span>
            <strong className="text-white">{value}</strong>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-white/15 pt-4">
        <div className="flex justify-between gap-4">
          <span>{totalLabel}</span>
          <strong className="text-2xl">{total}</strong>
        </div>
      </div>
    </div>
  );
}
