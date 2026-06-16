import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Download, Printer } from 'lucide-react';
import { brand } from '../../lib/brand';
import { shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

const productionChecklist = [
  'Arte final revisado y aprobado',
  'Medidas verificadas contra espacio real',
  'Materiales separados y marcados',
  'Corte / impresion / armado completado',
  'Prueba de iluminacion y fuentes',
  'Empaque protegido para traslado',
];

const installationChecklist = [
  'Herramientas y fijaciones listas',
  'Punto electrico verificado',
  'Nivelacion y posicion confirmadas',
  'Foto antes / durante / despues tomada',
  'Cliente valida entrega',
  'Area limpia al finalizar',
];

export function OrderPrintPage() {
  const { orderId = '' } = useParams();
  const { orders, customers, quotes, invoices, materials, orderMaterials } = useAppStore((state) => state);
  const order = orders.find((item) => item.id === orderId);
  const customer = customers.find((item) => item.id === order?.customerId);
  const quote = order?.quoteId ? quotes.find((item) => item.id === order.quoteId) : null;
  const invoice = invoices.find((item) => item.orderId === order?.id || item.quoteId === order?.quoteId);
  const assignedMaterials = orderMaterials.filter((item) => item.orderId === order?.id);

  if (!order || !customer) {
    return <div className="min-h-screen bg-white p-10 text-black">Orden no encontrada.</div>;
  }

  return (
    <PrintShell backTo={`/admin/ordenes/${order.id}`}>
      <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-2xl shadow-black/10 print:rounded-none print:border-0 print:shadow-none">
        <header className="bg-neutral-950 px-8 py-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-neutral-950">K</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{brand.commercialName}</p>
                  <h1 className="mt-1 text-3xl font-semibold">Orden de Trabajo</h1>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-300">Documento interno para produccion, taller, empaque e instalacion.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Orden</p>
              <p className="mt-2 text-2xl font-semibold">{order.number}</p>
              <p className="mt-2 text-sm text-neutral-300">Inicio: {shortDate(order.startDate)}</p>
              <p className="text-sm text-neutral-300">Promesa: {shortDate(order.promiseDate)}</p>
            </div>
          </div>
        </header>

        <main className="px-8 py-8 text-neutral-950">
          <section className="grid gap-4 md:grid-cols-4">
            <InfoBlock title="Cliente" lines={[customer.business, customer.name, customer.whatsapp]} />
            <InfoBlock title="Produccion" lines={[`Responsable: ${order.owner}`, `Estado: ${order.status}`, `Avance: ${order.progress}%`]} />
            <InfoBlock title="Prioridad" lines={[order.priority, order.service, quote ? `Cotizacion: ${quote.number}` : 'Sin cotizacion']} />
            <InfoBlock title="Facturacion" lines={[invoice ? invoice.number : 'Sin factura', invoice ? `Estado: ${invoice.status}` : 'Pendiente', brand.whatsapp]} />
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Items de produccion</h2>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-[0.14em] text-neutral-500">
                  <th className="px-3 py-3">Item</th>
                  <th className="px-3 py-3">Servicio</th>
                  <th className="px-3 py-3">Cantidad</th>
                  <th className="px-3 py-3">Medidas</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="px-3 py-4 font-medium">{item.description}</td>
                    <td className="px-3 py-4 text-neutral-600">{item.serviceId}</td>
                    <td className="px-3 py-4 text-neutral-600">{item.quantity}</td>
                    <td className="px-3 py-4 text-neutral-600">{item.measures}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <Note title="Notas tecnicas" value={order.technicalNotes || 'Sin notas tecnicas.'} />
            <Note title="Notas de instalacion" value={order.installationNotes || 'Sin notas de instalacion.'} />
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Materiales asignados</h2>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-[0.14em] text-neutral-500">
                  <th className="px-3 py-3">Material</th>
                  <th className="px-3 py-3">Codigo</th>
                  <th className="px-3 py-3">Cantidad</th>
                  <th className="px-3 py-3">Ubicacion</th>
                </tr>
              </thead>
              <tbody>
                {assignedMaterials.map((assigned) => {
                  const material = materials.find((item) => item.id === assigned.materialId);
                  return (
                    <tr key={assigned.id} className="border-b border-neutral-100">
                      <td className="px-3 py-4 font-medium">{material?.name ?? assigned.materialId}</td>
                      <td className="px-3 py-4 text-neutral-600">{material?.code ?? 'N/A'}</td>
                      <td className="px-3 py-4 text-neutral-600">{assigned.quantity} {material?.unit ?? ''}</td>
                      <td className="px-3 py-4 text-neutral-600">{material?.location ?? 'N/A'}</td>
                    </tr>
                  );
                })}
                {assignedMaterials.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-neutral-600" colSpan={4}>Sin materiales asignados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <Checklist title="Checklist de produccion" items={productionChecklist} />
            <Checklist title="Checklist de instalacion" items={installationChecklist} />
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-3">
            <Signature label="Produccion" />
            <Signature label="Instalador" />
            <Signature label="Cliente / recibido" />
          </section>
        </main>

        <footer className="border-t border-neutral-200 px-8 py-5 text-xs text-neutral-500">
          {brand.commercialName} - {brand.operatingBrain} - Documento interno de produccion
        </footer>
      </div>
    </PrintShell>
  );
}

function PrintShell({ children, backTo }: { children: ReactNode; backTo: string }) {
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
            Orden lista para taller
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

function Note({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">{title}</p>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-700">{value}</p>
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm text-neutral-800">
            <span className="h-5 w-5 rounded border border-neutral-400" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <div className="h-16 border-b border-neutral-300" />
      <p className="mt-3 text-center text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</p>
    </div>
  );
}
