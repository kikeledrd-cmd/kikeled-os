import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Search, UserRound } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { leadStatusFlow, leadStatusLabels } from '../../lib/leadStatus';
import { Lead } from '../../types/entities';
import { useAppStore } from '../../store/useAppStore';

const statusOptions: Array<{ label: string; value: Lead['status'] }> = leadStatusFlow.map((status) => ({
  label: leadStatusLabels[status],
  value: status,
}));

export function OsDashboardPage() {
  const { leads, quotes, orders, updateLeadStatus, createQuoteFromLead } = useAppStore((state) => state);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? '');

  const filteredLeads = useMemo(() => {
    const needle = query.toLowerCase();
    return leads.filter((lead) => `${lead.business} ${lead.name} ${lead.whatsapp} ${lead.interestType}`.toLowerCase().includes(needle));
  }, [leads, query]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0] ?? leads[0];
  const newLeads = leads.filter((lead) => lead.status === 'nuevo').length;
  const activeLeads = leads.filter((lead) => !['perdido', 'cerrado'].includes(lead.status)).length;

  const handleCreateQuote = async (leadId: string) => {
    const quoteId = await createQuoteFromLead(leadId);
    if (quoteId) {
      navigate(`/admin/cotizaciones/${quoteId}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RGB Control"
        title="OS Dashboard"
        description="CRM basico para capturar, priorizar y mover leads hacia cotizacion, produccion y cierre."
        action={
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-3.5 text-soft" size={16} />
            <input className="field pl-10" placeholder="Buscar lead" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Leads', leads.length],
          ['Nuevos', newLeads],
          ['Activos', activeLeads],
          ['Cotizaciones', quotes.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-soft">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="Leads capturados" description="Solicitudes web, manuales y de portal cliente.">
          <ShellTable columns={['Lead', 'Servicio', 'Presupuesto', 'Estado', 'Accion']}>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3">
                  <button className="text-left" onClick={() => setSelectedLeadId(lead.id)}>
                    <p className="font-medium text-white">{lead.business}</p>
                    <p className="text-sm text-soft">{lead.name} · {lead.whatsapp}</p>
                  </button>
                </td>
                <td className="px-4 py-3 text-soft">{lead.interestType}</td>
                <td className="px-4 py-3 text-soft">{currency(lead.estimatedBudget)}</td>
                <td className="px-4 py-3"><StatusBadge label={lead.status} /></td>
                <td className="px-4 py-3">
                  <select
                    className="field min-w-44 py-2"
                    value={lead.status}
                    onChange={(event) => updateLeadStatus(lead.id, event.target.value as Lead['status'])}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.label} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </ShellTable>
        </SectionCard>

        <SectionCard title="Detalle del lead" description="Informacion util para contacto y cotizacion.">
          {selectedLead ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-ink/60 p-5">
                <div className="flex items-start gap-3">
                  <UserRound className="text-cyan-100" size={20} />
                  <div>
                    <p className="text-xl font-semibold text-white">{selectedLead.business}</p>
                    <p className="mt-1 text-sm text-soft">{selectedLead.name}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-soft">
                  <p><span className="text-white">WhatsApp:</span> {selectedLead.whatsapp}</p>
                  <p><span className="text-white">Ciudad:</span> {selectedLead.city ?? selectedLead.address}</p>
                  <p><span className="text-white">Tipo:</span> {selectedLead.businessType ?? 'Por definir'}</p>
                  <p><span className="text-white">Medidas:</span> {selectedLead.measures ?? 'Por definir'}</p>
                  <p><span className="text-white">Urgencia:</span> {selectedLead.urgency ?? 'Por definir'}</p>
                  <p><span className="text-white">Creado:</span> {shortDate(selectedLead.createdAt)}</p>
                  <p><span className="text-white">Actualizado:</span> {shortDate(selectedLead.updatedAt ?? selectedLead.createdAt)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Mensaje</p>
                <p className="mt-3 text-sm leading-7 text-soft">{selectedLead.description}</p>
              </div>
              {selectedLead.referenceFileUrl && (
                <a href={selectedLead.referenceFileUrl} target="_blank" className="btn-secondary w-full" rel="noreferrer">
                  Ver logo o referencia
                </a>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <Link className="btn-secondary w-full" to={`/admin/leads/${selectedLead.id}`}>
                  Ver detalle real
                </Link>
                <button className="btn-primary w-full" onClick={() => void handleCreateQuote(selectedLead.id)}>
                  Generar cotizacion
                </button>
              </div>
              <a className="btn-primary w-full" href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                <MessageCircle size={16} className="mr-2" />
                Contactar por WhatsApp
              </a>
            </div>
          ) : (
            <p className="text-sm text-soft">Todavia no hay leads para mostrar.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Produccion conectada" description="Indicador rapido de flujo operativo.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-soft">Ordenes</p>
            <p className="mt-2 text-2xl font-semibold text-white">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-soft">RGB Control</p>
            <p className="mt-2 text-2xl font-semibold text-white">Activo</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-soft">Siguiente fase</p>
            <p className="mt-2 text-2xl font-semibold text-white">Cotizador</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
