import { Link } from 'react-router-dom';
import { packages } from '../../lib/packages';

export function LandingPackages() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="label mb-3">Paquetes</p>
          <h2 className="text-3xl font-semibold text-white md:text-5xl">Opciones para empezar rapido.</h2>
        </div>
        <Link to="/catalogo" className="btn-secondary">
          Explorar productos
        </Link>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {packages.map((item) => (
          <article key={item.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-2xl font-semibold text-white">{item.name}</p>
            <p className="mt-2 text-lg text-cyan-100">{item.price}</p>
            <p className="mt-4 text-sm leading-7 text-soft">{item.description}</p>
            <div className="mt-5 space-y-2">
              {item.includes.map((line) => (
                <p key={line} className="text-sm text-soft">- {line}</p>
              ))}
            </div>
            <Link to={`/paquetes/${item.slug}`} className="btn-secondary mt-5 w-full">Ver que incluye</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
