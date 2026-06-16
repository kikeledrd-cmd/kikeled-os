import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowLeft, FileText, PackageCheck, Printer } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { shortDate } from '../../lib/utils';
import { Order } from '../../types/entities';
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

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const {
    orders,
    customers,
    quotes,
    invoices,
    materials,
    orderMaterials,
    activities,
    updateOrderStatus,
    assignMaterialsToOrder,
  } = useAppStore((state) => state);

  const order = orders.find((item) => item.id === orderId);

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

  const customer = customers.find((item) => item.id === order.customerId);
  const quote = order.quoteId ? quotes.find((item) => item.id === order.quoteId) : null;
  const invoice = invoices.find((item) => item.orderId === order.id || item.quoteId === order.quoteId);
  const assignedMaterials = orderMaterials.filter((item) => item.orderId === order.id);
  const orderActivities = activities.filter((activity) => activity.customerId === order.customerId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de orden"
        title={order.number}
        description={customer ? `Produccion para ${customer.business}.` : order.service}
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
        <SectionCard title="Produccion" description="Items, fechas, notas tecnicas y archivos de trabajo.">
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
            <Note title="Notas tecnicas" value={order.technicalNotes} />
            <Note title="Notas instalacion" value={order.installationNotes || 'Sin notas de instalacion.'} />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">Archivos de referencia</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {order.referenceFiles.map((file) => (
                <span key={file} className="rounded-full border border-white/10 bg-ink/60 px-3 py-1 text-xs text-soft">{file}</span>
              ))}
              {order.referenceFiles.length === 0 && <p className="text-sm text-soft">Sin archivos registrados.</p>}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Acciones" description="Control de produccion, avance e inventario.">
            <div className="space-y-3">
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
              <button className="btn-primary w-full" onClick={() => setMaterialsOpen(true)}>
                <PackageCheck size={16} className="mr-2" />
                Asignar materiales
              </button>
              <Link className="btn-secondary w-full" to={`/admin/ordenes/${order.id}/imprimir`}>
                <Printer size={16} className="mr-2" />
                Imprimir orden
              </Link>
              {quote && (
                <Link className="btn-secondary w-full" to={`/admin/cotizaciones/${quote.id}`}>
                  <FileText size={16} className="mr-2" />
                  Ver cotizacion
                </Link>
              )}
              {invoice && (
                <Link className="btn-secondary w-full" to={`/admin/facturacion/${invoice.id}`}>
                  Ver factura
                </Link>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Cliente" description="Contexto comercial de la orden.">
            <div className="space-y-3">
              <Info label="Negocio" value={customer?.business ?? 'No encontrado'} />
              <Info label="Contacto" value={customer?.name ?? 'Por definir'} />
              <Info label="WhatsApp" value={customer?.whatsapp ?? 'Por definir'} />
              {customer && <Link className="btn-secondary w-full" to={`/admin/clientes/${customer.id}`}>Ver cliente</Link>}
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
        </div>
      </div>

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

      {materialsOpen && (
        <MaterialAssignModal
          orderId={order.id}
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
  orderId: string;
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
      <p className="text-sm text-white">{value}</p>
    </div>
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
