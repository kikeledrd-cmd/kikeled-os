import { useSearchParams } from 'react-router-dom';
import { QuoteForm } from '../../components/landing/QuoteForm';
import { brand } from '../../lib/brand';

export function QuotePage() {
  const [searchParams] = useSearchParams();

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(0,214,255,0.18),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(255,30,30,0.14),transparent_28%)]" />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        <div>
          <p className="label mb-3">Cotizar proyecto</p>
          <h1 className="text-4xl font-semibold text-white md:text-6xl">{brand.tagline}</h1>
          <p className="mt-5 text-base leading-8 text-soft">{brand.description}</p>
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-cyan-50">
            El formulario crea un lead real dentro de Kikeled OS para seguimiento, cotización y producción.
          </p>
        </div>
        <QuoteForm selectedProduct={searchParams.get('producto') ?? ''} />
      </div>
    </section>
  );
}
