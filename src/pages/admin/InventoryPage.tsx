import { FormEvent } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import { useAppStore } from '../../store/useAppStore';

export function InventoryPage() {
  const { materials, addMaterial, addInventoryMovement } = useAppStore((state) => state);

  function handleMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addMaterial({
      name: String(formData.get('name')),
      category: String(formData.get('category')),
      unit: String(formData.get('unit')),
      stock: Number(formData.get('stock')),
      minStock: Number(formData.get('minStock')),
      unitCost: Number(formData.get('unitCost')),
      supplier: String(formData.get('supplier')),
      code: String(formData.get('code')),
      location: String(formData.get('location')),
      notes: String(formData.get('notes')),
    });
    event.currentTarget.reset();
  }

  function handleMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addInventoryMovement({
      materialId: String(formData.get('materialId')),
      type: String(formData.get('type')) as 'entrada' | 'salida',
      quantity: Number(formData.get('quantity')),
      reason: String(formData.get('reason')),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Materiales" title="Inventario" description="Controla stock, alertas y movimientos vinculados a órdenes del taller." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard title="Materiales demo y reales" description="Incluye alertas de stock bajo.">
          <ShellTable columns={['Material', 'Categoría', 'Stock', 'Mínimo', 'Ubicación']}>
            {materials.map((material) => (
              <tr key={material.id}>
                <td className="px-4 py-3 text-white">{material.name}</td>
                <td className="px-4 py-3 text-soft">{material.category}</td>
                <td className="px-4 py-3 text-soft">{material.stock}</td>
                <td className="px-4 py-3 text-soft">{material.minStock}</td>
                <td className="px-4 py-3 text-soft">{material.location}</td>
              </tr>
            ))}
          </ShellTable>
        </SectionCard>
        <div className="space-y-6">
          <SectionCard title="Crear material" description="Alta rápida de insumos nuevos.">
            <form onSubmit={handleMaterial} className="grid gap-3">
              <input name="name" className="field" placeholder="Nombre" required />
              <input name="category" className="field" placeholder="Categoría" required />
              <input name="unit" className="field" placeholder="Unidad" required />
              <input name="stock" className="field" type="number" placeholder="Stock actual" required />
              <input name="minStock" className="field" type="number" placeholder="Stock mínimo" required />
              <input name="unitCost" className="field" type="number" placeholder="Costo unitario" required />
              <input name="supplier" className="field" placeholder="Proveedor" required />
              <input name="code" className="field" placeholder="Código interno" required />
              <input name="location" className="field" placeholder="Ubicación" required />
              <textarea name="notes" className="field" rows={2} placeholder="Observaciones" />
              <button className="btn-primary" type="submit">Guardar material</button>
            </form>
          </SectionCard>
          <SectionCard title="Registrar movimiento" description="Entradas y salidas persistentes.">
            <form onSubmit={handleMovement} className="grid gap-3">
              <select name="materialId" className="field" defaultValue={materials[0]?.id}>{materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select>
              <select name="type" className="field" defaultValue="entrada"><option value="entrada">entrada</option><option value="salida">salida</option></select>
              <input name="quantity" className="field" type="number" placeholder="Cantidad" required />
              <textarea name="reason" className="field" rows={2} placeholder="Motivo" required />
              <button className="btn-secondary" type="submit">Aplicar movimiento</button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
