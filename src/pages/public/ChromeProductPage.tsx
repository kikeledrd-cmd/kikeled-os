import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MessageCircle, Ruler, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { apiGetPublicProducts } from '../../lib/api';
import { chromePrice, chromeProductGallery, chromeWhatsAppUrl } from '../../lib/chromeCatalog';
import { defaultWebProducts } from '../../data/webContent';
import type { WebProduct } from '../../types/entities';

export function ChromeProductPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    let active = true;
    apiGetPublicProducts()
      .then(({ products: responseProducts }) => { if (active) setProducts(responseProducts); })
      .catch(() => { if (active) setProducts(defaultWebProducts); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => { setSelectedPhoto(0); }, [slug]);

  const product = useMemo(() => products.find((item) => item.isActive && item.slug === slug), [products, slug]);
  const photos = product ? chromeProductGallery(product) : [];

  if (!product) {
    return <main className="ce-detail-missing ce-container"><p className="ce-section-kicker">CATÁLOGO KIKELED</p><h1>{loading ? 'Cargando ficha del producto…' : 'Producto no disponible'}</h1><p>{loading ? 'Estamos consultando el catálogo actualizado.' : 'Este modelo puede haber cambiado o ya no estar publicado.'}</p><Link className="ce-button ce-button-primary" to="/catalogo">Volver al catálogo <ArrowRight size={18} /></Link></main>;
  }

  return (
    <main className="ce-detail-page">
      <div className="ce-container ce-detail-toplink"><Link to="/catalogo"><ArrowLeft size={16} /> Volver al catálogo</Link><span>CATÁLOGO / {product.category.toUpperCase()}</span></div>
      <section className="ce-container ce-detail-grid" aria-label={`Ficha de ${product.name}`}>
        <div className="ce-detail-gallery">
          <div className="ce-detail-main-photo"><img src={photos[selectedPhoto] ?? photos[0]} alt={`Foto o referencia de ${product.name}`} /><span>{product.category}</span></div>
          {photos.length > 1 && <div className="ce-detail-thumbnails" aria-label="Fotografías del producto">{photos.map((url, index) => <button key={url} type="button" className={selectedPhoto === index ? 'is-active' : ''} aria-label={`Ver foto ${index + 1}`} aria-pressed={selectedPhoto === index} onClick={() => setSelectedPhoto(index)}><img src={url} alt="" loading="lazy" /></button>)}</div>}
          <p className="ce-image-note">Las imágenes pueden ser referencias conceptuales; las fotos reales se muestran cuando están disponibles.</p>
        </div>
        <div className="ce-detail-info">
          <p className="ce-section-kicker">HECHO PARA TU NEGOCIO</p>
          <h1>{product.name}</h1>
          <p className="ce-detail-lead">{product.description || product.shortDescription}</p>
          <div className="ce-detail-price"><span>PRECIO DE REFERENCIA</span><strong>{chromePrice(product)}</strong><small>El precio final depende de medidas, materiales, acabados e instalación.</small></div>
          {product.materials?.length ? <div className="ce-detail-spec"><h2>Materiales disponibles</h2><div className="ce-detail-pills">{product.materials.map((material) => <span key={material}>{material}</span>)}</div></div> : null}
          {product.sizes?.length ? <div className="ce-detail-spec"><h2>Medidas y formatos</h2><div className="ce-detail-pills">{product.sizes.map((size) => <span key={size}>{size}</span>)}</div></div> : null}
          {product.deliveryTime && <p className="ce-detail-delivery"><Check size={17} /> Tiempo estimado de fabricación: {product.deliveryTime}</p>}
          <div className="ce-detail-actions"><Link className="ce-button ce-button-primary" to={`/cotizar?producto=${encodeURIComponent(product.name)}`}><Ruler size={19} /> Personalizar y cotizar <ArrowRight size={18} /></Link><a className="ce-button ce-button-outline" href={chromeWhatsAppUrl(product.name)} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Consultar por WhatsApp</a></div>
          <p className="ce-detail-hint">Envíanos las medidas, tu logo o una referencia y te preparamos una propuesta personalizada.</p>
        </div>
      </section>
      <section className="ce-detail-more"><div className="ce-container ce-detail-more-inner"><div><p className="ce-section-kicker">¿QUIERES ALGO ÚNICO?</p><h2>Tu marca merece un letrero que se sienta tuyo.</h2><p>Podemos ajustar proporciones, colores, materiales, iluminación y forma según tu espacio.</p>{product.details?.length ? <ul>{product.details.map((detail) => <li key={detail}><Check size={16} /> {detail}</li>)}</ul> : null}</div><Sparkles size={72} strokeWidth={1} /></div></section>
    </main>
  );
}
