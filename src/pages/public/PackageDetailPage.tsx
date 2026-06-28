import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { defaultWebProducts } from '../../data/webContent';
import { apiGetPublicProducts } from '../../lib/api';
import { brand } from '../../lib/brand';
import { getPackageBySlug, packages } from '../../lib/packages';
import { currency } from '../../lib/utils';
import type { WebProduct } from '../../types/entities';

function packageWhatsappUrl(packageName: string) {
  const message = `Hola Kikeled, quiero informacion del paquete ${packageName}. Tengo mi logo listo para enviarlo.`;
  return `${brand.whatsappUrl}?text=${encodeURIComponent(message)}`;
}

function productImage(product: WebProduct) {
  return product.thumbnailUrl || product.galleryUrls?.[0] || '/brand/kikeled-logo.png';
}

export function PackageDetailPage() {
  const { packageSlug } = useParams();
  const selectedPackage = getPackageBySlug(packageSlug);
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

  const packageProducts = useMemo(() => {
    if (!selectedPackage) return [];
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return selectedPackage.productSlugs
      .map((slug) => bySlug.get(slug) ?? defaultWebProducts.find((product) => product.slug === slug))
      .filter((product): product is WebProduct => Boolean(product));
  }, [products, selectedPackage]);

  if (!selectedPackage) return <Navigate to="/" replace />;

  const relatedPackages = packages.filter((item) => item.slug !== selectedPackage.slug);

  return (
    <section className="k-package-detail-page mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <Link className="k-back-link" to="/#paquetes"><ArrowLeft size={16} /> Volver a paquetes</Link>

      <div className="k-package-detail-hero">
        <div>
          <p className="label mb-3">Paquete Kikeled</p>
          <h1>{selectedPackage.name}</h1>
          <p>{selectedPackage.audience}</p>
          <div className="k-package-detail-price">{selectedPackage.price}</div>
          <div className="k-package-detail-actions">
            <Link className="btn-secondary" to={`/cotizar?paquete=${encodeURIComponent(selectedPackage.name)}`}>Subir mi logo</Link>
            <a className="btn-primary" href={packageWhatsappUrl(selectedPackage.name)} target="_blank" rel="noreferrer">Cotizar via WhatsApp</a>
          </div>
        </div>
        <div className="k-package-visual-board">
          {packageProducts.slice(0, 4).map((product, index) => (
            <article key={product.id} className={`k-package-visual-card k-visual-${index}`}>
              <img src={productImage(product)} alt={product.name} />
              <span>{product.category}</span>
              <strong>{product.name}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="k-package-detail-grid">
        <section className="k-package-info-panel">
          <p className="label">Que trae</p>
          <h2>Incluye lo necesario para avanzar con claridad.</h2>
          <div className="k-package-includes-grid">
            {selectedPackage.includes.map((item) => (
              <div key={item}><Check size={18} /> <span>{item}</span></div>
            ))}
          </div>
        </section>

        <section className="k-package-info-panel">
          <p className="label">Entregables</p>
          <h2>Lo que recibe tu negocio.</h2>
          <ul className="k-package-deliverable-list">
            {selectedPackage.deliverables.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="k-package-products-section">
        <div className="k-section-split">
          <div>
            <p className="label mb-3">Visual del paquete</p>
            <h2>Productos y mockups relacionados.</h2>
          </div>
          <Link className="k-btn k-btn-dark" to="/catalogo">Ver catalogo completo</Link>
        </div>
        <div className="k-package-product-gallery">
          {packageProducts.map((product) => (
            <article key={product.id}>
              <img src={productImage(product)} alt={product.name} />
              <div>
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.shortDescription}</p>
                <strong>{currency(product.priceFrom)}{product.priceUnit ? ` / ${product.priceUnit}` : ''}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="k-package-process-section">
        <p className="label mb-3">Proceso</p>
        <h2>Asi lo llevamos del logo a una propuesta lista.</h2>
        <div className="k-package-process-grid">
          {selectedPackage.steps.map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="k-package-final-cta">
        <div>
          <p className="label mb-3">Siguiente paso</p>
          <h2>Sube tu logo y armamos la ruta visual.</h2>
          <p>{selectedPackage.promise}</p>
        </div>
        <div>
          <Link className="btn-secondary" to={`/cotizar?paquete=${encodeURIComponent(selectedPackage.name)}`}>Subir mi logo</Link>
          <a className="btn-primary" href={packageWhatsappUrl(selectedPackage.name)} target="_blank" rel="noreferrer">Cotizar via WhatsApp</a>
        </div>
      </section>

      <div className="k-package-related">
        {relatedPackages.map((item) => (
          <Link key={item.slug} to={`/paquetes/${item.slug}`}>
            <span>{item.price}</span>
            <strong>{item.name}</strong>
            <ChevronRight size={16} />
          </Link>
        ))}
      </div>
    </section>
  );
}