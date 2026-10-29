import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultWebProducts } from '../src/data/webContent';
import * as catalogTemplates from '../src/data/temporaryCatalog';
import { selectFastFoodDropProducts, fastFoodCollections } from '../src/lib/fastFoodDrop';
import type { WebProduct } from '../src/types/entities';

test('initial storefront offers a diverse sample of signage products with reference prices', () => {
  const slugs = new Set(defaultWebProducts.map((product) => product.slug));
  assert.ok(defaultWebProducts.length >= 20, 'El catálogo debe tener al menos 20 ejemplos');
  assert.equal(slugs.size, defaultWebProducts.length, 'Los enlaces de ficha deben ser únicos');
  assert.ok(defaultWebProducts.some((product) => product.name === 'Letras 3D en PVC'));
  assert.ok(defaultWebProducts.some((product) => product.name === 'Letrero tipo A'));
  assert.ok(defaultWebProducts.some((product) => product.name === 'Señalética personalizada'));
  assert.ok(defaultWebProducts.every((product) => product.priceFrom > 0), 'El ejemplo debe tener precio estimado');
});

test('one clearly provisional, editable model appears in each Fast Food Neon collection', () => {
  const products = selectFastFoodDropProducts(defaultWebProducts);
  assert.equal(products.length, 4);
  for (const collection of fastFoodCollections) {
    const collectionProducts = selectFastFoodDropProducts(defaultWebProducts, collection.id);
    assert.equal(collectionProducts.length, 1, collection.name);
    assert.match(collectionProducts[0].name, /Ejemplo/i);
    assert.ok(collectionProducts[0].priceFrom > 0);
    assert.ok(collectionProducts[0].details?.some((detail) => /temporal|provisional|referencia/i.test(detail)));
  }
});

test('admin import skips existing IDs and slugs without overwriting edited prices', () => {
  const selector = (catalogTemplates as Record<string, unknown>).selectMissingTemporaryCatalogProducts;
  assert.equal(typeof selector, 'function', 'Debe existir selector de ejemplos faltantes');
  const original = defaultWebProducts[0];
  const edited = { ...original, priceFrom: 99999 };
  const alreadyRenamed = { ...defaultWebProducts[11], id: 'custom-id', slug: ` ${defaultWebProducts[11].slug.toUpperCase()} ` };
  const existing = [edited, alreadyRenamed];
  const missing = (selector as (samples: WebProduct[], actual: WebProduct[]) => WebProduct[])(defaultWebProducts, existing);
  assert.equal(missing.length, defaultWebProducts.length - 2);
  assert.ok(!missing.some((item) => item.id === edited.id));
  assert.ok(!missing.some((item) => item.slug === defaultWebProducts[11].slug));
  assert.equal(existing[0].priceFrom, 99999);
});
