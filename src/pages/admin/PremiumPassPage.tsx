import { FormEvent } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export function PremiumPassPage() {
  const { premiumPlans, premiumMemberships, customers, assignPremium, usePremiumBenefit } = useAppStore((state) => state);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Fidelización" title="Premium Pass" description="Planes, vigencia, beneficios y uso real conectados al historial del cliente." />
      <div className="grid gap-6 lg:grid-cols-3">
        {premiumPlans.map((plan) => (
          <SectionCard key={plan.id} title={plan.name} description={plan.description}>
            <p className="text-3xl font-semibold text-white">{plan.discountPercent}%</p>
            <p className="mt-2 text-sm text-soft">Monto umbral: {currency(plan.thresholdAmount)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.benefits.map((benefit) => <span key={benefit} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-soft">{benefit}</span>)}
            </div>
          </SectionCard>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <SectionCard title="Membresías activas" description="Seguimiento del valor premium por cliente.">
          <div className="space-y-4">
            {premiumMemberships.map((membership) => {
              const customer = customers.find((item) => item.id === membership.customerId);
              const plan = premiumPlans.find((item) => item.id === membership.planId);
              return (
                <div key={membership.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{customer?.business}</p>
                      <p className="text-sm text-soft">QR: {membership.qrCode}</p>
                    </div>
                    <StatusBadge label={plan?.name ?? 'Base'} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-soft">
                    <p>Vigencia: {shortDate(membership.endDate)}</p>
                    <p>Puntos: {membership.points}</p>
                    <p>Beneficios usados: {membership.usedBenefits}</p>
                  </div>
                  <button className="btn-secondary mt-4" onClick={() => usePremiumBenefit(membership.id, membership.activeBenefits[0] ?? 'descuento porcentual', 'Uso registrado desde panel premium.')}>
                    Registrar beneficio usado
                  </button>
                </div>
              );
            })}
          </div>
        </SectionCard>
        <SectionCard title="Asignar membresía" description="Activa por compra, frecuencia o decisión manual.">
          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const customerId = String(formData.get('customerId'));
              if (!customerId) return;
              const plan = premiumPlans.find((item) => item.id === String(formData.get('planId')));
              assignPremium({
                customerId,
                planId: String(formData.get('planId')),
                source: String(formData.get('source')) as 'compra directa' | 'monto acumulado' | 'frecuencia de compra' | 'manual',
                startDate: String(formData.get('startDate')),
                endDate: String(formData.get('endDate')),
                points: Number(formData.get('points')),
                spentAmount: Number(formData.get('spentAmount')),
                activeBenefits: plan?.benefits.slice(0, 3) ?? [],
                usedBenefits: 0,
              });
              event.currentTarget.reset();
            }}
            className="grid gap-3"
          >
            <select name="customerId" className="field" defaultValue="" required>
              <option value="">Selecciona cliente</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.business}</option>)}
            </select>
            <select name="planId" className="field" defaultValue={premiumPlans[0]?.id}>{premiumPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select>
            <select name="source" className="field" defaultValue="manual"><option value="compra directa">compra directa</option><option value="monto acumulado">monto acumulado</option><option value="frecuencia de compra">frecuencia de compra</option><option value="manual">manual</option></select>
            <input name="startDate" className="field" type="date" required />
            <input name="endDate" className="field" type="date" required />
            <input name="points" className="field" type="number" placeholder="Puntos" required />
            <input name="spentAmount" className="field" type="number" placeholder="Gasto acumulado" required />
            <button className="btn-primary" type="submit">Activar Premium Pass</button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
