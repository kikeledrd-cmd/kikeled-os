import { useEffect, useState } from 'react';
import { Instagram, Menu, MessageCircle, Search, X, ArrowUpRight, MapPin } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { brand } from '../../lib/brand';
import { chromeWhatsAppUrl } from '../../lib/chromeCatalog';

const navigation = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Drops', href: '/#drops' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Ofertas', href: '/#ofertas' },
  { label: 'Business 360', href: '/#business-360' },
  { label: 'Contacto', href: '/contacto' },
];

export function ChromePublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const whatsappUrl = chromeWhatsAppUrl();

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="ce-site">
      <div className="ce-topline">
        <div className="ce-container ce-topline-inner">
          <span>DISEÑO <i /> FABRICACIÓN <i /> INSTALACIÓN</span>
          <span><MapPin size={12} aria-hidden="true" /> REPÚBLICA DOMINICANA</span>
        </div>
      </div>
      <header className="ce-header">
        <div className="ce-container ce-header-inner">
          <Link className="ce-brand" to="/" aria-label="Kikeled Letreros — Inicio" onClick={() => setMobileOpen(false)}>
            <img src="/brand/kikeled-letreros-logo.png" alt="Kikeled Letreros" />
          </Link>
          <nav className={`ce-navigation${mobileOpen ? ' is-open' : ''}`} aria-label="Navegación principal" id="ce-navigation">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={(location.pathname === item.href || (item.href === '/' && location.pathname === '/')) ? 'is-current' : ''}
                onClick={() => setMobileOpen(false)}
              >{item.label}</a>
            ))}
          </nav>
          <div className="ce-header-actions">
            <Link className="ce-icon-link" to="/catalogo" aria-label="Buscar productos"><Search size={20} /></Link>
            <Link className="ce-login" to="/acceso">Iniciar sesión</Link>
            <a className="ce-header-quote" href={whatsappUrl} target="_blank" rel="noreferrer">Cotizar <ArrowUpRight size={16} /></a>
            <button
              type="button"
              className="ce-mobile-menu"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="ce-navigation"
              onClick={() => setMobileOpen((value) => !value)}
            >{mobileOpen ? <X size={23} /> : <Menu size={23} />}</button>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="ce-footer">
        <div className="ce-container ce-footer-grid">
          <div className="ce-footer-company">
            <Link to="/" aria-label="Ir al inicio de Kikeled Letreros"><img src="/brand/kikeled-letreros-logo.png" alt="Kikeled Letreros" /></Link>
            <p>Ideas que se convierten en presencia. Diseño y fabricación de letreros para negocios que quieren destacar.</p>
            <p className="ce-footer-note">Una marca de Kikeled Studio SRL.</p>
          </div>
          <div><strong>Explora</strong><Link to="/catalogo">Catálogo</Link><a href="/#drops">Drops y colecciones</a><Link to="/proyectos">Proyectos</Link><a href="/#ofertas">Ofertas</a></div>
          <div><strong>Soluciones</strong><Link to="/servicios">Letreros publicitarios</Link><a href="/#business-360">Business 360</a><Link to="/cotizar">Cotizar un proyecto</Link><Link to="/contacto">Contáctanos</Link></div>
          <div><strong>Hablemos</strong><span>{brand.location}</span><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a><a href="https://www.instagram.com/kikeledletreros/" target="_blank" rel="noreferrer"><Instagram size={16} /> @kikeledletreros</a><Link to="/acceso">Acceso clientes</Link></div>
        </div>
        <div className="ce-container ce-footer-bottom"><span>© {new Date().getFullYear()} Kikeled Letreros. Todos los derechos reservados.</span><span>Hecho para marcas que brillan.</span></div>
      </footer>
    </div>
  );
}
