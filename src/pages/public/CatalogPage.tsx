import { Link } from 'react-router-dom';
import { products } from '../../lib/products';
import { currency } from '../../lib/utils';

export function CatalogPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="label mb-3">Catalogo Kikeled</p>
          <h1 className="text-4xl font-semibold text-white md:text-6xl">Productos base para cotizar letreros y piezas visuales.</h1>
          <p className="mt-5 text-sm leading-7 text-soft">
            Precios desde referenciales para levantar solicitudes. La cotizacion final depende de medidas, materiales, iluminacion, instalacion y urgencia.
          </p>
        </div>
        <Link to="/cotizar" className="btn-primary">
          Cotizar ahora
        </Link>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="flex min-h-[360px] flex-col rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100">{product.category}</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{product.name}</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-soft">Desde</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-soft">{product.description}</p>
            <div className="mt-5 grid gap-3 text-sm text-soft">
              <p><span className="text-white">Materiales:</span> {product.materials.join(', ')}</p>
              <p><span className="text-white">Medidas:</span> {product.measures}</p>
              <p><span className="text-white">Entrega:</span> {product.deliveryTime}</p>
            </div>
            <div className="mt-auto pt-6">
              <p className="text-2xl font-semibold text-white">{currency(product.priceFrom)}</p>
              <Link to={`/cotizar?producto=${product.id}`} className="btn-secondary mt-4 w-full">
                Quiero este producto
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
