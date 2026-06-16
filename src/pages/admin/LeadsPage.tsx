import { useDeferredValue, useState, startTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { leadStatusFlow, leadStatusLabels } from '../../lib/leadStatus';
import { currency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

const leadStages = leadStatusFlow;

const leadSchema = z.object({
  name: z.string().min(2, 'Obligatorio'),
  business: z.string().min(2, 'Obligatorio'),
  phone: z.string().min(8, 'Obligatorio'),
  whatsapp: z.string().min(8, 'Obligatorio'),
  email: z.string().email('Correo inválido'),
  address: z.string().min(5, 'Obligatorio'),
  source: z.string().min(2, 'Obligatorio'),
  interestType: z.string().min(2, 'Obligatorio'),
  estimatedBudget: z.number({ error: 'Debe ser un número' }).min(1, 'Obligatorio'),
  owner: z.string().min(2, 'Obligatorio'),
  nextAction: z.string().min(2, 'Obligatorio'),
  description: z.string().min(5, 'Obligatorio'),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadsPage() {
  const { leads, addLead, convertLeadToCustomer, createQuoteFromLead } = useAppStore((state) => state);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const filtered = leads.filter((lead) =>
    `${lead.business} ${lead.name} ${lead.source}`.toLowerCase().includes(deferredQuery.toLowerCase()),
  );

  const onSubmit = (data: LeadFormData) => {
    addLead({
      ...data,
      notes: data.notes || '',
      status: 'nuevo',
    });
    reset();
  };

  const handleCreateQuote = async (leadId: string) => {
    const quoteId = await createQuoteFromLead(leadId);
    if (quoteId) {
      navigate(`/admin/cotizaciones/${quoteId}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline comercial"
        title="Leads"
        description="Capta, organiza y convierte oportunidades desde web, redes y gestión manual."
        action={<input className="field w-full md:w-72" placeholder="Buscar lead" value={query} onChange={(event) => startTransition(() => setQuery(event.target.value))} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <SectionCard title="Vista tabla" description="Leads con seguimiento y próximos pasos.">
          <ShellTable columns={['Lead', 'Fuente', 'Interés', 'Presupuesto', 'Estado', 'Acciones']}>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3">
                  <Link to={`/admin/leads/${lead.id}`} className="block">
                    <p className="font-medium text-white transition hover:text-cyan-100">{lead.business}</p>
                    <p className="text-sm text-soft">{lead.name}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-soft">{lead.source}</td>
                <td className="px-4 py-3 text-soft">{lead.interestType}</td>
                <td className="px-4 py-3 text-soft">{currency(lead.estimatedBudget)}</td>
                <td className="px-4 py-3"><StatusBadge label={lead.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-ghost" onClick={() => convertLeadToCustomer(lead.id)}>Convertir</button>
                    <button
                      className="btn-ghost"
                      onClick={() => void handleCreateQuote(lead.id)}
                    >
                      Generar cotización
                    </button>
                    <Link className="btn-ghost" to={`/admin/leads/${lead.id}`}>Ver detalle</Link>
                  </div>
                </td>
              </tr>
            ))}
          </ShellTable>
        </SectionCard>

        <SectionCard title="Crear lead manual" description="Registro rápido listo para alimentar el CRM.">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <div>
              <input {...register('name')} className="field w-full" placeholder="Nombre" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <input {...register('business')} className="field w-full" placeholder="Negocio" />
              {errors.business && <p className="text-red-400 text-xs mt-1">{errors.business.message}</p>}
            </div>
            <div>
              <input {...register('phone')} className="field w-full" placeholder="Teléfono" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <input {...register('whatsapp')} className="field w-full" placeholder="WhatsApp" />
              {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp.message}</p>}
            </div>
            <div>
              <input {...register('email')} className="field w-full" placeholder="Correo" type="email" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input {...register('address')} className="field w-full" placeholder="Dirección" />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <input {...register('source')} className="field w-full" placeholder="Fuente" />
              {errors.source && <p className="text-red-400 text-xs mt-1">{errors.source.message}</p>}
            </div>
            <div>
              <input {...register('interestType')} className="field w-full" placeholder="Tipo de interés" />
              {errors.interestType && <p className="text-red-400 text-xs mt-1">{errors.interestType.message}</p>}
            </div>
            <div>
              <input {...register('estimatedBudget', { valueAsNumber: true })} className="field w-full" type="number" placeholder="Presupuesto estimado" />
              {errors.estimatedBudget && <p className="text-red-400 text-xs mt-1">{errors.estimatedBudget.message}</p>}
            </div>
            <div>
              <input {...register('owner')} className="field w-full" placeholder="Responsable" />
              {errors.owner && <p className="text-red-400 text-xs mt-1">{errors.owner.message}</p>}
            </div>
            <div>
              <input {...register('nextAction')} className="field w-full" placeholder="Próxima acción" />
              {errors.nextAction && <p className="text-red-400 text-xs mt-1">{errors.nextAction.message}</p>}
            </div>
            <div>
              <textarea {...register('description')} className="field w-full" rows={3} placeholder="Descripción" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <textarea {...register('notes')} className="field w-full" rows={3} placeholder="Notas internas" />
            </div>
            <button className="btn-primary" type="submit">Guardar lead</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Vista Kanban" description="Pipeline visual para priorizar seguimiento.">
        <div className="grid gap-4 xl:grid-cols-7">
          {leadStages.map((stage) => (
            <div key={stage} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{leadStatusLabels[stage]}</h3>
                <span className="text-xs text-soft">{leads.filter((lead) => lead.status === stage).length}</span>
              </div>
              <div className="space-y-3">
                {leads
                  .filter((lead) => lead.status === stage)
                  .map((lead) => (
                    <Link key={lead.id} to={`/admin/leads/${lead.id}`} className="block rounded-2xl border border-white/10 bg-ink/70 p-3">
                      <p className="font-medium text-white">{lead.business}</p>
                      <p className="mt-1 text-sm text-soft">{lead.nextAction}</p>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
