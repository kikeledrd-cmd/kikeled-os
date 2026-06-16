import type { LeadStatus } from '../types/entities.js';

export const leadStatusFlow: LeadStatus[] = [
  'nuevo',
  'contactado',
  'en_cotizacion',
  'aprobado',
  'en_produccion',
  'instalado',
  'cerrado',
  'perdido',
];

export const leadStatusLabels: Record<LeadStatus, string> = {
  nuevo: 'Nuevo lead',
  contactado: 'Contactado',
  en_cotizacion: 'En cotizacion',
  aprobado: 'Aprobado',
  en_produccion: 'En produccion',
  instalado: 'Instalado',
  cerrado: 'Cerrado',
  perdido: 'Perdido',
};

export function normalizeLeadStatus(value: string): LeadStatus {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

  if (normalized === 'en_contacto' || normalized === 'interesado') return 'contactado';
  if (normalized === 'cotizacion_enviada' || normalized === 'en_cotizacion') return 'en_cotizacion';
  if (normalized === 'negociacion') return 'en_cotizacion';
  if (normalized === 'en_produccion') return 'en_produccion';
  if (normalized === 'instalacion' || normalized === 'instalado') return 'instalado';
  if (normalized === 'cerrada' || normalized === 'cerrado') return 'cerrado';
  if (normalized === 'perdida' || normalized === 'perdido') return 'perdido';
  if (normalized === 'aprobado') return 'aprobado';
  return 'nuevo';
}
