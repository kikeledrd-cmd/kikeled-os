import { FormEvent, useMemo, useState } from 'react';
import { Check, Pencil, Plus, Save, X } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import type { Service } from '../../types/entities';

type ServiceDraft = Omit<Service, 'id' | 'suggestedMaterials'> & {
  suggestedMaterials: string;
};

function emptyDraft(categoryId: string): ServiceDraft {
  return {
    name: '',
    description: '',
    categoryId,
    basePrice: 0,
    calculationType: 'por proyecto',
    requiresMeasures: true,
    requiresDesign: true,
    requiresInstallation: false,
    requiresTransport: false,
    suggestedMaterials: '',
    isActive: true,
    image: 'custom-service',
  };
}

function serviceToDraft(service: Service): ServiceDraft {
  return {
    ...service,
    suggestedMaterials: service.suggestedMaterials.join(', '),
  };
}

function draftToService(draft: ServiceDraft): Omit<Service, 'id'> {
  return {
    ...draft,
    basePrice: Number(draft.basePrice) || 0,
    suggestedMaterials: draft.suggestedMaterials.split(',').map((item) => item.trim()).filter(Boolean),
  };
}

export function ServicesPage() {
  const {
    services,
    serviceCategories,
    addService,
    updateService,
    addServiceCategory,
  } = useAppStore((state) => state);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(() => emptyDraft(serviceCategories[0]?.id ?? 'cat-custom'));
  const [categoryName, setCategoryName] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const editingService = useMemo(
    () => services.find((service) => service.id === editingId) ?? null,
    [editingId, services],
  );

  function updateDraft<K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft(serviceCategories[0]?.id ?? 'cat-custom'));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.description.trim() || !draft.categoryId) return;

    if (editingId) {
      await updateService(editingId, draftToService(draft));
      setSavedMessage('Servicio actualizado.');
    } else {
      await addService(draftToService(draft));
      setSavedMessage('Servicio creado.');
      resetForm();
    }
    window.setTimeout(() => setSavedMessage(''), 1800);
  }

  async function handleAddCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = categoryName.trim();
    if (!cleanName) return;
    const id = await addServiceCategory({ name: cleanName });
    setCategoryName('');
    updateDraft('categoryId', id);
    setSavedMessage('Categoria creada.');
    window.setTimeout(() => setSavedMessage(''), 1800);
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setDraft(serviceToDraft(service));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Oferta comercial"
        title="Servicios"
        description="Crea y edita el catalogo operativo que alimenta ventas, cotizaciones, produccion y el motor de precios."
        action={savedMessage ? <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">{savedMessage}</span> : null}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-6">
          <SectionCard
            title={editingService ? `Editando: ${editingService.name}` : 'Nuevo servicio'}
            description="Define nombre, precio base, calculo, requisitos y materiales sugeridos."
          >
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input className="field" value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder="Nombre del servicio" required />
              <textarea className="field" rows={3} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} placeholder="Descripcion comercial y tecnica" required />
              <div className="grid gap-3 md:grid-cols-2">
                <select className="field" value={draft.categoryId} onChange={(event) => updateDraft('categoryId', event.target.value)} required>
                  {serviceCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <input className="field" type="number" min={0} step={50} value={draft.basePrice} onChange={(event) => updateDraft('basePrice', Number(event.target.value))} placeholder="Precio base RD$" required />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select className="field" value={draft.calculationType} onChange={(event) => updateDraft('calculationType', event.target.value)}>
                  <option value="por proyecto">por proyecto</option>
                  <option value="por tamaño">por tamano</option>
                  <option value="por área">por area</option>
                  <option value="por unidad">por unidad</option>
                  <option value="manual">manual</option>
                </select>
                <input className="field" value={draft.image} onChange={(event) => updateDraft('image', event.target.value)} placeholder="Clave visual / imagen" />
              </div>
              <input className="field" value={draft.suggestedMaterials} onChange={(event) => updateDraft('suggestedMaterials', event.target.value)} placeholder="Materiales sugeridos separados por coma" />
              <div className="grid gap-3 md:grid-cols-2">
                <Toggle label="Requiere medidas" checked={draft.requiresMeasures} onChange={(value) => updateDraft('requiresMeasures', value)} />
                <Toggle label="Requiere diseno" checked={draft.requiresDesign} onChange={(value) => updateDraft('requiresDesign', value)} />
                <Toggle label="Requiere instalacion" checked={draft.requiresInstallation} onChange={(value) => updateDraft('requiresInstallation', value)} />
                <Toggle label="Requiere transporte" checked={draft.requiresTransport} onChange={(value) => updateDraft('requiresTransport', value)} />
                <Toggle label="Activo para ventas" checked={draft.isActive} onChange={(value) => updateDraft('isActive', value)} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" type="submit">
                  <Save size={16} className="mr-2" />
                  {editingId ? 'Guardar cambios' : 'Crear servicio'}
                </button>
                {editingId ? (
                  <button className="btn-secondary" type="button" onClick={resetForm}>
                    <X size={16} className="mr-2" />
                    Cancelar edicion
                  </button>
                ) : null}
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Nueva categoria" description="Agrega familias para agrupar servicios y aplicar multiplicadores en precios.">
            <form onSubmit={handleAddCategory} className="flex flex-col gap-3 sm:flex-row">
              <input className="field" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Ej: rotulacion vehicular" />
              <button className="btn-secondary shrink-0" type="submit">
                <Plus size={16} className="mr-2" />
                Agregar
              </button>
            </form>
          </SectionCard>
        </div>

        <SectionCard title="Catalogo actual" description="Selecciona cualquier servicio para editar todos sus detalles.">
          <div className="grid gap-4">
            {services.map((service) => {
              const category = serviceCategories.find((item) => item.id === service.categoryId);
              return (
                <article key={service.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                        <StatusBadge label={service.isActive ? 'activo' : 'inactivo'} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-soft">{service.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary" type="button" onClick={() => startEdit(service)}>
                        <Pencil size={15} className="mr-2" />
                        Editar
                      </button>
                      <button className="btn-ghost" type="button" onClick={() => void updateService(service.id, { isActive: !service.isActive })}>
                        {service.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-soft md:grid-cols-3">
                    <Info label="Categoria" value={category?.name ?? 'Sin categoria'} />
                    <Info label="Precio base" value={currency(service.basePrice)} />
                    <Info label="Calculo" value={service.calculationType} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.suggestedMaterials.map((material) => (
                      <span key={material} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-soft">
                        {material}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-soft">
                    <Requirement enabled={service.requiresMeasures} label="medidas" />
                    <Requirement enabled={service.requiresDesign} label="diseno" />
                    <Requirement enabled={service.requiresInstallation} label="instalacion" />
                    <Requirement enabled={service.requiresTransport} label="transporte" />
                  </div>
                </article>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="label mb-1">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  );
}

function Requirement({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${enabled ? 'border-lime-300/30 bg-lime-300/10 text-lime-100' : 'border-white/10 bg-white/5 text-soft'}`}>
      {enabled ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  );
}
