import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircuitBoard,
  Eye,
  Gem,
  Heart,
  LineChart,
  MessageCircle,
  MonitorSmartphone,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuoteForm } from '../../components/landing/QuoteForm';
import { brand } from '../../lib/brand';
import { packages } from '../../lib/packages';
import { products } from '../../lib/products';
import { currency } from '../../lib/utils';

const services = [
  { title: 'Letreros y fachadas', text: 'LED, cajas de luz, panaflex, 3D, acrilico y presencia exterior.', Icon: Eye, tone: 'red' },
  { title: 'Diseno de espacios', text: 'Interiores comerciales, recepciones, paredes de marca y exhibidores.', Icon: MonitorSmartphone, tone: 'orange' },
  { title: 'Fabricacion personalizada', text: 'Corte CNC, acrilico, PVC, vinil, estructura y acabado premium.', Icon: Heart, tone: 'yellow' },
  { title: 'Branding fisico', text: 'Senaletica, rotulacion, identidad visual y sistema de marca visible.', Icon: Settings, tone: 'green' },
  { title: 'Soluciones digitales', text: 'Web, catalogo, CRM, WhatsApp, formularios y flujo de ventas.', Icon: CircuitBoard, tone: 'cyan' },
  { title: 'Transformacion 360', text: 'Estrategia, diseno, ejecucion y presencia completa del negocio.', Icon: LineChart, tone: 'blue' },
];

const method = [
  { title: 'Se ve', text: 'Letreros LED, fachadas, branding fisico, senaletica, rotulacion y presencia exterior.', Icon: Eye, tone: 'red' },
  { title: 'Se siente', text: 'Interiores comerciales, recepciones, paredes de marca, ambientacion visual y experiencia del cliente.', Icon: Heart, tone: 'orange' },
  { title: 'Vende', text: 'Pagina web, catalogo digital, WhatsApp automatizado, CRM, cotizador, formulario y seguimiento.', Icon: LineChart, tone: 'green' },
];

const formBenefits = [
  ['Respuesta rapida', 'Te contactamos con una ruta clara para cotizar.'],
  ['Asesoria personalizada', 'Revisamos negocio, ciudad, medidas, material y urgencia.'],
  ['Propuesta profesional', 'Recibes una solicitud ordenada en el CRM.'],
  ['Garantia KIKELED', 'Calidad, criterio y soporte antes, durante y despues.'],
];

export function HomePage() {
  return (
    <main className="k-page">
      <div className="k-bg-grid" />
      <div className="k-bg-noise" />
      <Hero />
      <Services />
      <Method />
      <Catalog />
      <Packages />
      <QuoteSection />
    </main>
  );
}

