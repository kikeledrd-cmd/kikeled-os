import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { defaultWebProducts } from '../../data/webContent';
import { apiGetPublicProducts } from '../../lib/api';
import { brand } from '../../lib/brand';
import { currency } from '../../lib/utils';
import type { WebProduct } from '../../types/entities';

function whatsappProductUrl(product: WebProduct) {
  const message = `Hola Kikeled, quiero cotizar este producto: ${product.name}. Tengo mi logo listo para enviarlo.`;
  return `${brand.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
function uniqueImages(product: WebProduct) {
  return [product.thumbnailUrl, ...(product.galleryUrls ?? [])]
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url))
    .filter((url, index, list) => list.indexOf(url) === index)
    .slice(0, 8);
}

function productSpecs(product: WebProduct) {
  return [
    product.materials?.length ? { label: 'Materiales', value: product.materials.slice(0, 3).join(', ') } : null,
    product.sizes?.length ? { label: 'Formatos', value: product.sizes.slice(0, 3).join(', ') } : null,
    product.deliveryTime ? { label: 'Entrega', value: product.deliveryTime } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

export function CatalogPage() {
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts);
  const [selectedProduct, setSelectedProduct] = useState<WebProduct | null>(null);

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

  const featuredProduct = visibleProducts[0];

  return (
    <section className="k-catalog-page mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="k-catalog-hero">
        <div>
          <p className="label mb-3">Catalogo Kikeled</p>
          <h1>Productos claros, visuales y listos para cotizar.</h1>
          <p>
            Explora cada solucion con mockups, materiales, detalles de fabricacion y rangos de precio para decidir rapido que pieza necesita tu negocio.
          </p>
        </div>
        {featuredProduct ? (
          <div className="k-catalog-hero-product">
            <span>Producto destacado</span>
            <strong>{featuredProduct.name}</strong>
            <small>Desde {currency(featuredProduct.priceFrom)}{featuredProduct.priceUnit ? ` / ${featuredProduct.priceUnit}` : ''}</small>
          </div>
        ) : null}
      </div>

      <div className="k-catalog-showcase">
        {visibleProducts.map((product) => {
          const images = uniqueImages(product);
          const specs = productSpecs(product);
          const mockups = images.slice(1);

          return (
            <article key={product.id} className="k-catalog-product-card">
              <div className="k-catalog-product-media">
                {images[0] ? <img src={images[0]} alt={product.name} loading="lazy" /> : null}
                <div className="k-catalog-media-overlay">
                  <span>{product.category}</span>
                  <button type="button" onClick={() => setSelectedProduct(product)}>{mockups.length ? `${mockups.length} mockups` : 'Ver producto'}</button>
                </div>
              </div>

              {mockups.length ? (
                <button className="k-catalog-mockup-strip" type="button" onClick={() => setSelectedProduct(product)} aria-label={`Ver mockups de ${product.name}`}>
                  {mockups.map((image, index) => (
                    <img key={`${product.id}-mockup-${index}`} src={image} alt={`${product.name} mockup ${index + 1}`} loading="lazy" />
                  ))}
                </button>
              ) : null}

              <div className="k-catalog-product-body">
                <div className="k-catalog-product-title">
                  <div>
                    <p>{product.category}</p>
                    <h2>{product.name}</h2>
                  </div>
                  <span>Desde</span>
                </div>

                <p className="k-catalog-product-description">{product.description || product.shortDescription}</p>

                {specs.length ? (
                  <div className="k-catalog-spec-grid">
                    {specs.map((spec) => (
                      <div key={spec.label}>
                        <span>{spec.label}</span>
                        <strong>{spec.value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                {product.details?.length ? (
                  <ul className="k-catalog-detail-list">
                    {product.details.slice(0, 4).map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                ) : null}

                <div className="k-catalog-product-footer">
                  <strong>{currency(product.priceFrom)} {product.priceUnit ? <span>/ {product.priceUnit}</span> : null}</strong>
                  <div className="k-catalog-product-actions">
                    <Link to={`/cotizar?producto=${encodeURIComponent(product.name)}`} className="btn-secondary">
                      Subir mi logo
                    </Link>
                    <a href={whatsappProductUrl(product)} className="btn-primary" target="_blank" rel="noreferrer">
                      Cotizar via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedProduct ? <ProductLightbox product={selectedProduct} onClose={() => setSelectedProduct(null)} /> : null}
    </section>
  );
}

function ProductLightbox({ product, onClose }: { product: WebProduct; onClose: () => void }) {
  const images = uniqueImages(product);
  const specs = productSpecs(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0] ?? product.thumbnailUrl ?? '';

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  const showPreviousImage = () => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
  };

  return (
    <div className="k-product-lightbox" role="dialog" aria-modal="true" aria-label={`Mockups de ${product.name}`}>
      <button className="k-product-lightbox-backdrop" type="button" onClick={onClose} aria-label="Cerrar" />
      <div className="k-product-lightbox-panel">
        <button className="k-product-lightbox-close" type="button" onClick={onClose}>Cerrar</button>
        <div className="k-product-lightbox-media">
          {activeImage ? <img src={activeImage} alt={product.name} /> : null}
          {activeImage ? (
            <div className="k-product-lightbox-controls" aria-label="Navegacion de imagenes">
              <button type="button" onClick={showPreviousImage} disabled={images.length <= 1}>Anterior</button>
              <span>{activeIndex + 1} / {Math.max(images.length, 1)}</span>
              <button type="button" onClick={showNextImage} disabled={images.length <= 1}>Siguiente</button>
            </div>
          ) : null}
          {images.length > 1 ? (
            <div className="k-product-lightbox-thumbs">
              {images.map((image, index) => (
                <button key={`${product.id}-detail-${index}`} className={index === activeIndex ? 'is-active' : ''} type="button" onClick={() => setActiveIndex(index)}>
                  <img src={image} alt={`${product.name} vista ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="k-product-lightbox-content">
          <p className="label">{product.category}</p>
          <h2>{product.name}</h2>
          <p>{product.description || product.shortDescription}</p>
          {specs.length ? (
            <div className="k-catalog-spec-grid">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
          {product.details?.length ? (
            <ul className="k-catalog-detail-list">
              {product.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          ) : null}
          <div className="k-catalog-product-footer">
            <strong>{currency(product.priceFrom)} {product.priceUnit ? <span>/ {product.priceUnit}</span> : null}</strong>
            <div className="k-catalog-product-actions">
              <Link to={`/cotizar?producto=${encodeURIComponent(product.name)}`} className="btn-secondary">Subir mi logo</Link>
              <a href={whatsappProductUrl(product)} className="btn-primary" target="_blank" rel="noreferrer">Cotizar via WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}