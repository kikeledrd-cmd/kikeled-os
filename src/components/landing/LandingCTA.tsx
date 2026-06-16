import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brand } from '../../lib/brand';

export function LandingCTA() {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-8 lg:flex-row lg:items-center">
        <div>
          <p className="label mb-3">{brand.osName}</p>
          <h2 className="text-3xl font-semibold text-white">Tu logo puede brillar esta semana.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-soft">
            Envia la idea, medida o foto del espacio. El lead entra al CRM y el equipo puede darle seguimiento desde RGB Control.
          </p>
        </div>
        <Link to="/cotizar" className="btn-primary">
          Solicitar cotizacion
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>
    </section>
  );
}
