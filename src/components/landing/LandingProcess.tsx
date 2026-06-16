import { Link } from 'react-router-dom';
import { processSteps } from '../../lib/services';

export function LandingProcess() {
  return (
    <section className="border-y border-white/10 bg-white/[0.03] px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr,1.1fr]">
        <div>
          <p className="label mb-3">Proceso comercial</p>
          <h2 className="text-3xl font-semibold text-white md:text-5xl">Del WhatsApp al taller con orden.</h2>
          <p className="mt-5 text-sm leading-7 text-soft">
            Kikeled OS captura la solicitud, RGB Control organiza la informacion y el equipo convierte cada lead en una propuesta clara.
          </p>
          <Link to="/cotizar" className="btn-primary mt-7">
            Empezar cotizacion
          </Link>
        </div>
        <div className="grid gap-3">
          {processSteps.map((step, index) => (
            <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-[#090b10] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink">
                {index + 1}
              </span>
              <p className="text-sm leading-7 text-soft">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
