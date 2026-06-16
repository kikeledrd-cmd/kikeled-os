import type { PricingRule, Service } from '../types/entities';

export type MaterialPricingProfile = {
  id: string;
  label: string;
  materials: string[];
  multiplier: number;
  fixedFee: number;
};

export type InstallationPricingProfile = {
  id: string;
  label: string;
  baseFee: number;
  percent: number;
  notes: string;
};

export type CityPricingProfile = {
  id: string;
  label: string;
  transportFee: number;
  installationMultiplier: number;
};

export type AdvancedPricingConfig = {
  materialProfiles: MaterialPricingProfile[];
  installationProfiles: InstallationPricingProfile[];
  cityProfiles: CityPricingProfile[];
  productMultipliers: Record<string, number>;
};

export type ProductPricingPreset = {
  id: string;
  label: string;
  serviceId: string;
  materialProfileId: string;
  installationProfileId: string;
  cityProfileId: string;
  width: number;
  height: number;
  quantity: number;
  lighting: boolean;
  transport: boolean;
  description: string;
};

const storageKey = 'kikeled-advanced-pricing-config';

export const defaultAdvancedPricingConfig: AdvancedPricingConfig = {
  materialProfiles: [
  { id: 'acrilico-led', label: 'Acrilico LED premium', materials: ['Acrilico', 'Modulos LED', 'Fuentes de poder'], multiplier: 0.18, fixedFee: 850 },
  { id: 'acm-3d', label: 'ACM + letras 3D', materials: ['ACM', 'Acrilico', 'Cables'], multiplier: 0.28, fixedFee: 3200 },
  { id: 'panaflex', label: 'Panaflex iluminado', materials: ['Panaflex', 'Perfileria', 'Fuentes de poder'], multiplier: 0.2, fixedFee: 1800 },
  { id: 'vinil', label: 'Vinil comercial', materials: ['Vinil adhesivo', 'Vinil transparente'], multiplier: 0.12, fixedFee: 650 },
  { id: 'economico', label: 'Economico / temporal', materials: ['Coroplast', 'Vinil adhesivo'], multiplier: 0.08, fixedFee: 350 },
  ],
  installationProfiles: [
  { id: 'sin-instalacion', label: 'Sin instalacion', baseFee: 0, percent: 0, notes: 'Retiro o entrega sin montaje.' },
  { id: 'basica', label: 'Instalacion basica', baseFee: 1800, percent: 0.05, notes: 'Pared accesible, altura baja o media.' },
  { id: 'altura', label: 'Instalacion en altura', baseFee: 4200, percent: 0.09, notes: 'Escalera, fachada alta o instalacion exterior.' },
  { id: 'electrica', label: 'Instalacion electrica LED', baseFee: 5200, percent: 0.12, notes: 'Conexion electrica, fuentes, pruebas y ajuste de luz.' },
  ],
  cityProfiles: [
  { id: 'santo-domingo-dn', label: 'Santo Domingo DN', transportFee: 950, installationMultiplier: 1 },
  { id: 'santo-domingo-este', label: 'Santo Domingo Este', transportFee: 1200, installationMultiplier: 1.05 },
  { id: 'santo-domingo-norte', label: 'Santo Domingo Norte', transportFee: 1400, installationMultiplier: 1.08 },
  { id: 'santo-domingo-oeste', label: 'Santo Domingo Oeste', transportFee: 1450, installationMultiplier: 1.08 },
  { id: 'santiago', label: 'Santiago', transportFee: 5200, installationMultiplier: 1.18 },
  { id: 'interior', label: 'Interior RD / calcular', transportFee: 7500, installationMultiplier: 1.25 },
  ],
  productMultipliers: {
    'cat-led': 1,
    'cat-acrilico': 1.08,
    'cat-fachadas': 1.22,
    'cat-cajas': 1.16,
    'cat-panaflex': 1.12,
    'cat-coroplast': 0.88,
    'cat-vinil': 0.94,
    'cat-branding': 1.18,
    'cat-custom': 1.25,
  },
};

export const materialPricingProfiles = defaultAdvancedPricingConfig.materialProfiles;
export const installationPricingProfiles = defaultAdvancedPricingConfig.installationProfiles;
export const cityPricingProfiles = defaultAdvancedPricingConfig.cityProfiles;

