import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brand, brandStats } from '../../lib/brand';

export function LandingHero() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div>
          <p className="label mb-5">{brand.commercialName}</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
            Letreros que convierten tu marca en una presencia imposible de ignorar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-soft">{brand.positioning}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/cotizar" className="btn-primary">
              Cotizar mi letrero
              <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link to="/catalogo" className="btn-secondary">
              Ver catalogo
            </Link>
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {brandStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-soft">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090b10] p-6 shadow-soft">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_26%),radial-gradient(circle_at_80%_30%,rgba(244,63,94,0.16),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(132,204,22,0.12),transparent_26%)]" />
          <div className="relative space-y-5">
            <div className="rounded-2xl border border-cyan-300/20 bg-black/45 p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <Sparkles size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">RGB Control</span>
              </div>
              <p className="mt-5 text-4xl font-semibold text-white">Logo plano</p>
              <p className="mt-2 text-sm text-soft">se convierte en letrero LED, caja de luz, acrilico o fachada visual.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {['Diseno', 'Fabricacion', 'Entrega', 'Contenido'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{item}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10">
                    <div className="h-full w-4/5 rounded-full bg-cyan-300" />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-lime-100">
              <MessageCircle size={18} />
              <p className="mt-3 text-sm">Envia logo, medida y foto del espacio. El equipo prepara una ruta clara para cotizar.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
