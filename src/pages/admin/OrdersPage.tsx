import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAppStore } from '../../store/useAppStore';

const orderStatuses = ['pendiente', 'diseño', 'corte', 'impresión', 'ensamblaje', 'listo para instalar', 'instalación', 'entregado', 'cerrado'] as const;

function MaterialAssignModal({ orderId, onClose }: { orderId: string, onClose: () => void }) {
  const { materials, orderMaterials, assignMaterialsToOrder } = useAppStore(state => state);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const existing = orderMaterials.filter(om => om.orderId === orderId);
    const map: Record<string, number> = {};
    existing.forEach(om => { map[om.materialId] = om.quantity; });
    return map;
  });

  const handleSave = () => {
    const toAssign = Object.entries(quantities)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => ({ materialId: id, quantity: q }));
    assignMaterialsToOrder(orderId, toAssign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-ink border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4">Asignar Materiales Reales</h2>
        <p className="text-sm text-soft mb-6">Indica qué materiales se están usando en esta orden. Se descontarán del inventario automáticamente cuando la orden cambie a "entregado".</p>
        
        <div className="space-y-4 mb-6 overflow-y-auto flex-grow pr-2">
          {materials.map(mat => (
            <div key={mat.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <div>
                <p className="text-white font-medium">{mat.name}</p>
                <p className="text-xs text-soft">Stock actual: {mat.stock} {mat.unit}</p>
              </div>
              <input 
                type="number" 
                min="0"
                className="field w-24 text-right py-1" 
                value={quantities[mat.id] || ''}
                onChange={e => setQuantities({...quantities, [mat.id]: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
          ))}
          {materials.length === 0 && <p className="text-center text-soft py-4">No hay materiales registrados en el inventario.</p>}
        </div>
        
        <div className="flex gap-3 justify-end mt-auto pt-4 border-t border-white/10">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Guardar Asignación</button>
        </div>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { orders, customers, updateOrderStatus, orderMaterials } = useAppStore((state) => state);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Taller y campo" title="Órdenes de Trabajo" description="Sigue producción real con estado, avance, notas técnicas y materiales asociados." />
      <SectionCard title="Módulo operativo" description="Actualiza estado y progreso sin perder trazabilidad.">
        <ShellTable columns={['Orden', 'Cliente', 'Servicio', 'Estado', 'Avance', 'Materiales', 'Checklist']}>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3">
                <Link to={`/admin/ordenes/${order.id}`} className="font-medium text-white transition hover:text-cyan-100">
                  {order.number}
                </Link>
              </td>
              <td className="px-4 py-3 text-soft">{customers.find((item) => item.id === order.customerId)?.business}</td>
              <td className="px-4 py-3 text-soft">{order.service}</td>
              <td className="px-4 py-3"><StatusBadge label={order.status} /></td>
              <td className="px-4 py-3 text-soft">{order.progress}%</td>
              <td className="px-4 py-3">
                <button className="btn-ghost text-xs px-3 py-1" onClick={() => setActiveOrderId(order.id)}>
                  Asignar ({orderMaterials.filter(om => om.orderId === order.id).length})
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <Link className="btn-ghost text-center" to={`/admin/ordenes/${order.id}`}>Ver detalle</Link>
                  <Link className="btn-ghost text-center" to={`/admin/ordenes/${order.id}/imprimir`}>Imprimir</Link>
                  <select className="field py-2" value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as typeof order.status, order.progress)}>
                    {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <input className="field py-2" type="range" min={0} max={100} value={order.progress} onChange={(event) => updateOrderStatus(order.id, order.status, Number(event.target.value))} />
                </div>
              </td>
            </tr>
          ))}
        </ShellTable>
      </SectionCard>

      {activeOrderId && <MaterialAssignModal orderId={activeOrderId} onClose={() => setActiveOrderId(null)} />}
    </div>
  );
}