function Hero() {
  return (
    <section className="k-hero">
      <div className="k-hero-copy">
        <p className="k-kicker">ESTUDIO FISICO-DIGITAL</p>
        <h1>
          Disenamos negocios que <span className="k-red">se ven,</span>{' '}
          <span className="k-orange">se sienten</span> y <span className="k-green">venden.</span>
        </h1>
        <p className="k-hero-text">{brand.description}</p>
        <div className="k-hero-actions">
          <Link className="k-btn k-btn-red" to="/cotizar">
            Cotizar mi proyecto <ArrowRight size={16} />
          </Link>
          <a className="k-btn k-btn-dark" href="#servicios">
            Ver servicios
          </a>
          <a className="k-btn k-btn-green" href={brand.whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> WhatsApp directo
          </a>
        </div>
        <div className="k-signal-strip" aria-label="Sistema KIKELED">
          {[
            ['FISICO', 'Presencia que impacta'],
            ['DIGITAL', 'Sistemas que conectan'],
            ['360', 'Experiencia completa'],
          ].map(([title, text]) => (
            <div key={title}>
              <Zap size={17} />
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <p className="k-hero-footnote">{brand.name} - Estudio fisico-digital para negocios modernos en RD</p>
      </div>
      <HeroVisual />
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="k-hero-visual" aria-label="Mockup comercial de Kikeled">
      <div className="k-building">
        <div className="k-building-roof" />
        <div className="k-neon-sign">
          <span>K</span>
          <strong>TU MARCA</strong>
          <small>SIGNATURE STORE</small>
        </div>
        <div className="k-storefront">
          <div />
          <div />
          <div />
        </div>
      </div>
      <div className="k-laptop">
        <div className="k-laptop-screen">
          <div className="k-window-dots"><span /><span /><span /></div>
          <p>Dashboard</p>
          <strong>RD$ 34,800</strong>
          <div className="k-chart">
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className="k-mini-cards">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <div className="k-phone">
        <div className="k-phone-notch" />
        <p>Mi Negocio</p>
        <div className="k-chat k-chat-green">Cotizar fachada</div>
        <div className="k-chat">Catalogo</div>
        <div className="k-chat">Soporte</div>
      </div>
    </div>
  );
}

function Services() {
  return (
    <section id="servicios" className="k-section">
      <SectionHeader eyebrow="LO QUE HACEMOS" title="Creamos la presencia completa de tu negocio." text="No entregamos piezas sueltas. Disenamos una experiencia conectada para que tu negocio se vea profesional, se sienta premium y tenga herramientas digitales para vender mejor." />
      <div className="k-service-grid">
        {services.map(({ title, text, Icon, tone }) => (
          <article className={`k-neon-card k-tone-${tone}`} key={title}>
            <Icon size={34} />
            <h3>{title}</h3>
            <p>{text}</p>
            <ChevronRight className="k-corner-arrow" size={18} />
          </article>
        ))}
      </div>
    </section>
  );
}

function Method() {
  return (
    <section id="metodo" className="k-section">
      <SectionHeader eyebrow="NUESTRO METODO" title="Se ve. Se siente. Vende." text="El metodo KIKELED une presencia fisica, experiencia visual y herramientas comerciales para que la marca trabaje incluso antes de que el cliente pregunte el precio." />
      <div className="k-method-grid">
        {method.map(({ title, text, Icon, tone }) => (
          <article className={`k-method-card k-tone-${tone}`} key={title}>
            <div>
              <Icon size={34} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <div className="k-method-visual">
              <span />
              <span />
              <span />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Catalog() {
  return (
    <section id="catalogo" className="k-section">
      <div className="k-section-split">
        <SectionHeader eyebrow="CATALOGO DE PRODUCTOS" title="Soluciones visuales que elevan tu marca." text="Productos base para cotizar rapido, producir con criterio y construir presencia visual en Republica Dominicana." />
        <Link className="k-btn k-btn-dark" to="/catalogo">Ver catalogo completo</Link>
      </div>
      <div className="k-product-grid">
        {products.slice(0, 6).map((product, index) => (
          <article className="k-product-card" key={product.id}>
            <div className={`k-product-media k-media-${index % 6}`}>
              <span>{product.category}</span>
            </div>
            <h3>{product.name}</h3>
            <p>Desde {currency(product.priceFrom)}</p>
            <Link to={`/cotizar?producto=${encodeURIComponent(product.name)}`} aria-label={`Cotizar ${product.name}`}>
              <ChevronRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="paquetes" className="k-section">
      <SectionHeader eyebrow="PROCESO DE TRABAJO" title="Del logo al negocio encendido." text="Elige una ruta comercial y luego ajustamos medidas, materiales, ciudad, instalacion y tiempo de entrega." />
      <div className="k-package-grid">
        {packages.map((item, index) => (
          <article className={`k-package-card k-tone-${['red', 'orange', 'green'][index] ?? 'cyan'}`} key={item.name}>
            <div className="k-package-icon">{index === 0 ? <Rocket /> : index === 1 ? <Sparkles /> : <Gem />}</div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <ul>
              {item.includes.map((line) => (
                <li key={line}><Check size={15} />{line}</li>
              ))}
            </ul>
            <div className="k-package-price">{item.price}</div>
            <Link className="k-btn k-btn-outline" to={`/cotizar?paquete=${encodeURIComponent(item.name)}`}>
              Cotizar este paquete
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section id="cotizar" className="k-section k-quote-section">
      <div>
        <SectionHeader eyebrow="COTIZA TU PROYECTO" title="Cuentanos tu proyecto y lo hacemos realidad." text="El formulario crea un lead real dentro de Kikeled OS para que ventas pueda dar seguimiento con datos claros." />
        <QuoteForm compact />
      </div>
      <aside className="k-quote-panel">
        <BadgeCheck size={32} />
        <h3>Enviar solicitud</h3>
        <p>Tu informacion entra segura al CRM. No compartimos tus datos y mantenemos el proyecto ordenado desde el primer contacto.</p>
        <div className="k-benefit-list">
          {formBenefits.map(([title, text]) => (
            <div key={title}>
              <ShieldCheck size={18} />
              <span><strong>{title}</strong>{text}</span>
            </div>
          ))}
        </div>
        <div className="k-os-chip">
          <BriefcaseBusiness size={18} />
          Impulsado por RGB Control
        </div>
      </aside>
    </section>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="k-section-header">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{text}</span>
    </div>
  );
}
