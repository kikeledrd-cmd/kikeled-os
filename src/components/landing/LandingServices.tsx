import { services } from '../../lib/services';

export function LandingServices() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="max-w-3xl">
        <p className="label mb-3">Servicios</p>
        <h2 className="text-3xl font-semibold text-white md:text-5xl">Todo lo que un negocio necesita para verse mas profesional.</h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <article key={service.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-soft">{service.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
