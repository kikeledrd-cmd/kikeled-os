import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ImageDown, Printer } from 'lucide-react';
import { brand } from '../../lib/brand';
import { buildTechnicalSheet, getOrderProcesses, getOrderQualityControl } from '../../lib/technicalSheet';
import { currency, shortDate } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import type { QualityControl } from '../../types/entities';

const qualityItems: Array<{ key: keyof Omit<QualityControl, 'revisadoPor' | 'fechaRevision' | 'observaciones'>; label: string }> = [
  { key: 'medidasCorrectas', label: 'Medidas correctas' },
  { key: 'corteLimpio', label: 'Corte limpio' },
  { key: 'iluminacionFunciona', label: 'Iluminacion funciona' },
  { key: 'cableadoSeguro', label: 'Cableado seguro' },
  { key: 'fijacionesCorrectas', label: 'Fijaciones correctas' },
  { key: 'acabadoFinal', label: 'Acabado final' },
  { key: 'limpiezaGeneral', label: 'Limpieza general' },
];

export function TechnicalSheetPrintPage() {
  const { orderId = '' } = useParams();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const { orders, customers, quotes, invoices, materials, orderMaterials } = useAppStore((state) => state);
  const order = orders.find((item) => item.id === orderId);
  const customer = customers.find((item) => item.id === order?.customerId);
  const quote = order?.quoteId ? quotes.find((item) => item.id === order.quoteId) : null;
  const invoice = invoices.find((item) => item.orderId === order?.id || item.quoteId === order?.quoteId);

  if (!order || !customer) {
    return <div className="min-h-screen bg-white p-10 text-black">Orden no encontrada.</div>;
  }

  const sheet = buildTechnicalSheet(order, customer, quote, invoice);
  const processes = getOrderProcesses(order);
  const quality = getOrderQualityControl(order);
  const assignedMaterials = orderMaterials.filter((item) => item.orderId === order.id);
  const orderNumber = order.number;

  async function downloadPng() {
    if (!sheetRef.current) return;
    setExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(sheetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `ficha-tecnica-${orderNumber}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-6 text-black md:p-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to={`/admin/ordenes/${order.id}`} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm">
            <ArrowLeft size={16} className="mr-2 inline-block" />
            Volver a orden
          </Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="rounded-xl bg-black px-4 py-2 text-sm text-white">
              <Printer size={16} className="mr-2 inline-block" />
              Descargar PDF / imprimir
            </button>
            <button onClick={() => void downloadPng()} className="rounded-xl border border-cyan-300/50 bg-cyan-50 px-4 py-2 text-sm text-cyan-950">
              <ImageDown size={16} className="mr-2 inline-block" />
              {exporting ? 'Creando PNG...' : 'Descargar PNG'}
            </button>
          </div>
        </div>

        <div ref={sheetRef} className="bg-white shadow-2xl shadow-black/10 print:shadow-none">
          <article className="mx-auto min-h-[11in] w-full max-w-[8.5in] bg-white p-[0.38in] text-neutral-950">
            <header className="border-b-4 border-neutral-950 pb-4">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img src="/brand/kikeled-logo.png" alt="Kikeled" className="h-16 w-16 rounded-xl object-cover" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">{brand.commercialName}</p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight">Ficha tecnica de produccion</h1>
                    <p className="mt-1 text-sm text-neutral-600">Documento interno para taller, control de calidad, entrega e instalacion.</p>
                  </div>
                </div>
                <div className="min-w-44 rounded-xl border-2 border-neutral-950 p-4 text-right">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Orden</p>
                  <p className="text-2xl font-black">{order.number}</p>
                  <p className="mt-1 text-xs text-neutral-600">Estado: {order.status}</p>
                  <p className="text-xs text-neutral-600">Avance: {order.progress}%</p>
                </div>
              </div>
            </header>

            <section className="mt-5 grid grid-cols-4 gap-3">
              <Box title="Ingreso" value={shortDate(order.startDate)} />
              <Box title="Promesa" value={shortDate(order.promiseDate)} />
              <Box title="Entrega" value={shortDate(sheet.fechaInstalacion || order.promiseDate)} />
              <Box title="Prioridad" value={order.priority} />
            </section>

            <section className="mt-5 grid grid-cols-2 gap-4">
              <Panel title="Cliente">
                <Line label="Empresa" value={customer.business} />
                <Line label="Contacto" value={customer.name} />
                <Line label="WhatsApp" value={customer.whatsapp} />
                <Line label="Correo" value={customer.email} />
                <Line label="Direccion" value={customer.address} />
              </Panel>
              <Panel title="Pago y comercial">
                <Line label="Cotizacion" value={quote?.number ?? 'Sin cotizacion'} />
                <Line label="Factura" value={invoice?.number ?? 'Sin factura'} />
                <Line label="Total" value={currency(sheet.montoTotal)} />
                <Line label="Anticipo" value={currency(sheet.anticipo)} />
                <Line label="Saldo" value={currency(sheet.saldo)} />
                <Line label="Estado pago" value={sheet.estadoPago} />
              </Panel>
            </section>

            <section className="mt-5">
              <Panel title="Producto y medidas">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  <Line label="Tipo" value={sheet.tipoLetrero} />
                  <Line label="Material" value={sheet.materialPrincipal} />
                  <Line label="Espesor" value={sheet.espesorMaterial} />
                  <Line label="Ancho" value={sheet.ancho} />
                  <Line label="Alto" value={sheet.alto} />
                  <Line label="Profundidad" value={sheet.profundidad} />
                  <Line label="Distancia vision" value={sheet.distanciaVision} />
                  <Line label="Iluminacion" value={sheet.iluminacion} />
                  <Line label="Color luz" value={sheet.colorLuz} />
                  <Line label="Voltaje" value={sheet.voltaje} />
                  <Line label="Fuente" value={sheet.fuentePoder} />
                  <Line label="Cableado" value={sheet.cableado} />
                </div>
              </Panel>
            </section>

            <section className="mt-5 grid grid-cols-2 gap-4">
              <Panel title="Diseno / archivos">
                <Line label="Archivo recibido" value={sheet.archivoRecibido ? 'Si' : 'No'} />
                <Line label="Formato" value={sheet.formatoArchivo || 'Por definir'} />
                <Paragraph value={sheet.observacionesDiseno || 'Sin observaciones de diseno.'} />
              </Panel>
              <Panel title="Instalacion / entrega">
                <Line label="Instalacion" value={sheet.instalacionRequerida ? 'Requerida' : 'No requerida'} />
                <Line label="Fecha" value={shortDate(sheet.fechaInstalacion)} />
                <Line label="Instalador" value={sheet.instalador || 'Por definir'} />
                <Paragraph value={sheet.direccionInstalacion || sheet.notasGenerales || 'Sin notas de instalacion.'} />
              </Panel>
            </section>

            <section className="mt-5">
              <Panel title="Materiales de la orden">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-y border-neutral-300 bg-neutral-100 text-left uppercase tracking-[0.12em] text-neutral-500">
                      <th className="px-2 py-2">Material</th>
                      <th className="px-2 py-2">Codigo</th>
                      <th className="px-2 py-2">Cantidad</th>
                      <th className="px-2 py-2">Ubicacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedMaterials.map((assigned) => {
                      const material = materials.find((item) => item.id === assigned.materialId);
                      return (
                        <tr key={assigned.id} className="border-b border-neutral-200">
                          <td className="px-2 py-2 font-semibold">{material?.name ?? assigned.materialId}</td>
                          <td className="px-2 py-2">{material?.code ?? 'N/A'}</td>
                          <td className="px-2 py-2">{assigned.quantity} {material?.unit ?? ''}</td>
                          <td className="px-2 py-2">{material?.location ?? 'N/A'}</td>
                        </tr>
                      );
                    })}
                    {assignedMaterials.length === 0 && (
                      <tr><td className="px-2 py-2 text-neutral-600" colSpan={4}>Sin materiales asignados.</td></tr>
                    )}
                  </tbody>
                </table>
              </Panel>
            </section>

            <section className="mt-5">
              <Panel title="Proceso de produccion">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-y border-neutral-300 bg-neutral-100 text-left uppercase tracking-[0.12em] text-neutral-500">
                      <th className="px-2 py-2">Proceso</th>
                      <th className="px-2 py-2">Responsable</th>
                      <th className="px-2 py-2">Inicio</th>
                      <th className="px-2 py-2">Fin</th>
                      <th className="px-2 py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((process) => (
                      <tr key={process.id} className="border-b border-neutral-200">
                        <td className="px-2 py-2 font-semibold">{process.process}</td>
                        <td className="px-2 py-2">{process.responsible || '-'}</td>
                        <td className="px-2 py-2">{shortDate(process.startDate)}</td>
                        <td className="px-2 py-2">{shortDate(process.endDate)}</td>
                        <td className="px-2 py-2">{process.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </section>

            <section className="mt-5 grid grid-cols-2 gap-4">
              <Panel title="Control de calidad">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {qualityItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <span className={`grid h-4 w-4 place-items-center border border-neutral-500 text-[10px] ${quality[item.key] ? 'bg-neutral-950 text-white' : ''}`}>{quality[item.key] ? '?' : ''}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Line label="Revisado por" value={quality.revisadoPor || 'Por definir'} />
                  <Line label="Fecha" value={shortDate(quality.fechaRevision)} />
                </div>
                <Paragraph value={quality.observaciones || 'Sin observaciones de calidad.'} />
              </Panel>
              <Panel title="Observaciones finales">
                <Paragraph value={sheet.observacionesTecnicas || 'Sin observaciones tecnicas.'} />
                <Paragraph value={sheet.notasGenerales || 'Sin notas generales.'} />
              </Panel>
            </section>

            <section className="mt-8 grid grid-cols-3 gap-4">
              <Signature label={`Elaborado por: ${sheet.elaboradoPor || 'Produccion'}`} />
              <Signature label={`Aprobado por: ${sheet.aprobadoPor || 'Kikeled'}`} />
              <Signature label="Recibido por cliente" />
            </section>

            <footer className="mt-6 border-t border-neutral-300 pt-3 text-center text-[10px] uppercase tracking-[0.14em] text-neutral-500">
              {brand.commercialName} - {brand.whatsapp} - Ficha generada desde Kikeled OS
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}

function Box({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-neutral-300 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{title}</p>
      <p className="mt-1 text-sm font-bold">{value || '-'}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-neutral-300 p-4">
      <h2 className="mb-3 border-b border-neutral-300 pb-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-600">{title}</h2>
      {children}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs leading-5"><span className="font-black text-neutral-600">{label}:</span> {value || '-'}</p>
  );
}

function Paragraph({ value }: { value: string }) {
  return <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-neutral-700">{value}</p>;
}

function Signature({ label }: { label: string }) {
  return (
    <div>
      <div className="h-14 border-b border-neutral-500" />
      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    </div>
  );
}