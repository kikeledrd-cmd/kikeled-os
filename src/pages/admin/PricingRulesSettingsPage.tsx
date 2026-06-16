import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { defaultAdvancedPricingConfig, readAdvancedPricingConfig, resetAdvancedPricingConfig, writeAdvancedPricingConfig } from '../../lib/advancedPricing';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function PricingRulesSettingsPage() {
  const serviceCategories = useAppStore((state) => state.serviceCategories);
  const [config, setConfig] = useState(() => readAdvancedPricingConfig());
  const [saved, setSaved] = useState(false);

  function saveConfig() {
    writeAdvancedPricingConfig(config);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function resetConfig() {
    resetAdvancedPricingConfig();
    setConfig(defaultAdvancedPricingConfig);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function newId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reglas comerciales"
        title="Configuracion de precios"
        description="Ajusta materiales, instalacion, ciudades y multiplicadores sin tocar codigo."
        action={
          <Link to="/admin/configuracion" className="btn-secondary">
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" onClick={saveConfig}>
          <Save size={16} className="mr-2" />
          Guardar reglas
        </button>
        <button className="btn-secondary" onClick={resetConfig}>
          <RotateCcw size={16} className="mr-2" />
          Restablecer base
        </button>
        {saved && <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Reglas actualizadas</span>}
      </div>

      <SectionCard title="Materiales" description="Define perfiles que impactan el costo de materiales de cada cotizacion.">
        <div className="grid gap-4">
          {config.materialProfiles.map((profile, index) => (
            <div key={profile.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1.2fr,1.5fr,0.7fr,0.7fr,auto]">
              <input className="field" value={profile.label} onChange={(event) => {
                const next = [...config.materialProfiles];
                next[index] = { ...profile, label: event.target.value };
                setConfig({ ...config, materialProfiles: next });
              }} />
              <input className="field" value={profile.materials.join(', ')} onChange={(event) => {
                const next = [...config.materialProfiles];
                next[index] = { ...profile, materials: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) };
                setConfig({ ...config, materialProfiles: next });
              }} />
              <NumberField value={profile.multiplier} step={0.01} onChange={(value) => {
                const next = [...config.materialProfiles];
                next[index] = { ...profile, multiplier: value };
                setConfig({ ...config, materialProfiles: next });
              }} />
              <NumberField value={profile.fixedFee} step={50} onChange={(value) => {
                const next = [...config.materialProfiles];
                next[index] = { ...profile, fixedFee: value };
                setConfig({ ...config, materialProfiles: next });
              }} />
              <button className="btn-ghost" type="button" aria-label={`Eliminar ${profile.label}`} onClick={() => {
                setConfig({ ...config, materialProfiles: config.materialProfiles.filter((item) => item.id !== profile.id) });
              }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button className="btn-secondary w-fit" type="button" onClick={() => {
            setConfig({
              ...config,
              materialProfiles: [
                ...config.materialProfiles,
                { id: newId('material'), label: 'Nuevo material', materials: ['Material'], multiplier: 0.15, fixedFee: 0 },
              ],
            });
          }}>
            <Plus size={16} className="mr-2" />
            Agregar material
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Instalacion" description="Ajusta cargo base, porcentaje y notas de cada tipo de instalacion.">
        <div className="grid gap-4">
          {config.installationProfiles.map((profile, index) => (
            <div key={profile.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr,0.7fr,0.7fr,1.4fr,auto]">
              <input className="field" value={profile.label} onChange={(event) => {
                const next = [...config.installationProfiles];
                next[index] = { ...profile, label: event.target.value };
                setConfig({ ...config, installationProfiles: next });
              }} />
              <NumberField value={profile.baseFee} step={100} onChange={(value) => {
                const next = [...config.installationProfiles];
                next[index] = { ...profile, baseFee: value };
                setConfig({ ...config, installationProfiles: next });
              }} />
              <NumberField value={profile.percent} step={0.01} onChange={(value) => {
                const next = [...config.installationProfiles];
                next[index] = { ...profile, percent: value };
                setConfig({ ...config, installationProfiles: next });
              }} />
              <input className="field" value={profile.notes} onChange={(event) => {
                const next = [...config.installationProfiles];
                next[index] = { ...profile, notes: event.target.value };
                setConfig({ ...config, installationProfiles: next });
              }} />
              <button className="btn-ghost" type="button" aria-label={`Eliminar ${profile.label}`} onClick={() => {
                setConfig({ ...config, installationProfiles: config.installationProfiles.filter((item) => item.id !== profile.id) });
              }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button className="btn-secondary w-fit" type="button" onClick={() => {
            setConfig({
              ...config,
              installationProfiles: [
                ...config.installationProfiles,
                { id: newId('instalacion'), label: 'Nueva instalacion', baseFee: 0, percent: 0, notes: 'Describe alcance y condiciones.' },
              ],
            });
          }}>
            <Plus size={16} className="mr-2" />
            Agregar instalacion
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Ciudades" description="Transporte y multiplicador de instalacion por zona.">
        <div className="grid gap-4">
          {config.cityProfiles.map((profile, index) => (
            <div key={profile.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.4fr,0.8fr,0.8fr,auto]">
              <input className="field" value={profile.label} onChange={(event) => {
                const next = [...config.cityProfiles];
                next[index] = { ...profile, label: event.target.value };
                setConfig({ ...config, cityProfiles: next });
              }} />
              <NumberField value={profile.transportFee} step={100} onChange={(value) => {
                const next = [...config.cityProfiles];
                next[index] = { ...profile, transportFee: value };
                setConfig({ ...config, cityProfiles: next });
              }} />
              <NumberField value={profile.installationMultiplier} step={0.01} onChange={(value) => {
                const next = [...config.cityProfiles];
                next[index] = { ...profile, installationMultiplier: value };
                setConfig({ ...config, cityProfiles: next });
              }} />
              <button className="btn-ghost" type="button" aria-label={`Eliminar ${profile.label}`} onClick={() => {
                setConfig({ ...config, cityProfiles: config.cityProfiles.filter((item) => item.id !== profile.id) });
              }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button className="btn-secondary w-fit" type="button" onClick={() => {
            setConfig({
              ...config,
              cityProfiles: [
                ...config.cityProfiles,
                { id: newId('ciudad'), label: 'Nueva ciudad / zona', transportFee: 0, installationMultiplier: 1 },
              ],
            });
          }}>
            <Plus size={16} className="mr-2" />
            Agregar ciudad
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Multiplicadores por producto" description="Controla el ajuste por categoria antes de materiales, instalacion y ciudad.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serviceCategories.map((category) => (
            <label key={category.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="label mb-2 block">{category.name}</span>
              <NumberField value={config.productMultipliers[category.id] ?? 1} step={0.01} onChange={(value) => {
                setConfig({
                  ...config,
                  productMultipliers: { ...config.productMultipliers, [category.id]: value },
                });
              }} />
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function NumberField({ value, step, onChange }: { value: number; step: number; onChange: (value: number) => void }) {
  return (
    <input
      className="field"
      type="number"
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}
