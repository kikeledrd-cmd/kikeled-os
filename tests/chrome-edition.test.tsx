import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChromePublicLayout as PublicLayout } from '../src/components/layout/ChromePublicLayout';
import { ChromeHomePage as HomePage } from '../src/pages/public/ChromeHomePage';
import { ChromeProductPage } from '../src/pages/public/ChromeProductPage';
import { QuoteForm } from '../src/components/landing/QuoteForm';
import { QuotePage } from '../src/pages/public/QuotePage';
import { chromeProductGallery, chromeProductImage, selectChromeProducts } from '../src/lib/chromeCatalog';
import type { WebProduct } from '../src/types/entities';

function renderPublicHome() {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

test('chrome edition storefront centers on signage and the official Letreros brand', () => {
  const html = renderPublicHome();
  assert.match(html, /LETREROS QUE HACEN/i);
  assert.match(html, /BRILLAR TU NEGOCIO/i);
  assert.match(html, /\/brand\/kikeled-letreros-logo\.png/);
  assert.match(html, /Explorar catálogo/);
  assert.match(html, /Cotizar por WhatsApp/);
});

test('public navigation prioritizes the catalogue, projects, offers and optional Business 360', () => {
  const html = renderPublicHome();
  assert.match(html, /Catálogo/);
  assert.match(html, /Proyectos/);
  assert.match(html, /Ofertas/);
  assert.match(html, /Business 360/);
  assert.match(html, /Iniciar sesión/);
  assert.doesNotMatch(html, /Carrito de compras/);
});

test('landing showcases signage categories and Fast Food Neon drop', () => {
  const html = renderPublicHome();
  for (const label of ['Letreros circulares', 'Letras 3D', 'Neón Flex', 'Cajas de luz', 'FAST FOOD NEON']) {
    assert.match(html, new RegExp(label, 'i'));
  }
});

test('catalogue search and category filter only show matching active products', () => {
  const make = (name: string, category: string, isActive = true) => ({ name, category, isActive, order: 1 }) as WebProduct;
  const products = [make('Letrero circular LED', 'LED'), make('Letrero troquelado', 'Corporativo'), make('Circular oculto', 'LED', false)];
  const result = selectChromeProducts(products, 'circu', 'LED');
  assert.deepEqual(result.map((product) => product.name), ['Letrero circular LED']);
});

test('uploaded customer photos take priority over conceptual fallback images', () => {
  const product = { name: 'Letrero circular LED', slug: 'letrero-circular-led', thumbnailUrl: '/brand/kikeled-logo.png', galleryUrls: ['/uploads/proyecto-real.webp'] } as WebProduct;
  assert.equal(chromeProductImage(product), '/uploads/proyecto-real.webp');
  assert.deepEqual(chromeProductGallery(product), ['/uploads/proyecto-real.webp']);
});

test('individual product sheet shows photos, details, price and personalization actions', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/catalogo/letrero-circular-led']}>
      <Routes><Route path="/catalogo/:slug" element={<ChromeProductPage />} /></Routes>
    </MemoryRouter>,
  );
  assert.match(html, /Letrero circular LED/);
  assert.match(html, /Desde RD\$4,500/);
  assert.match(html, /Personalizar y cotizar/);
  assert.match(html, /WhatsApp/);
  assert.match(html, /Acrílico/);
});

test('a newly published product does not flash a not-found message while it loads', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/catalogo/modelo-nuevo']}>
      <Routes><Route path="/catalogo/:slug" element={<ChromeProductPage />} /></Routes>
    </MemoryRouter>,
  );
  assert.match(html, /Cargando ficha del producto/);
  assert.doesNotMatch(html, /Producto no disponible/);
});

test('optional Business 360 can be selected in the existing quote form', () => {
  const html = renderToStaticMarkup(<QuoteForm selectedProduct="Business 360" />);
  assert.match(html, /value="Business 360"/);
});

test('personalization request remains part of the Letreros public experience', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/cotizar?producto=Ne%C3%B3n%20flex']}>
      <Routes><Route path="/cotizar" element={<QuotePage />} /></Routes>
    </MemoryRouter>,
  );
  assert.match(html, /Personaliza tu letrero/);
  assert.match(html, /Neón flex/);
  assert.match(html, /WhatsApp/);
});
