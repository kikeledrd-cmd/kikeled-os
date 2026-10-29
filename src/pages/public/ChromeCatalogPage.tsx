import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Filter, MessageCircle, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { apiGetPublicProducts } from '../../lib/api';
import { chromePrice, chromeProductImage, chromeWhatsAppUrl, selectChromeProducts } from '../../lib/chromeCatalog';
import { defaultWebProducts } from '../../data/webContent';
import type { WebProduct } from '../../types/entities';

export function ChromeCatalogPage() {
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const productReturnUrl = `${location.pathname}${location.search}`;
  const query = searchParams.get('buscar') ?? '';
  const category = searchParams.get('categoria') ?? '';

  useEffect(() => {
    let active = true;
    apiGetPublicProducts()
      .then(({ products: fetched }) => { if (active) setProducts(fetched); })
      .catch(() => { if (active) setProducts(defaultWebProducts); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.filter((item) => item.isActive).map((item) => item.category))).sort(), [products]);
  const visible = useMemo(() => selectChromeProducts(products, query, category), [products, query, category]);

  function setCategory(nextCategory: string) {
    const next = new URLSearchParams(searchParams);
    if (nextCategory) next.set('categoria', nextCategory);
    else next.delete('categoria');
    setSearchParams(next);
  }

  function setQuery(nextQuery: string) {
    const next = new URLSearchParams(searchParams);
    if (nextQuery) next.set('buscar', nextQuery);
    else next.delete('buscar');
    setSearchParams(next, { replace: true });
  }

  return (
    <main className="ce-catalog-page">
      <section className="ce-catalog-header"><div className="ce-container"><p className="ce-section-kicker">EL CATÁLOGO / KIKELED LETREROS</p><h1>Tu próximo letrero comienza aquí.</h1><p>Explora nuestras soluciones de fabricación, descubre materiales y encuentra una idea que puedas personalizar para tu negocio.</p></div></section>

      <section className="ce-container ce-catalog-body" aria-label="Explorar productos">
        <div className="ce-catalog-tools">
          <label className="ce-search-box"><Search size={19} /><span className="ce-sr-only">Buscar letreros</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar letreros, materiales o categorías…" /></label>
          <span className="ce-filter-label"><SlidersHorizontal size={17} /> Filtrar por categoría</span>
        </div>
        <div className="ce-filters" role="group" aria-label="Categorías de productos">
          <button type="button" className={!category ? 'is-active' : ''} aria-pressed={!category} onClick={() => setCategory('')}>Todos</button>
          {categories.map((item) => <button key={item} type="button" className={item === category ? 'is-active' : ''} aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="ce-catalog-count"><span><Filter size={15} /> {loading && !products.length ? 'Cargando productos…' : `${visible.length} ${visible.length === 1 ? 'producto' : 'productos'}`}</span><small>Fabricación y personalización bajo cotización</small></div>

        {visible.length ? <div className="ce-catalog-grid">
          {visible.map((product) => (
            <article className="ce-product ce-catalog-product" key={product.id}>
              <Link className="ce-product-image" to={`/catalogo/${product.slug}`} state={{ from: productReturnUrl }} aria-label={`Ver detalles de ${product.name}`}>
                <img src={chromeProductImage(product)} alt={`Referencia de ${product.name}`} loading="lazy" />
                <span className="ce-product-category">{product.category}</span>
              </Link>
              <div className="ce-product-details"><h2><Link to={`/catalogo/${product.slug}`} state={{ from: productReturnUrl }}>{product.name}</Link></h2><p>{product.shortDescription}</p><div className="ce-product-facts">{product.materials?.slice(0, 3).map((material) => <span key={material}>{material}</span>)}</div><strong className="ce-catalog-price">{chromePrice(product)}</strong><div className="ce-catalog-actions"><Link to={`/cotizar?producto=${encodeURIComponent(product.name)}`}>Personalizar <ArrowRight size={16} /></Link><a href={chromeWhatsAppUrl(product.name)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a></div></div>
            </article>
          ))}
        </div> : <div className="ce-empty-state"><h2>No encontramos productos con esos filtros.</h2><p>Prueba otra categoría o escríbenos para una fabricación personalizada.</p><button type="button" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>Limpiar filtros</button></div>}
        <p className="ce-price-note">Las imágenes de referencia son conceptuales donde aún no hay fotografías reales publicadas. Los precios finales dependen de las especificaciones del proyecto.</p>
      </section>
    </main>
  );
}
