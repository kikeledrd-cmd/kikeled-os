import type { Customer, Invoice, Order, ProductionProcess, QualityControl, Quote, TechnicalSheet } from '../types/entities';

export const productionProcessTemplates = [
  'Diseno / preparacion',
  'Corte / CNC / laser',
  'Doblado / termoformado',
  'Ensamble',
  'Iluminacion / cableado',
  'Acabados / limpieza',
  'Control de calidad',
];

export function createDefaultProductionProcesses(): ProductionProcess[] {
  return productionProcessTemplates.map((process, index) => ({
    id: `process-${index + 1}`,
    process,
    responsible: '',
    startDate: '',
    endDate: '',
    status: 'pendiente',
    observations: '',
  }));
}

export function createDefaultQualityControl(): QualityControl {
  return {
    medidasCorrectas: false,
    corteLimpio: false,
    iluminacionFunciona: false,
    cableadoSeguro: false,
    fijacionesCorrectas: false,
    acabadoFinal: false,
    limpiezaGeneral: false,
    revisadoPor: '',
    fechaRevision: '',
    observaciones: '',
  };
}

function quoteDescription(quote?: Quote | null) {
  if (!quote) return '';
  return quote.items.map((item) => `${item.description} (${item.measures || 'sin medidas'})`).join('\n');
}

function quoteMeasures(quote?: Quote | null) {
  return quote?.items[0]?.measures ?? '';
}

export function buildTechnicalSheet(order: Order, customer?: Customer, quote?: Quote | null, invoice?: Invoice | null): TechnicalSheet {
  const current = order.technicalSheet;
  return {
    tipoLetrero: current?.tipoLetrero ?? order.service,
    materialPrincipal: current?.materialPrincipal ?? '',
    ancho: current?.ancho ?? quoteMeasures(quote),
    alto: current?.alto ?? '',
    profundidad: current?.profundidad ?? '',
    distanciaVision: current?.distanciaVision ?? '',
    espesorMaterial: current?.espesorMaterial ?? '',
    iluminacion: current?.iluminacion ?? '',
    colorLuz: current?.colorLuz ?? '',
    voltaje: current?.voltaje ?? '12V',
    fuentePoder: current?.fuentePoder ?? '',
    cableado: current?.cableado ?? '',
    archivoRecibido: current?.archivoRecibido ?? (order.referenceFiles.length > 0),
    formatoArchivo: current?.formatoArchivo ?? '',
    observacionesDiseno: current?.observacionesDiseno ?? quoteDescription(quote),
    observacionesTecnicas: current?.observacionesTecnicas ?? order.technicalNotes,
    instalacionRequerida: current?.instalacionRequerida ?? Boolean(order.installationNotes),
    direccionInstalacion: current?.direccionInstalacion ?? customer?.address ?? '',
    fechaInstalacion: current?.fechaInstalacion ?? '',
    instalador: current?.instalador ?? '',
    estadoPago: current?.estadoPago ?? (invoice?.status ?? 'pendiente'),
    formaPago: current?.formaPago ?? (invoice?.paymentMethod ?? ''),
    montoTotal: current?.montoTotal ?? invoice?.total ?? quote?.total ?? 0,
    anticipo: current?.anticipo ?? invoice?.paidAmount ?? 0,
    saldo: current?.saldo ?? invoice?.balance ?? quote?.total ?? 0,
    notasGenerales: current?.notasGenerales ?? order.installationNotes,
    elaboradoPor: current?.elaboradoPor ?? order.owner,
    aprobadoPor: current?.aprobadoPor ?? 'Kikeled',
    locked: current?.locked ?? false,
    updatedAt: current?.updatedAt ?? order.createdAt,
  };
}

export function getOrderProcesses(order: Order): ProductionProcess[] {
  return order.productionProcesses?.length ? order.productionProcesses : createDefaultProductionProcesses();
}

export function getOrderQualityControl(order: Order): QualityControl {
  return order.qualityControl ?? createDefaultQualityControl();
}