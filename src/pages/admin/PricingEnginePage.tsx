import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { ShellTable } from '../../components/shared/ShellTable';
import {
  calculateAdvancedQuote,
  productPricingPresets,
  readAdvancedPricingConfig,
  type ProductPricingPreset,
} from '../../lib/advancedPricing';
import { currency } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

type DraftQuoteItem = {
  id: string;
  serviceId: string;
  description: string;
  measures: string;
  quantity: number;
  materials: string[];
  lighting: boolean;
  designIncluded: boolean;
  installationIncluded: boolean;
  transportIncluded: boolean;
  unitPrice: number;
};

function defaultPreset() {
  return productPricingPresets[0];
}

export function PricingEnginePage() {
  const { services, pricingRules, customers, addQuote } = useAppStore((state) => state);
  const navigate = useNavigate();
  const [pricingConfig, setPricingConfig] = useState(() => readAdvancedPricingConfig());
  const [customerId, setCustomerId] = useState('');
  const [presetId, setPresetId] = useState(defaultPreset().id);
  const [serviceId, setServiceId] = useState(defaultPreset().serviceId);
  const [description, setDescription] = useState(defaultPreset().description);
  const [width, setWidth] = useState(defaultPreset().width);
  const [height, setHeight] = useState(defaultPreset().height);
  const [quantity, setQuantity] = useState(defaultPreset().quantity);
  const [materialProfileId, setMaterialProfileId] = useState(defaultPreset().materialProfileId);
  const [installationProfileId, setInstallationProfileId] = useState(defaultPreset().installationProfileId);
  const [cityProfileId, setCityProfileId] = useState(defaultPreset().cityProfileId);
  const [transport, setTransport] = useState(defaultPreset().transport);
  const [lighting, setLighting] = useState(defaultPreset().lighting);
  const [materials, setMaterials] = useState('');
  const [discount, setDiscount] = useState(0);
  const [followUp, setFollowUp] = useState('Revisar y enviar al cliente.');
  const [observations, setObservations] = useState('Generada desde motor de precios.');
  const [items, setItems] = useState<DraftQuoteItem[]>([]);

  const selectedService = services.find((item) => item.id === serviceId);
  const selectedMaterialProfile = pricingConfig.materialProfiles.find((item) => item.id === materialProfileId) ?? pricingConfig.materialProfiles[0];
  const selectedInstallationProfile = pricingConfig.installationProfiles.find((item) => item.id === installationProfileId) ?? pricingConfig.installationProfiles[0];
  const selectedCityProfile = pricingConfig.cityProfiles.find((item) => item.id === cityProfileId) ?? pricingConfig.cityProfiles[0];
  const materialList = materials || selectedMaterialProfile.materials.join(', ');

  useEffect(() => {
    const refresh = () => setPricingConfig(readAdvancedPricingConfig());
    window.addEventListener('kikeled-pricing-config-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('kikeled-pricing-config-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const quoteBreakdown = useMemo(() => calculateAdvancedQuote({
    service: selectedService,
    pricingRules,
    width,
    height,
    quantity,
    materialProfile: selectedMaterialProfile,
    installationProfile: selectedInstallationProfile,
    cityProfile: selectedCityProfile,
    lighting,
    transport,
    discount: 0,
    productMultipliers: pricingConfig.productMultipliers,
  }), [height, lighting, pricingConfig.productMultipliers, pricingRules, quantity, selectedCityProfile, selectedInstallationProfile, selectedMaterialProfile, selectedService, transport, width]);

  const quoteTotals = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    return { subtotal, tax, total: Math.max(subtotal + tax - discount, 0) };
  }, [discount, items]);

  function applyPreset(preset: ProductPricingPreset) {
    setPresetId(preset.id);
    setServiceId(preset.serviceId);
    setDescription(preset.description);
    setWidth(preset.width);
    setHeight(preset.height);
    setQuantity(preset.quantity);
    setMaterialProfileId(preset.materialProfileId);
    setInstallationProfileId(preset.installationProfileId);
    setCityProfileId(preset.cityProfileId);
    setLighting(preset.lighting);
    setTransport(preset.transport);
    setMaterials('');
  }

  function addDraftItem() {
    if (!selectedService) return;
    setItems((current) => [
      ...current,
      {
        id: `draft-${Date.now()}-${current.length}`,
        serviceId,
        description: description || selectedService.name,
        measures: `${width}x${height}`,
        quantity,
        materials: materialList.split(',').map((value) => value.trim()).filter(Boolean),
        lighting,
        designIncluded: true,
        installationIncluded: selectedInstallationProfile.id !== 'sin-instalacion',
        transportIncluded: transport,
        unitPrice: quoteBreakdown.unitPrice,
      },
    ]);
  }

  async function handleConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || items.length === 0) return;
    const quoteId = await addQuote({
      customerId,
      items,
      estimatedDate: new Date().toISOString().slice(0, 10),
      observations,
      discount,
      status: 'borrador',
      followUp,
    });
    navigate(`/admin/cotizaciones/${quoteId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cotizador profesional"
        title="Motor de Precios"
        description="Arma cotizaciones con varios items, presets por producto y reglas avanzadas."
      />

      <form onSubmit={handleConvert} className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
        <div className="space-y-6">
          <SectionCard title="Cliente y preset" description="Selecciona un cliente y carga una base de producto.">
            <div className="grid gap-4">
              <select className="field" value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
                <option value="">Selecciona cliente</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.business}</option>)}
              </select>
              <select className="field" value={presetId} onChange={(event) => {
                const preset = productPricingPresets.find((item) => item.id === event.target.value);
                if (preset) applyPreset(preset);
              }}>
                {productPricingPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
              </select>
            </div>
          </SectionCard>

          <SectionCard title="Item actual" description="Ajusta producto, medidas y reglas antes de agregarlo a la cotizacion.">
            <div className="grid gap-4">
              <select className="field" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
              <input className="field" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripcion del item" />
              <div className="grid gap-3 md:grid-cols-3">
                <input className="field" type="number" min={1} value={width} onChange={(event) => setWidth(Number(event.target.value))} placeholder="Ancho" />
                <input className="field" type="number" min={1} value={height} onChange={(event) => setHeight(Number(event.target.value))} placeholder="Alto" />
                <input className="field" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} placeholder="Cantidad" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <select className="field" value={materialProfileId} onChange={(event) => setMaterialProfileId(event.target.value)}>
                  {pricingConfig.materialProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
                </select>
                <select className="field" value={installationProfileId} onChange={(event) => setInstallationProfileId(event.target.value)}>
                  {pricingConfig.installationProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
                </select>
                <select className="field" value={cityProfileId} onChange={(event) => setCityProfileId(event.target.value)}>
                  {pricingConfig.cityProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
                </select>
              </div>
              <input className="field" value={materialList} onChange={(event) => setMaterials(event.target.value)} placeholder="Materiales separados por coma" />
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                  <input checked={transport} onChange={() => setTransport((value) => !value)} type="checkbox" />
                  Transporte
                </label>
                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                  <input checked={lighting} onChange={() => setLighting((value) => !value)} type="checkbox" />
                  Iluminacion
                </label>
              </div>
              <button className="btn-secondary" type="button" onClick={addDraftItem}>
                <Plus size={16} className="mr-2" />
                Agregar item
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Resultado del item" description="Desglose del item antes de agregarlo.">
            <div className="space-y-3 text-sm text-soft">
              <div className="rounded-3xl border border-glow/20 bg-glow/10 p-6">
                <p className="label mb-3">Unitario calculado</p>
                <p className="text-4xl font-semibold text-white">{currency(quoteBreakdown.unitPrice)}</p>
              </div>
              <Row label="Base por producto" value={currency(quoteBreakdown.base)} />
              <Row label="Ajuste producto" value={currency(quoteBreakdown.productAdjustment)} />
              <Row label="Materiales" value={currency(quoteBreakdown.materialCost)} />
              <Row label="Iluminacion" value={currency(quoteBreakdown.lightingCost)} />
              <Row label="Instalacion" value={currency(quoteBreakdown.installationCost)} />
              <Row label="Transporte" value={currency(quoteBreakdown.transportCost)} />
            </div>
          </SectionCard>

          <SectionCard title="Cotizacion armada" description="Items que se enviaran a la cotizacion final.">
            <ShellTable columns={['Item', 'Cant.', 'Unitario', '']}>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{item.description}</p>
                    <p className="text-sm text-soft">{item.measures}</p>
                  </td>
                  <td className="px-4 py-3 text-soft">{item.quantity}</td>
                  <td className="px-4 py-3 text-soft">{currency(item.unitPrice)}</td>
                  <td className="px-4 py-3">
                    <button className="btn-ghost" type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </ShellTable>
            <div className="mt-5 space-y-3">
              <input className="field w-full" type="number" min={0} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} placeholder="Descuento manual" />
              <input className="field w-full" value={followUp} onChange={(event) => setFollowUp(event.target.value)} placeholder="Seguimiento comercial" />
              <textarea className="field w-full" rows={3} value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Observaciones" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-soft">
                <Row label="Subtotal" value={currency(quoteTotals.subtotal)} />
                <Row label="ITBIS" value={currency(quoteTotals.tax)} />
                <Row label="Descuento" value={currency(discount)} />
                <div className="mt-3 border-t border-white/10 pt-3">
                  <Row label="Total" value={currency(quoteTotals.total)} strong />
                </div>
              </div>
              <button className="btn-primary w-full" type="submit" disabled={!customerId || items.length === 0}>Crear cotizacion</button>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <strong className={strong ? 'text-xl text-white' : 'text-white'}>{value}</strong>
    </div>
  );
}
