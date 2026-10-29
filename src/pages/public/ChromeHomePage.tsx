import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Check, MessageCircle, MoveUpRight, PenTool, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGetPublicProducts } from '../../lib/api';
import { chromeCategories, chromePrice, chromeProductImage, chromeWhatsAppUrl, selectChromeProducts } from '../../lib/chromeCatalog';
import { defaultWebProducts } from '../../data/webContent';
import type { WebProduct } from '../../types/entities';

export function ChromeHomePage() {
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGetPublicProducts(true)
      .then(({ products: fetched }) => { if (active) setProducts(fetched); })
      .catch(() => { if (active) setProducts(defaultWebProducts); })
      .finally(() => { if (active) setProductsLoading(false); });
    return () => { active = false; };
  }, []);

  const highlights = useMemo(() => selectChromeProducts(products).slice(0, 4), [products]);

  return (
    <main className="ce-main">
      <section className="ce-hero" aria-labelledby="ce-hero-title">
        <div className="ce-hero-image" role="img" aria-label="Letrero circular luminoso de barbería instalado en una fachada" />
        <div className="ce-container ce-hero-content">
          <p className="ce-eyebrow"><span /> DISEÑO · FABRICACIÓN · INSTALACIÓN</p>
          <h1 id="ce-hero-title">LETREROS QUE HACEN <em>BRILLAR TU NEGOCIO</em></h1>
          <p className="ce-hero-description">Fabricamos ideas que destacan. Letreros luminosos, letras 3D, neón y soluciones visuales creadas para darle presencia a tu marca.</p>
          <div className="ce-hero-ctas">
            <Link className="ce-button ce-button-primary" to="/catalogo">Explorar catálogo <ArrowRight size={20} /></Link>
            <a className="ce-button ce-button-outline" href={chromeWhatsAppUrl()} target="_blank" rel="noreferrer"><MessageCircle size={20} /> Cotizar por WhatsApp</a>
          </div>
          <div className="ce-trust-row">
            <span><PenTool size={18} /> Diseño personalizado</span>
            <span><Truck size={19} /> En República Dominicana</span>
            <span><ShieldCheck size={19} /> Materiales de calidad</span>
          </div>
        </div>
        <div className="ce-hero-side-label">FABRICACIÓN CON IDENTIDAD <span>01 / KIKELED</span></div>
      </section>

      <section className="ce-section ce-categories" id="categorias" aria-labelledby="ce-categories-title">
        <div className="ce-container">
          <div className="ce-section-head"><div><p className="ce-section-kicker">LO QUE FABRICAMOS</p><h2 id="ce-categories-title">Encuentra el letrero ideal para tu negocio.</h2></div><Link className="ce-section-link" to="/catalogo">Ver todo el catálogo <ArrowRight size={18} /></Link></div>
          <div className="ce-category-grid">
            {chromeCategories.map((category) => (
              <Link className="ce-category-card" key={category.name} to={`/catalogo?buscar=${encodeURIComponent(category.search)}`}>
                <img src={category.image} alt={`Ejemplo conceptual de ${category.name.toLowerCase()}`} loading="lazy" />
                <span className="ce-category-gradient" />
                <span className="ce-category-content"><strong>{category.name}</strong><small>{category.subtitle}</small></span>
                <span className="ce-category-arrow"><MoveUpRight size={20} /></span>
              </Link>
            ))}
          </div>
          <p className="ce-image-note">Imágenes de inspiración visual. Consulta nuestra galería de trabajos reales y opciones de fabricación.</p>
        </div>
      </section>

      <section className="ce-section ce-featured" id="catalogo" aria-labelledby="ce-featured-title">
        <div className="ce-container">
          <div className="ce-section-head"><div><p className="ce-section-kicker">CATÁLOGO KIKELED</p><h2 id="ce-featured-title">Productos para hacer visible tu marca.</h2></div><Link className="ce-section-link" to="/catalogo">Explorar productos <ArrowRight size={18} /></Link></div>
          {highlights.length ? <div className="ce-featured-grid">
            {highlights.map((product) => (
              <article className="ce-product" key={product.id}>
                <Link className="ce-product-image" to={`/catalogo/${product.slug}`} aria-label={`Ver detalles de ${product.name}`}>
                  <img src={chromeProductImage(product)} alt={`Referencia visual de ${product.name}`} loading="lazy" />
                  <span className="ce-product-category">{product.category}</span>
                </Link>
                <div className="ce-product-details"><h3>{product.name}</h3><p>{product.shortDescription}</p><div className="ce-product-bottom"><strong>{chromePrice(product)}</strong><Link to={`/cotizar?producto=${encodeURIComponent(product.name)}`}>Personalizar <ArrowRight size={16} /></Link></div></div>
              </article>
            ))}
          </div> : <p className="ce-empty">{productsLoading ? 'Cargando productos…' : 'Pronto tendremos nuevos productos disponibles. Escríbenos para cotizar tu proyecto.'}</p>}
          <p className="ce-price-note">Precios de referencia sujetos a medidas, materiales e instalación. La cotización final se confirma por WhatsApp.</p>
        </div>
      </section>

      <section className="ce-drop" id="drops" aria-labelledby="ce-drop-title">
        <div className="ce-drop-image" role="img" aria-label="Neón Flex con motivos de hamburguesa y pizza" />
        <div className="ce-container ce-drop-inner"><div className="ce-drop-copy"><p className="ce-eyebrow"><span /> EDICIÓN ESPECIAL · COLECCIONES</p><h2 id="ce-drop-title">FAST FOOD NEON <em>— DROP 01</em></h2><p>Diseños de neón para hamburgueserías, pizzerías, food trucks y negocios con personalidad. Cuatro colecciones creadas para atraer miradas.</p><div className="ce-drop-landing-actions"><Link className="ce-button ce-button-amber" to="/drops/fast-food-neon">Explorar el drop <ArrowRight size={18} /></Link><a className="ce-button ce-button-outline" href={chromeWhatsAppUrl('la colección Fast Food Neon')} target="_blank" rel="noreferrer">Consultar por WhatsApp</a></div></div></div>
      </section>

      <section className="ce-section ce-custom" aria-labelledby="ce-custom-title">
        <div className="ce-container ce-custom-grid">
          <div><p className="ce-section-kicker">HECHO A TU MEDIDA</p><h2 id="ce-custom-title">Tu idea, tus medidas, nuestro taller.</h2><p>No tienes que encontrar un modelo idéntico. Envíanos tu logo, el tamaño aproximado y una referencia; te ayudamos a convertirlo en un letrero real.</p><div className="ce-custom-benefits"><span><Ruler size={18} /> Medidas personalizadas</span><span><BadgeCheck size={18} /> Asesoría en materiales</span><span><Check size={18} /> Acabados e iluminación</span></div><Link className="ce-button ce-button-primary" to="/cotizar">Personalizar y cotizar <ArrowRight size={18} /></Link></div>
          <div className="ce-custom-photo"><img src="/images/chrome/category-3d.webp" alt="Ejemplo conceptual de letras corpóreas con iluminación" loading="lazy" /><span>DEL DISEÑO A LA REALIDAD</span></div>
        </div>
      </section>

      <section className="ce-section ce-offers" id="ofertas"><div className="ce-container ce-offers-inner"><div><p className="ce-section-kicker">OPORTUNIDADES PARA TU MARCA</p><h2>Ofertas y paquetes especiales</h2><p>Consulta las promociones disponibles para tu tipo de negocio y encuentra una solución que se ajuste a tu proyecto.</p></div><a className="ce-button ce-button-outline" href={chromeWhatsAppUrl('las ofertas de letreros disponibles')} target="_blank" rel="noreferrer">Consultar ofertas <ArrowRight size={18} /></a></div></section>

      <section className="ce-section ce-business" id="business-360"><div className="ce-container ce-business-inner"><div className="ce-business-label">SERVICIO COMPLEMENTARIO / BUSINESS 360</div><div><h2>Todo lo que tu negocio necesita para destacar.</h2><p>Branding, página web, mini CRM y letreros interiores y exteriores en una solución integral, si deseas llevar tu marca al siguiente nivel.</p></div><Link className="ce-section-link" to="/cotizar?producto=Business%20360">Conocer Business 360 <ArrowRight size={19} /></Link></div></section>
    </main>
  );
}
