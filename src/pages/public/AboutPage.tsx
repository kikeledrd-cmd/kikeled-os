export function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="label mb-3">Sobre Kikeled</p>
      <h1 className="text-4xl font-semibold text-white">Fabricación visual con criterio comercial, acabado premium y ejecución hecha para durar.</h1>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          ['Especialidad', 'LED, fachadas, acrílico, vinil, coroplast, panaflex y proyectos personalizados.'],
          ['Proceso', 'Levantamiento, propuesta, diseño, fabricación, instalación y seguimiento posventa.'],
          ['Diferencial', 'Cada cliente se gestiona con historial, beneficios y control total del ciclo comercial.'],
        ].map(([title, copy]) => (
          <div key={title} className="panel p-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-soft">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
