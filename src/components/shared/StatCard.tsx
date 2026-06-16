import type { LucideIcon } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="label">{label}</span>
        <span className="rounded-2xl border border-white/10 bg-white/5 p-2 text-glow">
          <Icon size={18} />
        </span>
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-soft">{hint}</p>
    </article>
  );
}
