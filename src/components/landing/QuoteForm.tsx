import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { defaultWebProducts } from '../../data/webContent';
import { apiCreatePublicLead, apiGetPublicProducts } from '../../lib/api';
import type { WebProduct } from '../../types/entities';

const urgencyOptions = ['Normal', 'Esta semana', 'Urgente', 'Solo explorando'];
const businessTypes = ['Restaurante', 'Barbería', 'Salón', 'Tienda', 'Oficina', 'Gaming/streaming', 'Emprendimiento', 'Otro'];

export function QuoteForm({ selectedProduct = '', compact = false }: { selectedProduct?: string; compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts);
  const productOptions = useMemo(
    () => products.filter((product) => product.isActive).map((product) => ({ id: product.id, name: product.name })),
    [products],
  );

  useEffect(() => {
    let active = true;
    apiGetPublicProducts()
      .then((response) => {
        if (active && response.products.length) setProducts(response.products);
      })
      .catch(() => {
        if (active) setProducts(defaultWebProducts);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const formData = new FormData(event.currentTarget);
      await apiCreatePublicLead(formData);
      event.currentTarget.reset();
      setStatus('sent');
      setMessage('Solicitud creada. Ya está guardada como lead en Kikeled OS.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`k-form-shell ${compact ? 'k-form-compact' : ''}`}>
      <div className="k-form-note">
        <CheckCircle2 size={20} />
        <p>Envía logo, foto del local o referencia. Esta solicitud entra directo al CRM comercial.</p>
      </div>
      <div className="k-form-grid">
        <input name="name" className="field" placeholder="Nombre completo" required />
        <input name="whatsapp" className="field" placeholder="WhatsApp" required />
        <input name="phone" className="field" placeholder="Teléfono" required />
        <input name="email" className="field" placeholder="Correo electrónico" type="email" required />
        <input name="business" className="field" placeholder="Negocio o marca" required />
        <input name="city" className="field" placeholder="Ciudad / Zona" required />
        <input name="address" className="field md:col-span-2" placeholder="Dirección o zona de instalación" required />
        <select name="businessType" className="field" defaultValue="" required>
          <option value="" disabled>Tipo de negocio</option>
          {businessTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select name="interestType" className="field" defaultValue={selectedProduct} required>
          <option value="" disabled>Servicio solicitado</option>
          {productOptions.map((product) => <option key={product.id} value={product.name}>{product.name}</option>)}
        </select>
        <input name="measures" className="field" placeholder="Medidas aproximadas" required />
        <input name="estimatedBudget" className="field" placeholder="Presupuesto estimado RD$" type="number" min="0" required />
        <select name="urgency" className="field md:col-span-2" defaultValue="" required>
          <option value="" disabled>Urgencia del proyecto</option>
          {urgencyOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <textarea name="description" className="field md:col-span-2" placeholder="Describe el proyecto, dónde irá instalado y qué estilo buscas" rows={compact ? 3 : 5} required />
        <label className="k-file-field md:col-span-2">
          Sube tu logo, foto del local o referencia
          <input name="referenceFile" type="file" accept="image/*,.pdf" />
        </label>
      </div>
      <button className="k-btn k-btn-red k-submit-button" type="submit" disabled={status === 'sending'}>
        <Send size={17} />
        {status === 'sending' ? 'Enviando...' : 'Enviar solicitud'}
      </button>
      {message && <p className={`k-form-status ${status === 'error' ? 'is-error' : 'is-success'}`}>{message}</p>}
    </form>
  );
}
