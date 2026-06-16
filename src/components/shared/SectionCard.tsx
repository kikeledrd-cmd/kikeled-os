import type { ReactNode } from 'react';

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="k-admin-card panel p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-soft">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
