import { FormEvent, useMemo, useState } from 'react';
import { Eye, ImagePlus, PackagePlus, Save, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { createId, currency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import type { HeroSlide, WebProduct } from '../../types/entities';

const slideDraft = (): HeroSlide => {
  const now = new Date().toISOString();
  return {
    id: createId('hero'),
    title: '',
    subtitle: '',
    mediaType: 'image',
    mediaUrl: '/brand/kikeled-logo.png',
    thumbnailUrl: '',
    ctaLabel: 'Cotizar proyecto',
    ctaUrl: '/cotizar',
    badge: 'Kikeled Studio SRL',
    order: 10,
    isActive: true,
    startsAt: '',
    endsAt: '',
    createdAt: now,
    updatedAt: now,
  };
};

const productDraft = (): WebProduct => {
  const now = new Date().toISOString();
  return {
    id: createId('web-product'),
    name: '',
    slug: '',
    category: 'Letreros LED',
    shortDescription: '',
    description: '',
    thumbnailUrl: '/brand/kikeled-logo.png',
    galleryUrls: [],
    priceFrom: 0,
    priceUnit: 'proyecto',
    materials: [],
    sizes: [],
    deliveryTime: 'A definir',
    details: [],
    ctaLabel: 'Quiero este producto',
    isFeatured: true,
    isActive: true,
    order: 10,
    createdAt: now,
    updatedAt: now,
  };
};

function csvToList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToCsv(value?: string[]) {
  return value?.join(', ') ?? '';
}

function makeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function WebContentPage() {
  const {
    heroSlides,
    webProducts,
    upsertHeroSlide,
    deleteHeroSlide,
    upsertWebProduct,
    deleteWebProduct,
  } = useAppStore((state) => ({
    heroSlides: state.heroSlides,
    webProducts: state.webProducts,
    upsertHeroSlide: state.upsertHeroSlide,
    deleteHeroSlide: state.deleteHeroSlide,
    upsertWebProduct: state.upsertWebProduct,
    deleteWebProduct: state.deleteWebProduct,
  }));

  const sortedSlides = useMemo(() => [...heroSlides].sort((a, b) => a.order - b.order), [heroSlides]);
  const sortedProducts = useMemo(() => [...webProducts].sort((a, b) => a.order - b.order), [webProducts]);
  const [slide, setSlide] = useState<HeroSlide>(sortedSlides[0] ?? slideDraft());
  const [product, setProduct] = useState<WebProduct>(sortedProducts[0] ?? productDraft());
  const [status, setStatus] = useState('');

  async function saveSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await upsertHeroSlide({
      ...slide,
      title: slide.title.trim(),
      subtitle: slide.subtitle?.trim(),
      mediaUrl: slide.mediaUrl.trim(),
      thumbnailUrl: slide.thumbnailUrl?.trim(),
      ctaLabel: slide.ctaLabel?.trim(),
      ctaUrl: slide.ctaUrl?.trim(),
      badge: slide.badge?.trim(),
      startsAt: slide.startsAt || undefined,
      endsAt: slide.endsAt || undefined,
      order: Number(slide.order) || 0,
    });
    setStatus('Hero actualizado y sincronizado.');
  }

  async function removeSlide() {
    if (!slide.id) return;
    await deleteHeroSlide(slide.id);
    setSlide(slideDraft());
    setStatus('Slide eliminado.');
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = product.name.trim();
    await upsertWebProduct({
      ...product,
      name: cleanName,
      slug: product.slug.trim() || makeSlug(cleanName),
      category: product.category.trim(),
      shortDescription: product.shortDescription.trim(),
      description: product.description?.trim(),
      thumbnailUrl: product.thumbnailUrl?.trim(),
      priceFrom: Number(product.priceFrom) || 0,
      priceUnit: product.priceUnit?.trim(),
      deliveryTime: product.deliveryTime?.trim(),
      order: Number(product.order) || 0,
    });
    setStatus('Producto actualizado y sincronizado.');
  }

  async function removeProduct() {
    if (!product.id) return;
    await deleteWebProduct(product.id);
    setProduct(productDraft());
    setStatus('Producto eliminado.');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contenido web"
        title="Hero y catálogo dinámicos"
        description="Edita lo que aparece en la página principal y en el catálogo público sin tocar el código."
        action={<a className="btn-secondary" href="/" target="_blank" rel="noreferrer"><Eye size={16} /> Ver homepage</a>}
      />

      {status ? <p className="k-admin-save-status">{status}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SectionCard title="Hero carousel" description="Slides activos, ordenados y con fecha opcional de publicación.">
          <div className="k-content-editor">
            <div className="k-content-list">
              {sortedSlides.map((item) => (
                <button key={item.id} className={item.id === slide.id ? 'is-selected' : ''} onClick={() => setSlide(item)} type="button">
                  <span>{item.title || 'Slide sin título'}</span>
                  <small>Orden {item.order} · {item.isActive ? 'Activo' : 'Oculto'}</small>
                </button>
              ))}
            </div>

            <form className="k-content-form" onSubmit={saveSlide}>
              <div className="k-content-actions">
                <button className="btn-secondary" type="button" onClick={() => setSlide(slideDraft())}><ImagePlus size={16} /> Nuevo slide</button>
                <button className="btn-ghost" type="button" onClick={() => void removeSlide()}><Trash2 size={16} /> Eliminar</button>
              </div>
              <input className="field" value={slide.title} onChange={(event) => setSlide({ ...slide, title: event.target.value })} placeholder="Título principal" required />
              <textarea className="field" value={slide.subtitle ?? ''} onChange={(event) => setSlide({ ...slide, subtitle: event.target.value })} placeholder="Texto de apoyo" rows={3} />
              <div className="grid gap-3 md:grid-cols-2">
                <select className="field" value={slide.mediaType} onChange={(event) => setSlide({ ...slide, mediaType: event.target.value as HeroSlide['mediaType'] })}>
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                </select>
                <input className="field" type="number" value={slide.order} onChange={(event) => setSlide({ ...slide, order: Number(event.target.value) })} placeholder="Orden" />
              </div>
              <input className="field" value={slide.mediaUrl} onChange={(event) => setSlide({ ...slide, mediaUrl: event.target.value })} placeholder="URL de imagen o video" required />
              <input className="field" value={slide.thumbnailUrl ?? ''} onChange={(event) => setSlide({ ...slide, thumbnailUrl: event.target.value })} placeholder="Miniatura opcional" />
              <div className="grid gap-3 md:grid-cols-2">
                <input className="field" value={slide.badge ?? ''} onChange={(event) => setSlide({ ...slide, badge: event.target.value })} placeholder="Etiqueta" />
                <input className="field" value={slide.ctaLabel ?? ''} onChange={(event) => setSlide({ ...slide, ctaLabel: event.target.value })} placeholder="Texto del botón" />
              </div>
              <input className="field" value={slide.ctaUrl ?? ''} onChange={(event) => setSlide({ ...slide, ctaUrl: event.target.value })} placeholder="/cotizar" />
              <div className="k-toggle-row">
                <label><input type="checkbox" checked={slide.isActive} onChange={(event) => setSlide({ ...slide, isActive: event.target.checked })} /> Publicado</label>
                <button className="btn-primary" type="submit"><Save size={16} /> Guardar slide</button>
              </div>
            </form>
          </div>
        </SectionCard>

        <SectionCard title="Catálogo editable" description="Productos públicos con miniatura, precio base, detalles y estado destacado.">
          <div className="k-content-editor">
            <div className="k-content-list">
              {sortedProducts.map((item) => (
                <button key={item.id} className={item.id === product.id ? 'is-selected' : ''} onClick={() => setProduct(item)} type="button">
                  <span>{item.name || 'Producto sin nombre'}</span>
                  <small>{currency(item.priceFrom)} · {item.isActive ? 'Activo' : 'Oculto'}</small>
                </button>
              ))}
            </div>

            <form className="k-content-form" onSubmit={saveProduct}>
              <div className="k-content-actions">
                <button className="btn-secondary" type="button" onClick={() => setProduct(productDraft())}><PackagePlus size={16} /> Nuevo producto</button>
                <button className="btn-ghost" type="button" onClick={() => void removeProduct()}><Trash2 size={16} /> Eliminar</button>
              </div>
              <input className="field" value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value, slug: product.slug || makeSlug(event.target.value) })} placeholder="Nombre del producto" required />
              <div className="grid gap-3 md:grid-cols-2">
                <input className="field" value={product.slug} onChange={(event) => setProduct({ ...product, slug: event.target.value })} placeholder="slug-url" />
                <input className="field" value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} placeholder="Categoría" required />
              </div>
              <textarea className="field" value={product.shortDescription} onChange={(event) => setProduct({ ...product, shortDescription: event.target.value })} placeholder="Descripción corta" rows={2} required />
              <textarea className="field" value={product.description ?? ''} onChange={(event) => setProduct({ ...product, description: event.target.value })} placeholder="Descripción larga" rows={3} />
              <input className="field" value={product.thumbnailUrl ?? ''} onChange={(event) => setProduct({ ...product, thumbnailUrl: event.target.value })} placeholder="URL de miniatura" />
              <div className="grid gap-3 md:grid-cols-3">
                <input className="field" type="number" value={product.priceFrom} onChange={(event) => setProduct({ ...product, priceFrom: Number(event.target.value) })} placeholder="Precio desde" />
                <input className="field" value={product.priceUnit ?? ''} onChange={(event) => setProduct({ ...product, priceUnit: event.target.value })} placeholder="Unidad" />
                <input className="field" type="number" value={product.order} onChange={(event) => setProduct({ ...product, order: Number(event.target.value) })} placeholder="Orden" />
              </div>
              <input className="field" value={listToCsv(product.materials)} onChange={(event) => setProduct({ ...product, materials: csvToList(event.target.value) })} placeholder="Materiales separados por coma" />
              <input className="field" value={listToCsv(product.details)} onChange={(event) => setProduct({ ...product, details: csvToList(event.target.value) })} placeholder="Detalles separados por coma" />
              <input className="field" value={product.deliveryTime ?? ''} onChange={(event) => setProduct({ ...product, deliveryTime: event.target.value })} placeholder="Tiempo de entrega" />
              <div className="k-toggle-row">
                <label><input type="checkbox" checked={product.isActive} onChange={(event) => setProduct({ ...product, isActive: event.target.checked })} /> Publicado</label>
                <label><input type="checkbox" checked={product.isFeatured} onChange={(event) => setProduct({ ...product, isFeatured: event.target.checked })} /> Destacado</label>
                <button className="btn-primary" type="submit"><Save size={16} /> Guardar producto</button>
              </div>
            </form>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Vista rápida de publicación">
        <div className="k-web-content-summary">
          <span><StatusBadge label="Neon" /> {sortedSlides.filter((item) => item.isActive).length} slides activos</span>
          <span><StatusBadge label="RGB Elite" /> {sortedProducts.filter((item) => item.isFeatured && item.isActive).length} productos destacados</span>
          <span><StatusBadge label="Base" /> {sortedProducts.filter((item) => item.isActive).length} productos publicados</span>
        </div>
      </SectionCard>
    </div>
  );
}
