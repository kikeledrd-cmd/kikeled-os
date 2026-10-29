import { useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { QuoteForm } from '../../components/landing/QuoteForm';
import { chromeWhatsAppUrl } from '../../lib/chromeCatalog';

export function QuotePage() {
  const [searchParams] = useSearchParams();

  return (
    <main className="ce-quote-page">
      <div className="ce-container ce-quote-header"><p className="ce-section-kicker">COTIZACIÓN PERSONALIZADA / KIKELED LETREROS</p><h1>Personaliza tu letrero.</h1><p>Cuéntanos qué tienes en mente. Podemos fabricar tu proyecto según medidas, diseño, materiales y tipo de iluminación.</p></div>
      <section className="ce-container ce-quote-grid">
        <div className="ce-quote-guide">
          <h2>De tu idea a un letrero real.</h2>
          <p>Completa los datos de tu negocio y envía las medidas aproximadas, tu logo o una referencia.</p>
          <ul>
            <li><CheckCircle2 size={20} /> Indícanos el modelo o tipo de letrero.</li>
            <li><CheckCircle2 size={20} /> Comparte las medidas y cualquier detalle.</li>
            <li><CheckCircle2 size={20} /> Confirmamos el precio final y condiciones contigo.</li>
          </ul>
          <div className="ce-quote-whatsapp"><strong>¿Prefieres escribirnos directamente?</strong><span>También puedes cerrar tu proyecto conversando por WhatsApp.</span><a href={chromeWhatsAppUrl(searchParams.get('producto') ?? undefined)} target="_blank" rel="noreferrer">Conversar por WhatsApp <MessageCircle size={18} /><ArrowRight size={17} /></a></div>
        </div>
        <div className="ce-quote-form"><QuoteForm selectedProduct={searchParams.get('producto') ?? ''} /></div>
      </section>
    </main>
  );
}
