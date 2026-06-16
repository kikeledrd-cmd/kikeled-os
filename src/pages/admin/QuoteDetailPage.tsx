import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowLeft, FileText, ReceiptText, Wrench } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { Quote } from '../../types/entities';
import { useAppStore } from '../../store/useAppStore';

const quoteStatusOptions: Quote['status'][] = [
  'borrador',
  'enviada',
  'pendiente',
  'aprobada',
  'rechazada',
  'vencida',
  'convertida en orden',
  'facturada',
];

export function QuoteDetailPage() {
  const { quoteId = '' } = useParams();
  const {
    quotes,
    customers,
    leads,
    services,
    orders,
    invoices,
    activities,
    updateQuoteStatus,
    duplicateQuote,
    convertQuoteToOrder,
    createInvoiceFromQuote,
  } = useAppStore((state) => state);

  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return (
      <SectionCard title="Cotizacion no encontrada" description="El enlace no coincide con una cotizacion disponible.">
        <Link to="/admin/cotizaciones" className="btn-secondary">
          <ArrowLeft size={16} className="mr-2" />
          Volver a cotizaciones
        </Link>
      </SectionCard>
    );
  }

  const customer = customers.find((item) => item.id === quote.customerId);
  const lead = quote.leadId ? leads.find((item) => item.id === quote.leadId) : null;
  const relatedOrder = orders.find((order) => order.quoteId === quote.id);
  const relatedInvoice = invoices.find((invoice) => invoice.quoteId === quote.id);
  const quoteActivities = activities.filter((activity) => activity.customerId === quote.customerId || activity.leadId === quote.leadId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de cotizacion"
        title={quote.number}
        description={customer ? `Propuesta para ${customer.business}.` : 'Propuesta sin cliente visible.'}
        action={
          <Link to="/admin/cotizaciones" className="btn-secondary">
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Estado" value={<StatusBadge label={quote.status} />} />
        <Metric label="Total" value={currency(quote.total)} />
        <Metric label="Entrega estimada" value={shortDate(quote.estimatedDate)} />
        <Metric label="Version" value={`v${quote.version}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <SectionCard title="Propuesta" description="Items, materiales y totales de la cotizacion.">
          <ShellTable columns={['Descripcion', 'Medidas', 'Cant.', 'Materiales', 'Unitario', 'Total']}>
            {quote.items.map((item) => {
              const service = services.find((entry) => entry.id === item.serviceId);
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{item.description}</p>
                    <p className="text-sm text-soft">{service?.name ?? 'Servicio personalizado'}</p>
                  </td>
                  <td className="px-4 py-3 text-soft">{item.measures}</td>
                  <td className="px-4 py-3 text-soft">{item.quantity}</td>
                  <td className="px-4 py-3 text-soft">{item.materials.join(', ')}</td>
                  <td className="px-4 py-3 text-soft">{currency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-soft">{currency(item.total)}</td>
                </tr>
              );
            })}
          </ShellTable>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Info label="Iluminacion" value={quote.items.some((item) => item.lighting) ? 'Incluida en al menos un item' : 'No marcada'} />
            <Info label="Instalacion" value={quote.items.some((item) => item.installationIncluded) ? 'Incluida' : 'No incluida'} />
            <Info label="Transporte" value={quote.items.some((item) => item.transportIncluded) ? 'Incluido' : 'No incluido'} />
            <Info label="Seguimiento" value={quote.followUp} />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-ink/60 p-5">
            <p className="text-sm font-semibold text-white">Observaciones</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-soft">{quote.observations || 'Sin observaciones.'}</p>
          </div>

          <div className="mt-5 ml-auto w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <Row label="Subtotal" value={currency(quote.subtotal)} />
            <Row label="ITBIS" value={currency(quote.tax)} />
            <Row label="Descuento" value={currency(quote.discount)} />
            <div className="border-t border-white/10 pt-3">
              <Row label="Total" value={currency(quote.total)} strong />
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Acciones" description="Gestion comercial y operativa de la propuesta.">
            <div className="space-y-3">
              <select
                className="field w-full"
                value={quote.status}
                onChange={(event) => updateQuoteStatus(quote.id, event.target.value as Quote['status'])}
              >
                {quoteStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Link className="btn-secondary w-full" to={`/admin/cotizaciones/${quote.id}/imprimir`}>
                <FileText size={16} className="mr-2" />
                Imprimir propuesta
              </Link>
              <button className="btn-secondary w-full" onClick={() => duplicateQuote(quote.id)}>
                Duplicar version
              </button>
              {relatedOrder ? (
                <Link className="btn-primary w-full" to={`/admin/ordenes/${relatedOrder.id}`}>
                  <Wrench size={16} className="mr-2" />
                  Ver orden {relatedOrder.number}
                </Link>
              ) : (
                <button className="btn-primary w-full" onClick={() => convertQuoteToOrder(quote.id)}>
                  <Wrench size={16} className="mr-2" />
                  Convertir en orden
                </button>
              )}
              {relatedInvoice ? (
                <Link className="btn-primary w-full" to={`/admin/facturacion/${relatedInvoice.id}`}>
                  <ReceiptText size={16} className="mr-2" />
                  Ver factura {relatedInvoice.number}
                </Link>
              ) : (
                <button className="btn-primary w-full" onClick={() => createInvoiceFromQuote(quote.id)}>
                  <ReceiptText size={16} className="mr-2" />
                  Crear factura
                </button>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Cliente y lead" description="Contexto comercial asociado.">
            <div className="space-y-3">
              <Info label="Cliente" value={customer?.business ?? 'No encontrado'} />
              <Info label="Contacto" value={customer?.name ?? lead?.name ?? 'Por definir'} />
              <Info label="WhatsApp" value={customer?.whatsapp ?? lead?.whatsapp ?? 'Por definir'} />
              {lead && (
                <Link className="btn-secondary w-full" to={`/admin/leads/${lead.id}`}>
                  Ver lead original
                </Link>
              )}
              {customer && (
                <Link className="btn-secondary w-full" to={`/admin/clientes/${customer.id}`}>
                  Ver cliente
                </Link>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Actividad relacionada" description="Eventos del cliente o lead.">
            <div className="space-y-3">
              {quoteActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{activity.description}</p>
                  <p className="mt-1 text-sm text-soft">{shortDate(activity.createdAt)}</p>
                </div>
              ))}
              {quoteActivities.length === 0 && <p className="text-sm text-soft">Sin actividad relacionada todavia.</p>}
            </div>
          </SectionCard>
        </div>
      </div>
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
