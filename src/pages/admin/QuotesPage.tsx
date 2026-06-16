import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

const quoteSchema = z.object({
  customerId: z.string().min(1, 'Selecciona un cliente'),
  serviceId: z.string().min(1, 'Selecciona un servicio'),
  description: z.string().min(5, 'Obligatorio'),
  measures: z.string().min(2, 'Obligatorio'),
  quantity: z.number({ error: 'Debe ser un número' }).min(1, 'Mínimo 1'),
  materials: z.string().min(2, 'Obligatorio'),
  unitPrice: z.number({ error: 'Debe ser un número' }).min(1, 'Mínimo 1'),
  estimatedDate: z.string().min(10, 'Obligatorio'),
  discount: z.number({ error: 'Debe ser un número' }).min(0, 'No puede ser negativo'),
  followUp: z.string().min(2, 'Obligatorio'),
  lighting: z.boolean(),
  installationIncluded: z.boolean(),
  transportIncluded: z.boolean(),
  observations: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export function QuotesPage() {
  const { quotes, customers, services, addQuote, duplicateQuote, convertQuoteToOrder, createInvoiceFromQuote } = useAppStore((state) => state);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerId: '',
      serviceId: '',
      quantity: 1,
      discount: 0,
      lighting: false,
      installationIncluded: false,
      transportIncluded: false,
    }
  });

  const onSubmit = async (data: QuoteFormData) => {
    const quoteId = await addQuote({
      customerId: data.customerId,
      items: [
        {
          serviceId: data.serviceId,
          description: data.description,
          measures: data.measures,
          quantity: data.quantity,
          materials: data.materials.split(',').map((value) => value.trim()).filter(Boolean),
          lighting: data.lighting,
          designIncluded: true,
          installationIncluded: data.installationIncluded,
          transportIncluded: data.transportIncluded,
          unitPrice: data.unitPrice,
        },
      ],
      estimatedDate: data.estimatedDate,
      observations: data.observations || '',
      discount: data.discount,
      status: 'borrador',
      followUp: data.followUp,
    });
    reset();
    navigate(`/admin/cotizaciones/${quoteId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Propuestas" title="Cotizaciones" description="Versiona propuestas, haz seguimiento y conviértelas en órdenes o facturas sin perder el contexto del cliente." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="Listado" description="Estados y acciones conectadas.">
          <ShellTable columns={['Número', 'Cliente', 'Fecha', 'Total', 'Estado', 'Acciones']}>
            {quotes.map((quote) => {
              const customer = customers.find((item) => item.id === quote.customerId);
              return (
                <tr key={quote.id}>
                  <td className="px-4 py-3">
                    <Link to={`/admin/cotizaciones/${quote.id}`} className="font-medium text-white transition hover:text-cyan-100">
                      {quote.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-soft">{customer?.business}</td>
                  <td className="px-4 py-3 text-soft">{shortDate(quote.createdAt)}</td>
                  <td className="px-4 py-3 text-soft">{currency(quote.total)}</td>
                  <td className="px-4 py-3"><StatusBadge label={quote.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost" onClick={() => duplicateQuote(quote.id)}>Duplicar</button>
                      <button className="btn-ghost" onClick={() => convertQuoteToOrder(quote.id)}>Convertir orden</button>
                      <button className="btn-ghost" onClick={() => createInvoiceFromQuote(quote.id)}>Facturar</button>
                      <Link className="btn-ghost" to={`/admin/cotizaciones/${quote.id}`}>Ver detalle</Link>
                      <Link className="btn-ghost" to={`/admin/cotizaciones/${quote.id}/imprimir`}>Imprimir</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </ShellTable>
        </SectionCard>
        <SectionCard title="Nueva cotización" description="Creación manual para ventas consultivas o ajustes.">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <div>
              <select {...register('customerId')} className="field w-full">
                <option value="">Selecciona cliente</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.business}</option>)}
              </select>
              {errors.customerId && <p className="text-red-400 text-xs mt-1">{errors.customerId.message}</p>}
            </div>
            <div>
              <select {...register('serviceId')} className="field w-full">
                <option value="">Selecciona servicio</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
              {errors.serviceId && <p className="text-red-400 text-xs mt-1">{errors.serviceId.message}</p>}
            </div>
            <div>
              <input {...register('description')} className="field w-full" placeholder="Descripción" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <input {...register('measures')} className="field w-full" placeholder="Medidas" />
              {errors.measures && <p className="text-red-400 text-xs mt-1">{errors.measures.message}</p>}
            </div>
            <div>
              <input {...register('quantity', { valueAsNumber: true })} className="field w-full" type="number" placeholder="Cantidad" />
              {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <input {...register('materials')} className="field w-full" placeholder="Materiales separados por coma" />
              {errors.materials && <p className="text-red-400 text-xs mt-1">{errors.materials.message}</p>}
            </div>
            <div>
              <input {...register('unitPrice', { valueAsNumber: true })} className="field w-full" type="number" placeholder="Precio unitario" />
              {errors.unitPrice && <p className="text-red-400 text-xs mt-1">{errors.unitPrice.message}</p>}
            </div>
            <div>
              <input {...register('estimatedDate')} className="field w-full" type="date" />
              {errors.estimatedDate && <p className="text-red-400 text-xs mt-1">{errors.estimatedDate.message}</p>}
            </div>
            <div>
              <input {...register('discount', { valueAsNumber: true })} className="field w-full" type="number" placeholder="Descuento" />
              {errors.discount && <p className="text-red-400 text-xs mt-1">{errors.discount.message}</p>}
            </div>
            <div>
              <input {...register('followUp')} className="field w-full" placeholder="Seguimiento" />
              {errors.followUp && <p className="text-red-400 text-xs mt-1">{errors.followUp.message}</p>}
            </div>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white flex gap-2 items-center">
              <input type="checkbox" {...register('lighting')} /> Iluminación
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white flex gap-2 items-center">
              <input type="checkbox" {...register('installationIncluded')} /> Instalación incluida
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white flex gap-2 items-center">
              <input type="checkbox" {...register('transportIncluded')} /> Transporte incluido
            </label>
            <div>
              <textarea {...register('observations')} className="field w-full" rows={3} placeholder="Observaciones" />
              {errors.observations && <p className="text-red-400 text-xs mt-1">{errors.observations.message}</p>}
            </div>
            <button className="btn-primary" type="submit">Guardar cotización</button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
