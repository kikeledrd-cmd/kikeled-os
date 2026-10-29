import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FastFoodDropPage } from '../src/pages/public/FastFoodDropPage';
import { fastFoodCollections, selectFastFoodDropProducts, fastFoodDropWhatsAppUrl, fastFoodProductBackUrl, fastFoodPublishedCountLabel } from '../src/lib/fastFoodDrop';
import { decodeHashTarget } from '../src/components/layout/ChromePublicLayout';
import type { WebProduct } from '../src/types/entities';

function makeProduct(name: string, category: string, isActive = true, order = 1) {
  return { id: name, name, slug: name.toLowerCase().replaceAll(' ', '-'), category, isActive, order, shortDescription: '' } as WebProduct;
}

test('Fast Food Neon has four distinct collections with admin-ready category names', () => {
  assert.deepEqual(fastFoodCollections.map((item) => item.name), ['Neon Crew', 'Dominican Street Food', 'Sweet Neon', 'Drinks Neon']);
  assert.ok(fastFoodCollections.every((item) => item.category.startsWith('Fast Food Neon / ')));
  assert.equal(new Set(fastFoodCollections.map((item) => item.category)).size, 4);
});

test('only published Fast Food Neon models appear, with collection and search filters', () => {
  const entries = [
    makeProduct('Burger Glow', 'Fast Food Neon / Neon Crew', true, 2),
    makeProduct('Pizza Glow', 'Fast Food Neon / Neon Crew', true, 1),
    makeProduct('Sweet Glow', 'Fast Food Neon / Sweet Neon'),
    makeProduct('Secreto', 'Fast Food Neon / Neon Crew', false),
    makeProduct('Letrero circular LED', 'LED'),
  ];
  assert.deepEqual(selectFastFoodDropProducts(entries).map((item) => item.name), ['Pizza Glow', 'Sweet Glow', 'Burger Glow']);
  assert.deepEqual(selectFastFoodDropProducts(entries, 'neon-crew', 'burger').map((item) => item.name), ['Burger Glow']);
  assert.deepEqual(selectFastFoodDropProducts(entries, 'drinks-neon').map((item) => item.name), []);
});

test('drop page offers editorial collection navigation and avoids invented product listings', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/drops/fast-food-neon']}>
      <Routes><Route path="/drops/fast-food-neon" element={<FastFoodDropPage />} /></Routes>
    </MemoryRouter>,
  );
  assert.match(html, /FAST FOOD/i);
  assert.match(html, /NEON/i);
  for (const collection of fastFoodCollections) assert.match(html, new RegExp(collection.name, 'i'));
  assert.match(html, /Consultar por WhatsApp/);
  assert.doesNotMatch(html, /Burger Glow|Pizza Glow/);
});

test('WhatsApp link contains the selected collection or model, with no checkout', () => {
  const url = fastFoodDropWhatsAppUrl('Neon Crew', 'Burger Glow');
  assert.match(url, /^https:\/\/wa\.me\/18296648023\?text=/);
  assert.match(decodeURIComponent(url), /Neon Crew/);
  assert.match(decodeURIComponent(url), /Burger Glow/);
});

test('individual drop models return to their own collection', () => {
  assert.equal(fastFoodProductBackUrl(makeProduct('Burger Glow', 'Fast Food Neon / Neon Crew')), '/drops/fast-food-neon?coleccion=neon-crew#modelos');
  assert.equal(fastFoodProductBackUrl(makeProduct('Letrero circular LED', 'LED')), '/catalogo');
});

test('published count is scoped to selected collection and search results are distinct', () => {
  assert.equal(fastFoodPublishedCountLabel(8, 2, 0, 'Neon Crew', ''), '2 modelos publicados en Neon Crew');
  assert.equal(fastFoodPublishedCountLabel(8, 0, 0, 'Drinks Neon', ''), '0 modelos publicados en Drinks Neon');
  assert.equal(fastFoodPublishedCountLabel(8, 2, 1, 'Neon Crew', 'burger'), '2 modelos publicados en Neon Crew · 1 resultado');
  assert.equal(fastFoodPublishedCountLabel(8, 8, 8, '', ''), '8 modelos publicados');
});

test('invalid hash encodings cannot crash public navigation', () => {
  assert.equal(decodeHashTarget('#modelos'), 'modelos');
  assert.equal(decodeHashTarget('#dise%C3%B1os'), 'diseños');
  assert.equal(decodeHashTarget('#%'), null);
  assert.equal(decodeHashTarget('#%E0%A4%A'), null);
});
