import { Instagram, Menu, MessageCircle, Phone } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { brand } from '../../lib/brand';

const nav = [
  { label: 'Servicios', to: '/#servicios' },
  { label: 'Método', to: '/#metodo' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Paquetes', to: '/#paquetes' },
  { label: 'Cotizar', to: '/cotizar' },
];

export function PublicLayout() {
  return (
    <div className="k-public-shell">
      <header className="k-public-nav">
        <div className="k-nav-inner">
          <NavLink to="/" aria-label={brand.name}>
            <Logo />
          </NavLink>
          <nav className="k-nav-links">
            {nav.map((item) => (
              <a key={item.to} href={item.to}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="k-nav-actions">
            <Link to="/cotizar" className="k-btn k-btn-red k-nav-cta">
              Cotizar proyecto
            </Link>
            <a className="k-whatsapp-dot" href={brand.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <MessageCircle size={19} />
            </a>
            <Link to="/os/login" className="k-os-access">
              Acceso OS
            </Link>
            <button className="k-menu-button" aria-label="Abrir menú">
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="k-footer">
        <div className="k-footer-grid">
          <div>
            <Logo size="footer" />
            <p>{brand.shortDescription}</p>
            <div className="k-social-row">
              <span><Instagram size={15} />{brand.instagram}</span>
              <span><MessageCircle size={15} />WhatsApp</span>
            </div>
          </div>
          <div>
            <h4>Servicios</h4>
            <a href="/#servicios">Letreros y fachadas</a>
            <a href="/#servicios">Branding físico</a>
            <a href="/#catalogo">Catálogo</a>
          </div>
          <div>
            <h4>Compañía</h4>
            <Link to="/catalogo">Catálogo</Link>
            <Link to="/cotizar">Cotizar</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
          <div>
            <h4>Contacto</h4>
            <span>{brand.location}</span>
            <span>{brand.email}</span>
            <span><Phone size={14} /> {brand.whatsapp}</span>
            <Link className="k-footer-os" to="/os/login">Acceso OS</Link>
          </div>
        </div>
        <p className="k-footer-bottom">© 2026 {brand.name}. Impulsado por RGB Control.</p>
      </footer>
    </div>
  );
}
