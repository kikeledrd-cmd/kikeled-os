import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileBadge, MessageCircle } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { leadStatusFlow, leadStatusLabels } from '../../lib/leadStatus';
import { currency, shortDate } from '../../lib/utils';
import { Lead } from '../../types/entities';
import { useAppStore } from '../../store/useAppStore';

export function LeadDetailPage() {
  const { leadId = '' } = useParams();
  const navigate = useNavigate();
  const { leads, customers, quotes, activities, updateLeadStatus, createQuoteFromLead } = useAppStore((state) => state);
  const lead = leads.find((item) => item.id === leadId);

  if (!lead) {
    return (
      <SectionCard title="Lead no encontrado" description="El enlace no coincide con un lead disponible.">
        <Link to="/admin/leads" className="btn-secondary">
          <ArrowLeft size={16} className="mr-2" />
          Volver a leads
        </Link>
      </SectionCard>
    );
  }

  const customer = lead.customerId ? customers.find((item) => item.id === lead.customerId) : null;
  const leadQuotes = quotes.filter((quote) => quote.leadId === lead.id);
  const leadActivities = activities.filter((activity) => activity.leadId === lead.id);
  const whatsappUrl = `https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`;

  async function handleCreateQuote(targetLeadId: string) {
    const quoteId = await createQuoteFromLead(targetLeadId);
    if (quoteId) {
      navigate(`/admin/cotizaciones/${quoteId}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de lead"
        title={lead.business}
        description={`Solicitud de ${lead.name} capturada por ${lead.source}.`}
        action={
          <Link to="/admin/leads" className="btn-secondary">
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-soft">Estado</p>
          <div className="mt-3"><StatusBadge label={lead.status} /></div>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-soft">Presupuesto</p>
          <p className="mt-2 text-2xl font-semibold text-white">{currency(lead.estimatedBudget)}</p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-soft">Creado</p>
          <p className="mt-2 text-lg font-semibold text-white">{shortDate(lead.createdAt)}</p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-soft">Cotizaciones</p>
          <p className="mt-2 text-2xl font-semibold text-white">{leadQuotes.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <SectionCard title="Informacion comercial" description="Datos necesarios para contacto, propuesta y seguimiento.">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Contacto" value={lead.name} />
            <Info label="WhatsApp" value={lead.whatsapp} />
            <Info label="Telefono" value={lead.phone} />
            <Info label="Correo" value={lead.email} />
            <Info label="Ciudad" value={lead.city ?? lead.address} />
            <Info label="Tipo de negocio" value={lead.businessType ?? 'Por definir'} />
            <Info label="Servicio solicitado" value={lead.interestType} />
            <Info label="Medidas" value={lead.measures ?? 'Por definir'} />
            <Info label="Urgencia" value={lead.urgency ?? 'Por definir'} />
            <Info label="Cliente asociado" value={customer?.business ?? 'Aun no asociado'} />
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-ink/60 p-5">
            <p className="text-sm font-semibold text-white">Mensaje</p>
            <p className="mt-3 text-sm leading-7 text-soft">{lead.description}</p>
          </div>
          {lead.notes && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Notas</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-soft">{lead.notes}</p>
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Acciones" description="Mover el lead sin perder trazabilidad.">
            <div className="space-y-3">
              <select
                className="field w-full"
                value={lead.status}
                onChange={(event) => updateLeadStatus(lead.id, event.target.value as Lead['status'])}
              >
                {leadStatusFlow.map((status) => (
                  <option key={status} value={status}>{leadStatusLabels[status]}</option>
                ))}
              </select>
              <button className="btn-primary w-full" onClick={() => void handleCreateQuote(lead.id)}>
                <FileBadge size={16} className="mr-2" />
                Generar cotizacion borrador
              </button>
              <a className="btn-secondary w-full" href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle size={16} className="mr-2" />
                Contactar por WhatsApp
              </a>
              {lead.referenceFileUrl && (
                <a className="btn-secondary w-full" href={lead.referenceFileUrl} target="_blank" rel="noreferrer">
                  Ver logo o referencia
                </a>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Cotizaciones del lead" description="Propuestas generadas desde esta oportunidad.">
            <ShellTable columns={['Numero', 'Total', 'Estado']}>
              {leadQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-4 py-3 text-white">{quote.number}</td>
                  <td className="px-4 py-3 text-soft">{currency(quote.total)}</td>
                  <td className="px-4 py-3"><StatusBadge label={quote.status} /></td>
                </tr>
              ))}
            </ShellTable>
          </SectionCard>

          <SectionCard title="Actividad" description="Historial relacionado al lead.">
            <div className="space-y-3">
              {leadActivities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{activity.description}</p>
                  <p className="mt-1 text-sm text-soft">{shortDate(activity.createdAt)}</p>
                </div>
              ))}
              {leadActivities.length === 0 && <p className="text-sm text-soft">Sin actividad registrada todavia.</p>}
            </div>
          </SectionCard>
        </div>
      </div>
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
