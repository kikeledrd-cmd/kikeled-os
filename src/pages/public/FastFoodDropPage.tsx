import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChefHat, MessageCircle, Search, Sparkles } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { defaultWebProducts } from '../../data/webContent';
import { apiGetPublicProducts } from '../../lib/api';
import { chromePrice, chromeProductImage } from '../../lib/chromeCatalog';
import { fastFoodCollectionForProduct, fastFoodCollections, fastFoodDropWhatsAppUrl, fastFoodPublishedCountLabel, selectFastFoodDropProducts } from '../../lib/fastFoodDrop';
import type { WebProduct } from '../../types/entities';

export function FastFoodDropPage() {
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const collectionId = searchParams.get('coleccion') ?? '';
  const query = searchParams.get('buscar') ?? '';
  const selectedCollection = fastFoodCollections.find((item) => item.id === collectionId);
  const validCollectionId = selectedCollection?.id ?? '';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    apiGetPublicProducts()
      .then(({ products: fetched }) => { if (active) setProducts(fetched); })
      .catch(() => { if (active) { setProducts([]); setLoadError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadAttempt]);

  const visible = useMemo(() => selectFastFoodDropProducts(products, validCollectionId, query), [products, validCollectionId, query]);
  const publishedCount = useMemo(() => selectFastFoodDropProducts(products).length, [products]);
  const collectionCount = useMemo(() => selectFastFoodDropProducts(products, validCollectionId).length, [products, validCollectionId]);
  const productReturnUrl = `${location.pathname}${location.search}${location.hash}`;

  function updateSearchParam(key: 'coleccion' | 'buscar', value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: key === 'buscar' });
  }

  return (
    <main className="ce-drop-page">
      <section className="ce-drop-landing" aria-labelledby="ce-drop-main-title">
        <div className="ce-drop-landing-image" aria-hidden="true" />
        <div className="ce-container ce-drop-landing-content">
          <p className="ce-eyebrow"><span /> KIKELED COLLECTIONS / DROP 01</p>
          <div className="ce-drop-serial">01 <small>/ 04 COLECCIONES</small></div>
          <h1 id="ce-drop-main-title">FAST FOOD <em>NEON.</em></h1>
          <p>El neón también se saborea. Descubre nuestras colecciones de diseños luminosos para restaurantes, cafeterías, food trucks y negocios con personalidad.</p>
          <div className="ce-drop-landing-actions"><a className="ce-button ce-button-primary" href="#colecciones">Explorar colecciones <ArrowRight size={18} /></a><a className="ce-button ce-button-outline" href={fastFoodDropWhatsAppUrl()} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Consultar por WhatsApp</a></div>
        </div>
      </section>

      <section className="ce-section ce-drop-collections" id="colecciones" aria-labelledby="ce-drop-collections-title">
        <div className="ce-container">
          <div className="ce-section-head"><div><p className="ce-section-kicker">CUATRO FORMAS DE BRILLAR</p><h2 id="ce-drop-collections-title">Elige tu colección.</h2></div><p className="ce-drop-section-intro">Cada línea está pensada para un tipo de negocio. Escoge el estilo que represente tu marca.</p></div>
          <div className="ce-drop-collection-grid">
            {fastFoodCollections.map((collection, index) => (
              <Link className="ce-drop-collection-card" to={`/drops/fast-food-neon?coleccion=${collection.id}#modelos`} key={collection.id}>
                <img src={collection.image} alt={`Imagen conceptual de ${collection.name}`} loading="lazy" />
                <span className="ce-drop-collection-shade" />
                <span className="ce-drop-collection-number">0{index + 1} / 04</span>
                <span className="ce-drop-collection-copy"><small>{collection.label}</small><strong>{collection.name}</strong><span>{collection.description}</span><b>Explorar modelos <ArrowUpRight size={17} /></b></span>
              </Link>
            ))}
          </div>
          <p className="ce-image-note">Las portadas son referencias visuales. Cada diseño final tendrá sus fotografías propias cuando sea publicado.</p>
        </div>
      </section>

      <section className="ce-section ce-drop-models" id="modelos" aria-labelledby="ce-drop-models-title">
        <div className="ce-container">
          <div className="ce-section-head"><div><p className="ce-section-kicker">CATÁLOGO DEL DROP</p><h2 id="ce-drop-models-title">{selectedCollection ? selectedCollection.name : 'Explora los modelos.'}</h2></div><span className="ce-drop-model-count">{loading ? 'Cargando modelos…' : loadError ? 'Catálogo temporalmente no disponible' : fastFoodPublishedCountLabel(publishedCount, collectionCount, visible.length, selectedCollection?.name ?? '', query)}</span></div>
          <div className="ce-drop-toolbar">
            <div className="ce-drop-collection-filters" role="group" aria-label="Filtrar por colección">
              <button type="button" className={!validCollectionId ? 'is-active' : ''} aria-pressed={!validCollectionId} onClick={() => updateSearchParam('coleccion', '')}>Todos</button>
              {fastFoodCollections.map((item) => <button type="button" key={item.id} className={item.id === collectionId ? 'is-active' : ''} aria-pressed={item.id === collectionId} onClick={() => updateSearchParam('coleccion', item.id)}>{item.name}</button>)}
            </div>
            <label className="ce-drop-search"><Search size={17} aria-hidden="true" /><span className="ce-sr-only">Buscar modelos del drop</span><input type="search" placeholder="Buscar un diseño…" value={query} onChange={(event) => updateSearchParam('buscar', event.target.value)} /></label>
          </div>

          {loadError ? <div className="ce-drop-empty" role="alert"><div className="ce-drop-empty-icon"><ChefHat size={35} /></div><h3>No pudimos cargar los modelos.</h3><p>La conexión con el catálogo está temporalmente interrumpida. Tus diseños no se han eliminado; puedes volver a intentarlo.</p><div className="ce-drop-empty-actions"><button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Reintentar carga</button><a href={fastFoodDropWhatsAppUrl(selectedCollection?.name)} target="_blank" rel="noreferrer">Consultar por WhatsApp <ArrowRight size={18} /></a></div></div> : visible.length ? <div className="ce-drop-product-grid">
            {visible.map((product) => (
              <article className="ce-drop-product" key={product.id}>
                <Link className="ce-drop-product-image" to={`/catalogo/${product.slug}`} state={{ from: productReturnUrl }} aria-label={`Ver ficha de ${product.name}`}><img src={chromeProductImage(product)} alt={`Foto o referencia de ${product.name}`} loading="lazy" /><span>{fastFoodCollectionForProduct(product)?.name ?? 'Fast Food Neon'}</span></Link>
                <div className="ce-drop-product-content"><h3><Link to={`/catalogo/${product.slug}`} state={{ from: productReturnUrl }}>{product.name}</Link></h3><p>{product.shortDescription}</p><div className="ce-drop-product-price"><strong>{chromePrice(product)}</strong><Link to={`/catalogo/${product.slug}`} state={{ from: productReturnUrl }}>Ver ficha <ArrowRight size={17} /></Link></div><div className="ce-drop-product-actions"><Link to={`/cotizar?producto=${encodeURIComponent(product.name)}`}>Personalizar</Link><a href={fastFoodDropWhatsAppUrl(fastFoodCollectionForProduct(product)?.name, product.name)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a></div></div>
              </article>
            ))}
          </div> : <div className="ce-drop-empty"><div className="ce-drop-empty-icon"><ChefHat size={35} /></div><h3>{loading ? 'Cargando los diseños del drop…' : query ? 'No encontramos ese diseño.' : 'Esta colección se está preparando.'}</h3><p>{loading ? 'Consultando el catálogo actualizado.' : query ? 'Prueba otro nombre o consulta directamente por WhatsApp.' : 'Estamos preparando las fichas con fotos y especificaciones de cada modelo. Mientras tanto puedes consultar las opciones disponibles.'}</p><div className="ce-drop-empty-actions">{(query || collectionId) && <button type="button" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>Ver todas las colecciones</button>}<a href={fastFoodDropWhatsAppUrl(selectedCollection?.name)} target="_blank" rel="noreferrer">Consultar por WhatsApp <ArrowRight size={18} /></a></div></div>}
          <p className="ce-price-note">Cada modelo publicado permite solicitar medidas y acabados personalizados. Los precios definitivos se confirman por WhatsApp.</p>
        </div>
      </section>

      <section className="ce-drop-bottom"><div className="ce-container ce-drop-bottom-inner"><Sparkles size={40} /><div><p className="ce-section-kicker">TU NEGOCIO, TU ESTILO</p><h2>¿Tienes una idea diferente?</h2><p>Diseñamos piezas a medida a partir de tu logo, referencias y dimensiones.</p></div><Link className="ce-button ce-button-primary" to="/cotizar?producto=Ne%C3%B3n%20flex">Personalizar mi letrero <ArrowRight size={18} /></Link></div></section>
    </main>
  );
}
