import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowLeft, FileText, Lock, MessageCircle, PackageCheck, Printer, Save } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { buildTechnicalSheet, getOrderProcesses, getOrderQualityControl } from '../../lib/technicalSheet';
import type { Order, ProductionProcess, ProductionProcessStatus, QualityControl, TechnicalSheet } from '../../types/entities';
import { useAppStore } from '../../store/useAppStore';

const orderStatuses: Order['status'][] = [
  'pendiente',
  'diseño',
  'corte',
  'impresión',
  'ensamblaje',
  'listo para instalar',
  'instalación',
  'entregado',
  'cerrado',
];

const processStatuses: ProductionProcessStatus[] = ['pendiente', 'en proceso', 'completado'];

const qualityLabels: Array<{ key: keyof Omit<QualityControl, 'revisadoPor' | 'fechaRevision' | 'observaciones'>; label: string }> = [
  { key: 'medidasCorrectas', label: 'Medidas correctas' },
  { key: 'corteLimpio', label: 'Corte limpio' },
  { key: 'iluminacionFunciona', label: 'Iluminacion funciona' },
  { key: 'cableadoSeguro', label: 'Cableado seguro' },
  { key: 'fijacionesCorrectas', label: 'Fijaciones correctas' },
  { key: 'acabadoFinal', label: 'Acabado final' },
  { key: 'limpiezaGeneral', label: 'Limpieza general' },
];

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const {
    orders,
    customers,
    quotes,
    invoices,
    materials,
    orderMaterials,
    activities,
    updateOrderStatus,
    saveOrderTechnicalData,
    assignMaterialsToOrder,
  } = useAppStore((state) => state);

  const order = orders.find((item) => item.id === orderId);
  const customer = customers.find((item) => item.id === order?.customerId);
  const quote = order?.quoteId ? quotes.find((item) => item.id === order.quoteId) : null;
  const invoice = invoices.find((item) => item.orderId === order?.id || item.quoteId === order?.quoteId);

  const initialSheet = useMemo(() => (order ? buildTechnicalSheet(order, customer, quote, invoice) : null), [order, customer, quote, invoice]);
  const initialProcesses = useMemo(() => (order ? getOrderProcesses(order) : []), [order]);
  const initialQuality = useMemo(() => (order ? getOrderQualityControl(order) : null), [order]);
  const [technicalSheet, setTechnicalSheet] = useState<TechnicalSheet | null>(initialSheet);
  const [productionProcesses, setProductionProcesses] = useState<ProductionProcess[]>(initialProcesses);
  const [qualityControl, setQualityControl] = useState<QualityControl | null>(initialQuality);

  useEffect(() => {
    setTechnicalSheet(initialSheet);
    setProductionProcesses(initialProcesses);
    setQualityControl(initialQuality);
    setStatusMessage('');
    setChangeNote('');
  }, [initialSheet, initialProcesses, initialQuality]);

  if (!order) {
    return (
      <SectionCard title="Orden no encontrada" description="El enlace no coincide con una orden disponible.">
        <Link to="/admin/ordenes" className="btn-secondary">
          <ArrowLeft size={16} className="mr-2" />
          Volver a ordenes
        </Link>
      </SectionCard>
    );
  }

  if (!technicalSheet || !qualityControl) {
    return null;
  }

  const assignedMaterials = orderMaterials.filter((item) => item.orderId === order.id);
  const orderActivities = activities.filter((activity) => activity.customerId === order.customerId);
  const technicalSheetUrl = `/admin/ordenes/${order.id}/ficha-tecnica`;
  const whatsappUrl = customer?.whatsapp ? `https://wa.me/${customer.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Ficha tecnica de ${order.number} lista para revision.`)}` : '';
  const locked = technicalSheet.locked;

  const updateSheet = <K extends keyof TechnicalSheet>(key: K, value: TechnicalSheet[K]) => {
    setTechnicalSheet((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateProcess = (processId: string, patch: Partial<ProductionProcess>) => {
    setProductionProcesses((current) => current.map((process) => (process.id === processId ? { ...process, ...patch } : process)));
  };

  const saveTechnicalSheet = async () => {
    await saveOrderTechnicalData(order.id, {
      technicalSheet,
      productionProcesses,
      qualityControl,
      changeNote,
    });
    setStatusMessage('Ficha tecnica guardada. Ya puedes imprimirla o descargarla.');
    setChangeNote('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Orden de produccion"
        title={`${order.number} - ${customer?.business ?? order.service}`}
        description={customer ? `${order.service}. Produccion para ${customer.business}.` : order.service}
        action={
          <Link to="/admin/ordenes" className="btn-secondary">
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Estado" value={<StatusBadge label={order.status} />} />
        <Metric label="Avance" value={`${order.progress}%`} />
        <Metric label="Promesa" value={shortDate(order.promiseDate)} />
        <Metric label="Prioridad" value={order.priority} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <SectionCard title="Resumen de produccion" description="Cliente, items, fechas, notas y archivos de trabajo.">
          <ShellTable columns={['Item', 'Servicio', 'Cantidad', 'Medidas']}>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-white">{item.description}</td>
                <td className="px-4 py-3 text-soft">{item.serviceId}</td>
                <td className="px-4 py-3 text-soft">{item.quantity}</td>
                <td className="px-4 py-3 text-soft">{item.measures}</td>
              </tr>
            ))}
          </ShellTable>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Info label="Responsable" value={order.owner} />
            <Info label="Inicio" value={shortDate(order.startDate)} />
            <Info label="Promesa" value={shortDate(order.promiseDate)} />
            <Info label="Servicio" value={order.service} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Note title="Notas tecnicas" value={order.technicalNotes || 'Sin notas tecnicas.'} />
            <Note title="Notas instalacion" value={order.installationNotes || 'Sin notas de instalacion.'} />
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Acciones" description="Control operativo y ficha tecnica del taller.">
            <div className="space-y-3">
              <button className="btn-primary w-full" onClick={() => void saveTechnicalSheet()}>
                <Save size={16} className="mr-2" />
                Guardar ficha tecnica
              </button>
              <Link className="btn-secondary w-full" to={technicalSheetUrl}>
                <Printer size={16} className="mr-2" />
                Generar / imprimir ficha
              </Link>
              {whatsappUrl ? (
                <a className="btn-secondary w-full" href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} className="mr-2" />
                  Enviar por WhatsApp
                </a>
              ) : null}
              <select
                className="field w-full"
                value={order.status}
                onChange={(event) => updateOrderStatus(order.id, event.target.value as Order['status'], order.progress)}
              >
                {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="label mb-3">Avance</p>
                <input
                  className="w-full"
                  type="range"
                  min={0}
                  max={100}
                  value={order.progress}
                  onChange={(event) => updateOrderStatus(order.id, order.status, Number(event.target.value))}
                />
              </div>
              <button className="btn-secondary w-full" onClick={() => setMaterialsOpen(true)}>
                <PackageCheck size={16} className="mr-2" />
                Asignar materiales
              </button>
              {quote && (
                <Link className="btn-secondary w-full" to={`/admin/cotizaciones/${quote.id}`}>
                  <FileText size={16} className="mr-2" />
                  Ver cotizacion
                </Link>
              )}
              {statusMessage && <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">{statusMessage}</p>}
            </div>
          </SectionCard>

          <SectionCard title="Cliente" description="Contexto comercial de la orden.">
            <div className="space-y-3">
              <Info label="Negocio" value={customer?.business ?? 'No encontrado'} />
              <Info label="Contacto" value={customer?.name ?? 'Por definir'} />
              <Info label="WhatsApp" value={customer?.whatsapp ?? 'Por definir'} />
              <Info label="Direccion" value={customer?.address ?? 'Por definir'} />
              {customer && <Link className="btn-secondary w-full" to={`/admin/clientes/${customer.id}`}>Ver cliente</Link>}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Ficha tecnica" description="Mapa de fabricacion. Sin esta ficha completa, no se fabrica.">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <div>
            <p className="font-semibold text-white">Protocolo anti-caos</p>
            <p className="text-sm text-soft">Medida confirmada, diseno aprobado, material definido, anticipo recibido y fecha acordada.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-white">
            <input type="checkbox" checked={technicalSheet.locked} onChange={(event) => updateSheet('locked', event.target.checked)} />
            <Lock size={15} /> Bloquear ficha
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Tipo de letrero" value={technicalSheet.tipoLetrero} onChange={(value) => updateSheet('tipoLetrero', value)} disabled={locked} />
          <Field label="Material principal" value={technicalSheet.materialPrincipal} onChange={(value) => updateSheet('materialPrincipal', value)} disabled={locked} />
          <Field label="Espesor" value={technicalSheet.espesorMaterial} onChange={(value) => updateSheet('espesorMaterial', value)} disabled={locked} />
          <Field label="Ancho" value={technicalSheet.ancho} onChange={(value) => updateSheet('ancho', value)} disabled={locked} />
          <Field label="Alto" value={technicalSheet.alto} onChange={(value) => updateSheet('alto', value)} disabled={locked} />
          <Field label="Profundidad" value={technicalSheet.profundidad} onChange={(value) => updateSheet('profundidad', value)} disabled={locked} />
          <Field label="Distancia de vision" value={technicalSheet.distanciaVision} onChange={(value) => updateSheet('distanciaVision', value)} disabled={locked} />
          <Field label="Iluminacion" value={technicalSheet.iluminacion} onChange={(value) => updateSheet('iluminacion', value)} disabled={locked} />
          <Field label="Color de luz" value={technicalSheet.colorLuz} onChange={(value) => updateSheet('colorLuz', value)} disabled={locked} />
          <Field label="Voltaje" value={technicalSheet.voltaje} onChange={(value) => updateSheet('voltaje', value)} disabled={locked} />
          <Field label="Fuente de poder" value={technicalSheet.fuentePoder} onChange={(value) => updateSheet('fuentePoder', value)} disabled={locked} />
          <Field label="Cableado" value={technicalSheet.cableado} onChange={(value) => updateSheet('cableado', value)} disabled={locked} />
          <Field label="Formato archivo" value={technicalSheet.formatoArchivo} onChange={(value) => updateSheet('formatoArchivo', value)} disabled={locked} />
          <Field label="Instalador" value={technicalSheet.instalador} onChange={(value) => updateSheet('instalador', value)} disabled={locked} />
          <Field label="Fecha instalacion" type="date" value={technicalSheet.fechaInstalacion} onChange={(value) => updateSheet('fechaInstalacion', value)} disabled={locked} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <CheckCard label="Archivo recibido" checked={technicalSheet.archivoRecibido} onChange={(value) => updateSheet('archivoRecibido', value)} disabled={locked} />
          <CheckCard label="Instalacion requerida" checked={technicalSheet.instalacionRequerida} onChange={(value) => updateSheet('instalacionRequerida', value)} disabled={locked} />
          <Info label="Monto / saldo" value={`${currency(technicalSheet.montoTotal)} / ${currency(technicalSheet.saldo)}`} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea label="Observaciones de diseno" value={technicalSheet.observacionesDiseno} onChange={(value) => updateSheet('observacionesDiseno', value)} disabled={locked} />
          <TextArea label="Observaciones tecnicas" value={technicalSheet.observacionesTecnicas} onChange={(value) => updateSheet('observacionesTecnicas', value)} disabled={locked} />
          <TextArea label="Direccion / notas de instalacion" value={technicalSheet.direccionInstalacion} onChange={(value) => updateSheet('direccionInstalacion', value)} disabled={locked} />
          <TextArea label="Notas generales" value={technicalSheet.notasGenerales} onChange={(value) => updateSheet('notasGenerales', value)} disabled={locked} />
        </div>
      </SectionCard>

      <SectionCard title="Proceso de produccion" description="Responsables, fechas y estado por etapa.">
        <div className="space-y-3">
          {productionProcesses.map((process) => (
            <div key={process.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1.2fr,1fr,0.8fr,0.8fr,0.9fr]">
              <Info label="Proceso" value={process.process} />
              <Field label="Responsable" value={process.responsible} onChange={(value) => updateProcess(process.id, { responsible: value })} disabled={locked} />
              <Field label="Inicio" type="date" value={process.startDate} onChange={(value) => updateProcess(process.id, { startDate: value })} disabled={locked} />
              <Field label="Fin" type="date" value={process.endDate} onChange={(value) => updateProcess(process.id, { endDate: value })} disabled={locked} />
              <label className="block">
                <span className="label mb-2 block">Estado</span>
                <select className="field w-full" value={process.status} disabled={locked} onChange={(event) => updateProcess(process.id, { status: event.target.value as ProductionProcessStatus })}>
                  {processStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <div className="lg:col-span-5">
                <TextArea label="Observaciones" value={process.observations} onChange={(value) => updateProcess(process.id, { observations: value })} disabled={locked} rows={2} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Control de calidad" description="Checklist obligatorio antes de entregar.">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {qualityLabels.map((item) => (
            <CheckCard
              key={item.key}
              label={item.label}
              checked={Boolean(qualityControl[item.key])}
              disabled={locked}
              onChange={(value) => setQualityControl({ ...qualityControl, [item.key]: value })}
            />
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Field label="Revisado por" value={qualityControl.revisadoPor} onChange={(value) => setQualityControl({ ...qualityControl, revisadoPor: value })} disabled={locked} />
          <Field label="Fecha revision" type="date" value={qualityControl.fechaRevision} onChange={(value) => setQualityControl({ ...qualityControl, fechaRevision: value })} disabled={locked} />
          <Field label="Estado pago" value={technicalSheet.estadoPago} onChange={(value) => updateSheet('estadoPago', value)} disabled={locked} />
        </div>
        <div className="mt-4">
          <TextArea label="Observaciones de calidad" value={qualityControl.observaciones} onChange={(value) => setQualityControl({ ...qualityControl, observaciones: value })} disabled={locked} />
        </div>
      </SectionCard>

      <SectionCard title="Materiales asignados" description="Material real reservado para esta orden.">
        <ShellTable columns={['Material', 'Codigo', 'Cantidad', 'Stock actual']}>
          {assignedMaterials.map((assigned) => {
            const material = materials.find((item) => item.id === assigned.materialId);
            return (
              <tr key={assigned.id}>
                <td className="px-4 py-3 text-white">{material?.name ?? assigned.materialId}</td>
                <td className="px-4 py-3 text-soft">{material?.code ?? 'N/A'}</td>
                <td className="px-4 py-3 text-soft">{assigned.quantity} {material?.unit ?? ''}</td>
                <td className="px-4 py-3 text-soft">{material?.stock ?? 0} {material?.unit ?? ''}</td>
              </tr>
            );
          })}
        </ShellTable>
      </SectionCard>

      <SectionCard title="Historial de cambios" description="Registro interno de decisiones y modificaciones importantes.">
        <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="space-y-3">
            <TextArea label="Nota del cambio" value={changeNote} onChange={setChangeNote} rows={3} />
            <button className="btn-primary" onClick={() => void saveTechnicalSheet()}>
              <Save size={16} className="mr-2" />
              Guardar cambio
            </button>
          </div>
          <div className="space-y-3">
            {(order.changeLog ?? []).slice(0, 8).map((change) => (
              <div key={change.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">{change.note}</p>
                <p className="mt-1 text-sm text-soft">{shortDate(change.createdAt)} - {change.author}</p>
              </div>
            ))}
            {(order.changeLog ?? []).length === 0 && <p className="text-sm text-soft">Sin cambios registrados todavia.</p>}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Actividad" description="Eventos relacionados al cliente.">
        <div className="space-y-3">
          {orderActivities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium text-white">{activity.description}</p>
              <p className="mt-1 text-sm text-soft">{shortDate(activity.createdAt)}</p>
            </div>
          ))}
          {orderActivities.length === 0 && <p className="text-sm text-soft">Sin actividad relacionada todavia.</p>}
        </div>
      </SectionCard>

      {materialsOpen && (
        <MaterialAssignModal
          assignedMaterials={assignedMaterials}
          onClose={() => setMaterialsOpen(false)}
          onSave={(items) => {
            assignMaterialsToOrder(order.id, items);
            setMaterialsOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MaterialAssignModal({
  assignedMaterials,
  onClose,
  onSave,
}: {
  assignedMaterials: Array<{ materialId: string; quantity: number }>;
  onClose: () => void;
  onSave: (items: Array<{ materialId: string; quantity: number }>) => void;
}) {
  const materials = useAppStore((state) => state.materials);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    assignedMaterials.forEach((item) => { map[item.materialId] = item.quantity; });
    return map;
  });

  const handleSave = () => {
    onSave(
      Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([materialId, quantity]) => ({ materialId, quantity })),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-3xl border border-white/10 bg-ink p-6">
        <h2 className="mb-2 text-xl font-bold text-white">Asignar materiales</h2>
        <p className="mb-6 text-sm text-soft">Estos materiales se descontaran del inventario cuando la orden pase a entregado.</p>
        <div className="mb-6 flex-grow space-y-4 overflow-y-auto pr-2">
          {materials.map((material) => (
            <div key={material.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-3">
              <div>
                <p className="font-medium text-white">{material.name}</p>
                <p className="text-xs text-soft">Stock: {material.stock} {material.unit}</p>
              </div>
              <input
                type="number"
                min="0"
                className="field w-24 py-1 text-right"
                value={quantities[material.id] || ''}
                onChange={(event) => setQuantities({ ...quantities, [material.id]: Number(event.target.value) })}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Guardar</button>
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
      <p className="whitespace-pre-wrap text-sm text-white">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      <input className="field w-full" type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange, disabled, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; rows?: number }) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      <textarea className="field w-full" rows={rows} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function CheckCard({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function Note({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink/60 p-5">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-soft">{value}</p>
    </div>
  );
}