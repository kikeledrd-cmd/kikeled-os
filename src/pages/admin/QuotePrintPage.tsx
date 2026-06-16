import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Download, Printer } from 'lucide-react';
import { brand } from '../../lib/brand';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function QuotePrintPage() {
  const { quoteId = '' } = useParams();
  const { quotes, customers, leads } = useAppStore((state) => state);
  const quote = quotes.find((item) => item.id === quoteId);
  const customer = customers.find((item) => item.id === quote?.customerId);
  const lead = quote?.leadId ? leads.find((item) => item.id === quote.leadId) : null;

  if (!quote || !customer) {
    return <div className="min-h-screen bg-white p-10 text-black">Cotizacion no encontrada.</div>;
  }

  return (
    <PrintShell backTo={`/admin/cotizaciones/${quote.id}`} documentLabel="Cotizacion">
      <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-2xl shadow-black/10 print:rounded-none print:border-0 print:shadow-none">
        <header className="bg-neutral-950 px-8 py-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-neutral-950">K</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{brand.commercialName}</p>
                  <h1 className="mt-1 text-3xl font-semibold">Propuesta Comercial</h1>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-300">{brand.positioning}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Cotizacion</p>
              <p className="mt-2 text-2xl font-semibold">{quote.number}</p>
              <p className="mt-2 text-sm text-neutral-300">Fecha: {shortDate(quote.createdAt)}</p>
              <p className="text-sm text-neutral-300">Entrega: {shortDate(quote.estimatedDate)}</p>
            </div>
          </div>
        </header>

        <main className="px-8 py-8 text-neutral-950">
          <section className="grid gap-4 md:grid-cols-3">
            <InfoBlock title="Cliente" lines={[customer.business, customer.name, customer.whatsapp]} />
            <InfoBlock title="Contacto KIKELED" lines={[brand.whatsapp, brand.email, brand.location]} />
            <InfoBlock title="Estado" lines={[quote.status, `Version ${quote.version}`, lead ? `Lead: ${lead.business}` : 'Origen: venta directa']} />
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Detalle de productos</h2>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-[0.14em] text-neutral-500">
                  <th className="px-3 py-3">Descripcion</th>
                  <th className="px-3 py-3">Medidas</th>
                  <th className="px-3 py-3">Cant.</th>
                  <th className="px-3 py-3">Materiales</th>
                  <th className="px-3 py-3 text-right">Unitario</th>
                  <th className="px-3 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 align-top">
                    <td className="px-3 py-4 font-medium">{item.description}</td>
                    <td className="px-3 py-4 text-neutral-600">{item.measures}</td>
                    <td className="px-3 py-4 text-neutral-600">{item.quantity}</td>
                    <td className="px-3 py-4 text-neutral-600">{item.materials.join(', ')}</td>
                    <td className="px-3 py-4 text-right text-neutral-600">{currency(item.unitPrice)}</td>
                    <td className="px-3 py-4 text-right font-semibold">{currency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-[1fr,340px]">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Observaciones y condiciones</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-700">{quote.observations || 'Sin observaciones adicionales.'}</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                <li>Validez sugerida: 7 dias calendario desde la emision.</li>
                <li>Produccion inicia luego de aprobacion, anticipo y artes finales.</li>
                <li>Colores, medidas e instalacion se confirman antes de fabricar.</li>
              </ul>
            </div>
            <TotalsCard rows={[
              ['Subtotal', currency(quote.subtotal)],
              ['ITBIS', currency(quote.tax)],
              ['Descuento', currency(quote.discount)],
            ]} totalLabel="Total propuesta" total={currency(quote.total)} />
          </section>
        </main>

        <footer className="border-t border-neutral-200 px-8 py-5 text-xs text-neutral-500">
          {brand.commercialName} - {brand.tagline} - {brand.instagram}
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
            {documentLabel} listo para PDF
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
