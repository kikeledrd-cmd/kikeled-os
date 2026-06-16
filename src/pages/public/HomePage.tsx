import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircuitBoard,
  Pause,
  Play,
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
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/brand/Logo';
import { QuoteForm } from '../../components/landing/QuoteForm';
import { apiGetPublicHeroSlides, apiGetPublicProducts } from '../../lib/api';
import { brand } from '../../lib/brand';
import { packages } from '../../lib/packages';
import { currency } from '../../lib/utils';
import { defaultHeroSlides, defaultWebProducts } from '../../data/webContent';
import type { HeroSlide, WebProduct } from '../../types/entities';

const services = [
  { title: 'Letreros y fachadas', text: 'LED, cajas de luz, panaflex, 3D, acrílico y presencia exterior.', Icon: Eye, tone: 'red' },
  { title: 'Diseño de espacios', text: 'Interiores comerciales, recepciones, paredes de marca y exhibidores.', Icon: MonitorSmartphone, tone: 'orange' },
  { title: 'Fabricación personalizada', text: 'Corte CNC, acrílico, PVC, vinil, estructura y acabado premium.', Icon: Heart, tone: 'yellow' },
  { title: 'Branding físico', text: 'Señalética, rotulación, identidad visual y sistema de marca visible.', Icon: Settings, tone: 'green' },
  { title: 'Soluciones digitales', text: 'Web, catálogo, CRM, WhatsApp, formularios y flujo de ventas.', Icon: CircuitBoard, tone: 'cyan' },
  { title: 'Transformación 360', text: 'Estrategia, diseño, ejecución y presencia completa del negocio.', Icon: LineChart, tone: 'blue' },
];

const method = [
  { title: 'Se ve', text: 'Letreros LED, fachadas, branding físico, señalética, rotulación y presencia exterior.', Icon: Eye, tone: 'red' },
  { title: 'Se siente', text: 'Interiores comerciales, recepciones, paredes de marca, ambientación visual y experiencia del cliente.', Icon: Heart, tone: 'orange' },
  { title: 'Vende', text: 'Página web, catálogo digital, WhatsApp automatizado, CRM, cotizador, formulario y seguimiento.', Icon: LineChart, tone: 'blue' },
];

