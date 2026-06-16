const projects = [
  ['Barbería Imperial', 'Fachada ACM + letras 3D + instalación completa', 'Piantini'],
  ['Aura Beauty', 'Letrero circular LED interior + mockup de aprobación', 'Naco'],
  ['Sazón Capital', 'Caja de luz para fachada + conexión final', 'Piantini'],
];

export function ProjectsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="label mb-3">Galería</p>
      <h1 className="text-4xl font-semibold text-white">Proyectos que mezclan branding físico, presencia nocturna y ejecución precisa.</h1>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {projects.map(([title, detail, place], index) => (
          <article key={title} className="panel overflow-hidden">
            <div className={`h-56 ${index === 0 ? 'bg-gradient-to-br from-cyan-400/30 to-ink' : index === 1 ? 'bg-gradient-to-br from-lime-400/20 to-ink' : 'bg-gradient-to-br from-amber-400/20 to-ink'}`} />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm text-soft">{detail}</p>
              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-soft">{place}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
