import { useAppStore } from '../../store/useAppStore';
import { currency } from '../../lib/utils';

export function ServicesPage() {
  const services = useAppStore((state) => state.services);
  const categories = useAppStore((state) => state.serviceCategories);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-3xl">
        <p className="label mb-3">Servicios</p>
        <h1 className="text-4xl font-semibold text-white">Catálogo comercial preparado para ventas rápidas y producción clara.</h1>
        <p className="mt-4 text-soft">
          Cada servicio conserva categoría, precio base, requerimientos técnicos y materiales sugeridos para vender y ejecutar mejor.
        </p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="panel p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-soft">
              {categories.find((item) => item.id === service.categoryId)?.name}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{service.name}</h2>
            <p className="mt-3 text-sm leading-7 text-soft">{service.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {service.suggestedMaterials.map((material) => (
                <span key={material} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-soft">
                  {material}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-soft">Precio base</span>
              <span className="text-lg font-semibold text-white">{currency(service.basePrice)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
