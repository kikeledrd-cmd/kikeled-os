import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { defaultWebProducts } from '../../data/webContent';
import { apiGetPublicProducts } from '../../lib/api';
import { currency } from '../../lib/utils';
import type { WebProduct } from '../../types/entities';

export function CatalogPage() {
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts);

  useEffect(() => {
    let active = true;
    apiGetPublicProducts()
      .then((response) => {
        if (active && response.products.length) setProducts(response.products);
      })
      .catch(() => {
        if (active) setProducts(defaultWebProducts);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive);
    return (activeProducts.length ? activeProducts : defaultWebProducts.filter((product) => product.isActive)).sort((a, b) => a.order - b.order);
  }, [products]);

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
        {visibleProducts.map((product) => (
          <article key={product.id} className="k-public-product-card flex min-h-[420px] flex-col rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <div className="k-product-media mb-5 h-40 rounded-[1rem]">
              {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} loading="lazy" /> : null}
              <span>{product.category}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100">{product.category}</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{product.name}</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-soft">Desde</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-soft">{product.description || product.shortDescription}</p>
            <div className="mt-5 grid gap-3 text-sm text-soft">
              {product.materials?.length ? <p><span className="text-white">Materiales:</span> {product.materials.join(', ')}</p> : null}
              {product.details?.length ? <p><span className="text-white">Detalles:</span> {product.details.join(', ')}</p> : null}
              {product.deliveryTime ? <p><span className="text-white">Entrega:</span> {product.deliveryTime}</p> : null}
            </div>
            <div className="mt-auto pt-6">
              <p className="text-2xl font-semibold text-white">
                {currency(product.priceFrom)} {product.priceUnit ? <span className="text-sm font-normal text-soft">/ {product.priceUnit}</span> : null}
              </p>
              <Link to={`/cotizar?producto=${encodeURIComponent(product.name)}`} className="btn-secondary mt-4 w-full">
                {product.ctaLabel || 'Quiero este producto'}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
