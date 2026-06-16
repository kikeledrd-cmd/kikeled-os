import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MetricStrip } from '../../components/shared/MetricStrip';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { apiUploadFile } from '../../lib/api';
import { useAppStore, useCustomerMetrics } from '../../store/useAppStore';

export function CustomerDetailPage() {
  const { customerId = '' } = useParams();
  const customers = useAppStore((state) => state.customers);
  const customerNotes = useAppStore((state) => state.customerNotes);
  const allActivities = useAppStore((state) => state.activities);
  const allAttachments = useAppStore((state) => state.attachments);
  const addAttachment = useAppStore((state) => state.addAttachment);
  const metrics = useCustomerMetrics(customerId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const customer = useMemo(
    () => customers.find((item) => item.id === customerId),
    [customerId, customers],
  );
  const notes = useMemo(
    () => customerNotes.filter((item) => item.customerId === customerId),
    [customerId, customerNotes],
  );
  const activities = useMemo(
    () => allActivities.filter((item) => item.customerId === customerId),
    [allActivities, customerId],
  );
  const attachments = useMemo(
    () => allAttachments.filter((item) => item.customerId === customerId),
    [allAttachments, customerId],
  );

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiUploadFile(file);
      await addAttachment({
        customerId,
        name: result.name,
        type: result.type,
        url: result.url,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!customer) {
    return <SectionCard title="Cliente no encontrado">Verifica el enlace interno del CRM.</SectionCard>;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Cliente 360" title={customer.business} description={`Perfil unificado de ${customer.name} con historial comercial, operativo, facturación y premium.`} />
      <MetricStrip
        items={[
          { label: 'Total cotizado', value: currency(metrics.totalQuoted) },
          { label: 'Total facturado', value: currency(metrics.totalInvoiced) },
          { label: 'Total pagado', value: currency(metrics.totalPaid) },
          { label: 'Balance pendiente', value: currency(metrics.balance) },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <SectionCard title="Resumen" description="Datos generales y estado comercial.">
            <div className="grid gap-4 md:grid-cols-2">
              <div><p className="label mb-2">Contacto</p><p className="text-white">{customer.phone} / {customer.email}</p></div>
              <div><p className="label mb-2">Estado comercial</p><StatusBadge label={customer.commercialStatus} /></div>
              <div><p className="label mb-2">Dirección</p><p className="text-white">{customer.address}</p></div>
              <div><p className="label mb-2">Nivel premium</p><StatusBadge label={customer.premiumLevel} /></div>
            </div>
          </SectionCard>

          <SectionCard title="Cotizaciones" description="Historial comercial por propuesta.">
            <ShellTable columns={['Número', 'Estado', 'Total', 'Seguimiento']}>
              {metrics.quotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-4 py-3 text-white">{quote.number}</td>
                  <td className="px-4 py-3"><StatusBadge label={quote.status} /></td>
                  <td className="px-4 py-3 text-soft">{currency(quote.total)}</td>
                  <td className="px-4 py-3 text-soft">{quote.followUp}</td>
                </tr>
              ))}
            </ShellTable>
          </SectionCard>

          <SectionCard title="Órdenes" description="Producción e instalación asociadas al cliente.">
            <ShellTable columns={['Orden', 'Servicio', 'Estado', 'Progreso']}>
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

          <SectionCard title="Facturas y pagos" description="Relación financiera viva dentro del CRM.">
            <ShellTable columns={['Factura', 'Estado', 'Total', 'Balance']}>
              {metrics.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 text-white">{invoice.number}</td>
                  <td className="px-4 py-3"><StatusBadge label={invoice.status} /></td>
                  <td className="px-4 py-3 text-soft">{currency(invoice.total)}</td>
                  <td className="px-4 py-3 text-soft">{currency(invoice.balance)}</td>
                </tr>
              ))}
            </ShellTable>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Premium" description="Membresía activa y beneficios usados.">
            {metrics.membership ? (
              <div className="space-y-3">
                <StatusBadge label={customer.premiumLevel} />
                <p className="text-white">Vigente hasta {shortDate(metrics.membership.endDate)}</p>
                <p className="text-soft">Puntos: {metrics.membership.points}</p>
                <p className="text-soft">Gasto acumulado: {currency(metrics.membership.spentAmount)}</p>
              </div>
            ) : (
              <p className="text-soft">Sin membresía premium activa.</p>
            )}
          </SectionCard>
          <SectionCard title="Notas" description="Contexto comercial e interno.">
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{note.title}</p>
                  <p className="mt-2 text-sm text-soft">{note.body}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Actividad" description="Eventos históricos del cliente.">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{activity.description}</p>
                  <p className="mt-1 text-sm text-soft">{shortDate(activity.createdAt)}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Archivos" description="Adjuntos relacionados.">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="field flex-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-white"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <button
                  className="btn-primary whitespace-nowrap"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Subiendo…' : 'Subir'}
                </button>
              </div>
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                  >
                    <div>
                      <p className="font-medium text-white">{attachment.name}</p>
                      <p className="mt-1 text-xs text-soft">{attachment.type}</p>
                    </div>
                    <span className="text-xs text-soft">Descargar ↗</span>
                  </a>
                ))}
                {attachments.length === 0 && <p className="text-sm text-soft text-center py-2">Sin archivos adjuntos.</p>}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
