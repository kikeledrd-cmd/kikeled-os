import { cn } from '../../lib/utils';
import { leadStatusLabels } from '../../lib/leadStatus';

const toneMap: Record<string, string> = {
  nuevo: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  contactado: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  interesado: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  en_cotizacion: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  negociación: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  aprobado: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  en_produccion: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30',
  instalado: 'bg-lime-500/15 text-lime-300 border-lime-400/30',
  cerrado: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  perdida: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  perdido: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  pendiente: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  pagado: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  abonado: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  rechazada: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  facturada: 'bg-lime-500/15 text-lime-300 border-lime-400/30',
  'convertida en orden': 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30',
  diseño: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  corte: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  impresión: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  ensamblaje: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
  'listo para instalar': 'bg-lime-500/15 text-lime-300 border-lime-400/30',
  instalación: 'bg-orange-500/15 text-orange-300 border-orange-400/30',
  entregado: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  cerrada: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  Base: 'bg-slate-500/15 text-slate-200 border-slate-400/30',
  Neon: 'bg-glow/15 text-cyan-200 border-cyan-400/30',
  'RGB Elite': 'bg-rose-500/15 text-rose-200 border-rose-400/30',
};

export function StatusBadge({ label }: { label: string }) {
  const displayLabel = label in leadStatusLabels ? leadStatusLabels[label as keyof typeof leadStatusLabels] : label;
  return (
    <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize', toneMap[label] ?? 'border-white/10 bg-white/5 text-white')}>
      {displayLabel}
    </span>
  );
}