export const productPricingPresets: ProductPricingPreset[] = [
  {
    id: 'preset-led-circular',
    label: 'Letrero circular LED',
    serviceId: 'srv-1',
    materialProfileId: 'acrilico-led',
    installationProfileId: 'sin-instalacion',
    cityProfileId: 'santo-domingo-dn',
    width: 18,
    height: 18,
    quantity: 1,
    lighting: true,
    transport: false,
    description: 'Letrero circular LED en acrilico',
  },
  {
    id: 'preset-caja-luz',
    label: 'Caja de luz fachada',
    serviceId: 'srv-2',
    materialProfileId: 'panaflex',
    installationProfileId: 'electrica',
    cityProfileId: 'santo-domingo-dn',
    width: 96,
    height: 30,
    quantity: 1,
    lighting: true,
    transport: true,
    description: 'Caja de luz para fachada comercial',
  },
  {
    id: 'preset-fachada-3d',
    label: 'Fachada ACM 3D',
    serviceId: 'srv-3',
    materialProfileId: 'acm-3d',
    installationProfileId: 'altura',
    cityProfileId: 'santo-domingo-dn',
    width: 216,
    height: 48,
    quantity: 1,
    lighting: true,
    transport: true,
    description: 'Fachada ACM con letras 3D',
  },
  {
    id: 'preset-panaflex',
    label: 'Panaflex iluminado',
    serviceId: 'srv-5',
    materialProfileId: 'panaflex',
    installationProfileId: 'basica',
    cityProfileId: 'santo-domingo-dn',
    width: 144,
    height: 36,
    quantity: 1,
    lighting: true,
    transport: true,
    description: 'Panaflex iluminado exterior',
  },
  {
    id: 'preset-vinil',
    label: 'Vinil comercial',
    serviceId: 'srv-7',
    materialProfileId: 'vinil',
    installationProfileId: 'basica',
    cityProfileId: 'santo-domingo-dn',
    width: 120,
    height: 36,
    quantity: 1,
    lighting: false,
    transport: false,
    description: 'Rotulacion en vinil comercial',
  },
];

export function readAdvancedPricingConfig(): AdvancedPricingConfig {
  if (typeof window === 'undefined') return defaultAdvancedPricingConfig;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return defaultAdvancedPricingConfig;
  try {
    const parsed = JSON.parse(raw) as Partial<AdvancedPricingConfig>;
    return {
      materialProfiles: parsed.materialProfiles?.length ? parsed.materialProfiles : defaultAdvancedPricingConfig.materialProfiles,
      installationProfiles: parsed.installationProfiles?.length ? parsed.installationProfiles : defaultAdvancedPricingConfig.installationProfiles,
      cityProfiles: parsed.cityProfiles?.length ? parsed.cityProfiles : defaultAdvancedPricingConfig.cityProfiles,
      productMultipliers: { ...defaultAdvancedPricingConfig.productMultipliers, ...parsed.productMultipliers },
    };
  } catch {
    return defaultAdvancedPricingConfig;
  }
}

export function writeAdvancedPricingConfig(config: AdvancedPricingConfig) {
  window.localStorage.setItem(storageKey, JSON.stringify(config));
  window.dispatchEvent(new Event('kikeled-pricing-config-updated'));
}

export function resetAdvancedPricingConfig() {
  window.localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event('kikeled-pricing-config-updated'));
}

export function calculateAdvancedQuote(input: {
  service: Service | undefined;
  pricingRules: PricingRule[];
  width: number;
  height: number;
  quantity: number;
  materialProfile: MaterialPricingProfile;
  installationProfile: InstallationPricingProfile;
  cityProfile: CityPricingProfile;
  lighting: boolean;
  transport: boolean;
  discount: number;
  productMultipliers?: Record<string, number>;
}) {
  const { service, pricingRules, width, height, quantity, materialProfile, installationProfile, cityProfile, lighting, transport, discount } = input;
  if (!service) {
    return { base: 0, productAdjustment: 0, materialCost: 0, lightingCost: 0, installationCost: 0, transportCost: 0, unitPrice: 0, subtotal: 0, tax: 0, total: 0 };
  }

  const maxSize = Math.max(width, height);
  const rule = pricingRules.find(
    (item) => item.serviceId === service.id && maxSize >= item.minMeasure && (item.maxMeasure === null || maxSize <= item.maxMeasure),
  );
  const rulePrice = rule && rule.price > 0 ? rule.price : service.basePrice;
  const areaFactor = Math.max((width * height) / (18 * 18), 1);
  const sizeAdjustedBase = rule ? rulePrice : Math.round(rulePrice * areaFactor);
  const productMultiplier = (input.productMultipliers ?? defaultAdvancedPricingConfig.productMultipliers)[service.categoryId] ?? 1;
  const productAdjustedBase = Math.round(sizeAdjustedBase * productMultiplier);
  const productAdjustment = productAdjustedBase - sizeAdjustedBase;
  const materialCost = Math.round(productAdjustedBase * materialProfile.multiplier + materialProfile.fixedFee);
  const lightingCost = lighting ? Math.round(1200 + maxSize * 55) : 0;
  const installationCost = Math.round((installationProfile.baseFee + productAdjustedBase * installationProfile.percent) * cityProfile.installationMultiplier);
  const transportCost = transport ? cityProfile.transportFee : 0;
  const unitPrice = productAdjustedBase + materialCost + lightingCost + installationCost + transportCost;
  const subtotal = unitPrice * quantity;
  const tax = Math.round(subtotal * 0.18);
  const total = Math.max(subtotal + tax - discount, 0);

  return { base: sizeAdjustedBase, productAdjustment, materialCost, lightingCost, installationCost, transportCost, unitPrice, subtotal, tax, total };
}