const formBenefits = [
  ['Respuesta rápida', 'Te contactamos con una ruta clara para cotizar.'],
  ['Asesoría personalizada', 'Revisamos negocio, ciudad, medidas, material y urgencia.'],
  ['Propuesta profesional', 'Recibes una solicitud ordenada en el CRM.'],
  ['Garantía KIKELED', 'Calidad, criterio y soporte antes, durante y después.'],
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
  const [slides, setSlides] = useState<HeroSlide[]>(defaultHeroSlides);

  useEffect(() => {
    let active = true;
    apiGetPublicHeroSlides()
      .then((response) => {
        if (active && response.slides.length) setSlides(response.slides);
      })
      .catch(() => {
        if (active) setSlides(defaultHeroSlides);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="k-hero">
      <div className="k-hero-copy">
        <Logo size="hero" />
        <p className="k-kicker">ESTUDIO FÍSICO-DIGITAL</p>
        <h1>
          Diseñamos negocios que <span className="k-red">se ven,</span>{' '}
          <span className="k-green">se sienten</span> y <span className="k-blue">venden.</span>
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
        <p className="k-hero-footnote">{brand.name} - Estudio físico-digital para negocios modernos en RD</p>
      </div>
      <HeroCarousel slides={slides} />
    </section>
  );
}

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const visibleSlides = slides.length ? slides : defaultHeroSlides;
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const activeSlide = visibleSlides[index] ?? visibleSlides[0];

  useEffect(() => {
    if (!isPlaying || visibleSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % visibleSlides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [isPlaying, visibleSlides.length]);

  useEffect(() => {
    setIndex(0);
  }, [visibleSlides.length]);

  function go(direction: 1 | -1) {
    setIndex((current) => (current + direction + visibleSlides.length) % visibleSlides.length);
  }

  return (
    <div className="k-hero-visual k-hero-carousel" aria-label="Carrusel principal Kikeled">
      <div className="k-carousel-media">
        {activeSlide.mediaType === 'video' ? (
          <video src={activeSlide.mediaUrl} poster={activeSlide.thumbnailUrl} autoPlay={isPlaying} muted loop playsInline />
        ) : (
          <img src={activeSlide.mediaUrl} alt={activeSlide.title} />
        )}
      </div>
      <div className="k-carousel-copy">
        {activeSlide.badge ? <span>{activeSlide.badge}</span> : null}
        <h2>{activeSlide.title}</h2>
        {activeSlide.subtitle ? <p>{activeSlide.subtitle}</p> : null}
        {activeSlide.ctaLabel && activeSlide.ctaUrl ? (
          <Link className="k-btn k-btn-red" to={activeSlide.ctaUrl}>
            {activeSlide.ctaLabel} <ArrowRight size={15} />
          </Link>
        ) : null}
      </div>
      <div className="k-carousel-controls">
        <button type="button" onClick={() => go(-1)} aria-label="Slide anterior">
          <ChevronRight size={18} />
        </button>
        <div>
          {visibleSlides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              className={slideIndex === index ? 'is-active' : ''}
              onClick={() => setIndex(slideIndex)}
              aria-label={`Ver slide ${slideIndex + 1}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? 'Pausar carrusel' : 'Reproducir carrusel'}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Slide siguiente">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function Services() {
  return (
    <section id="servicios" className="k-section">
      <SectionHeader eyebrow="PILARES DE MARCA" title="Creamos la presencia completa de tu negocio." text="No entregamos piezas sueltas. Diseñamos una experiencia conectada para que tu negocio se vea profesional, se sienta premium y tenga herramientas digitales para vender mejor." />
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
      <SectionHeader eyebrow="MÉTODO KIKELED" title="Se ve. Se siente. Vende." text="El método KIKELED une presencia física, experiencia visual y herramientas comerciales para que la marca trabaje incluso antes de que el cliente pregunte el precio." />
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
  const [products, setProducts] = useState<WebProduct[]>(defaultWebProducts.filter((product) => product.isFeatured));

  useEffect(() => {
    let active = true;
    apiGetPublicProducts(true)
      .then((response) => {
        if (active && response.products.length) setProducts(response.products);
      })
      .catch(() => {
        if (active) setProducts(defaultWebProducts.filter((product) => product.isActive && product.isFeatured));
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive);
    const fallbackProducts = defaultWebProducts.filter((product) => product.isActive && product.isFeatured);
    return (activeProducts.length ? activeProducts : fallbackProducts).sort((a, b) => a.order - b.order).slice(0, 6);
  }, [products]);

  return (
    <section id="catalogo" className="k-section">
      <div className="k-section-split">
        <SectionHeader eyebrow="CATÁLOGO" title="Soluciones visuales que elevan tu marca." text="Productos base para cotizar rápido, producir con criterio y construir presencia visual en República Dominicana." />
        <Link className="k-btn k-btn-dark" to="/catalogo">Ver catálogo completo</Link>
      </div>
      <div className="k-product-grid">
        {visibleProducts.map((product, index) => (
          <article className="k-product-card" key={product.id}>
            <div className={`k-product-media k-media-${index % 6}`}>
              {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} /> : null}
              <span>{product.category}</span>
            </div>
            <h3>{product.name}</h3>
            <p>{product.shortDescription}</p>
            <strong>Desde {currency(product.priceFrom)}{product.priceUnit ? ` / ${product.priceUnit}` : ''}</strong>
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
      <SectionHeader eyebrow="PAQUETES" title="Del logo al negocio encendido." text="Elige una ruta comercial y luego ajustamos medidas, materiales, ciudad, instalación y tiempo de entrega." />
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
        <SectionHeader eyebrow="COTIZA TU PROYECTO" title="Cuéntanos tu proyecto y lo hacemos realidad." text="El formulario crea un lead real dentro de Kikeled OS para que ventas pueda dar seguimiento con datos claros." />
        <QuoteForm compact />
      </div>
      <aside className="k-quote-panel">
        <BadgeCheck size={32} />
        <h3>Enviar solicitud</h3>
        <p>Tu información entra segura al CRM. No compartimos tus datos y mantenemos el proyecto ordenado desde el primer contacto.</p>
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
