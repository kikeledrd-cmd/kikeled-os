import { leadStatusLabels } from '../../lib/leadStatus';

const baseTone = {
  color: '#FFFFFF',
  borderColor: 'rgba(255, 255, 255, 0.18)',
  background: 'rgba(255, 255, 255, 0.08)',
};

const toneMap: Record<string, typeof baseTone> = {
  nuevo: { color: '#00D6FF', borderColor: 'rgba(0, 214, 255, 0.35)', background: 'rgba(0, 214, 255, 0.12)' },
  contactado: { color: '#2962FF', borderColor: 'rgba(41, 98, 255, 0.38)', background: 'rgba(41, 98, 255, 0.12)' },
  interesado: { color: '#00FF85', borderColor: 'rgba(0, 255, 133, 0.35)', background: 'rgba(0, 255, 133, 0.1)' },
  en_cotizacion: { color: '#FF8A00', borderColor: 'rgba(255, 138, 0, 0.35)', background: 'rgba(255, 138, 0, 0.12)' },
  negociacion: { color: '#E5FF00', borderColor: 'rgba(229, 255, 0, 0.35)', background: 'rgba(229, 255, 0, 0.1)' },
  aprobado: { color: '#00FF85', borderColor: 'rgba(0, 255, 133, 0.35)', background: 'rgba(0, 255, 133, 0.1)' },
  en_produccion: { color: '#FF1E1E', borderColor: 'rgba(255, 30, 30, 0.35)', background: 'rgba(255, 30, 30, 0.12)' },
  instalado: { color: '#00FF85', borderColor: 'rgba(0, 255, 133, 0.35)', background: 'rgba(0, 255, 133, 0.1)' },
  cerrado: baseTone,
  perdida: { color: '#FF1E1E', borderColor: 'rgba(255, 30, 30, 0.35)', background: 'rgba(255, 30, 30, 0.12)' },
  perdido: { color: '#FF1E1E', borderColor: 'rgba(255, 30, 30, 0.35)', background: 'rgba(255, 30, 30, 0.12)' },
  pendiente: { color: '#FF8A00', borderColor: 'rgba(255, 138, 0, 0.35)', background: 'rgba(255, 138, 0, 0.12)' },
  pagado: { color: '#00FF85', borderColor: 'rgba(0, 255, 133, 0.35)', background: 'rgba(0, 255, 133, 0.1)' },
  abonado: { color: '#00D6FF', borderColor: 'rgba(0, 214, 255, 0.35)', background: 'rgba(0, 214, 255, 0.12)' },
  rechazada: { color: '#FF1E1E', borderColor: 'rgba(255, 30, 30, 0.35)', background: 'rgba(255, 30, 30, 0.12)' },
  facturada: { color: '#E5FF00', borderColor: 'rgba(229, 255, 0, 0.35)', background: 'rgba(229, 255, 0, 0.1)' },
  diseno: { color: '#2962FF', borderColor: 'rgba(41, 98, 255, 0.38)', background: 'rgba(41, 98, 255, 0.12)' },
  corte: { color: '#00D6FF', borderColor: 'rgba(0, 214, 255, 0.35)', background: 'rgba(0, 214, 255, 0.12)' },
  impresion: { color: '#E5FF00', borderColor: 'rgba(229, 255, 0, 0.35)', background: 'rgba(229, 255, 0, 0.1)' },
  ensamblaje: { color: '#FF8A00', borderColor: 'rgba(255, 138, 0, 0.35)', background: 'rgba(255, 138, 0, 0.12)' },
  instalacion: { color: '#FF1E1E', borderColor: 'rgba(255, 30, 30, 0.35)', background: 'rgba(255, 30, 30, 0.12)' },
  entregado: { color: '#00FF85', borderColor: 'rgba(0, 255, 133, 0.35)', background: 'rgba(0, 255, 133, 0.1)' },
  cerrada: baseTone,
  Base: baseTone,
  Neon: { color: '#00D6FF', borderColor: 'rgba(0, 214, 255, 0.35)', background: 'rgba(0, 214, 255, 0.12)' },
  'RGB Elite': { color: '#FF1E1E', borderColor: 'rgba(255, 30, 30, 0.35)', background: 'rgba(255, 30, 30, 0.12)' },
};

function normalizeKey(label: string) {
  return label.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function StatusBadge({ label }: { label: string }) {
  const displayLabel = label in leadStatusLabels ? leadStatusLabels[label as keyof typeof leadStatusLabels] : label;
  const tone = toneMap[label] ?? toneMap[normalizeKey(label)] ?? baseTone;

  return (
    <span className="inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize" style={tone}>
      {displayLabel}
    </span>
  );
}
