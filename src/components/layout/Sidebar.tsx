import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export function Sidebar({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: NavItem[];
}) {
  return (
    <aside className="glass flex min-h-screen w-full max-w-72 flex-col border-r border-white/10 px-5 py-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="label">Kikeled</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-soft">{subtitle}</p>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/portal'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
                  isActive ? 'bg-white text-ink' : 'text-soft hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="rounded-3xl border border-glow/20 bg-glow/10 p-4 text-sm text-cyan-100">
        Kikeled OS enlaza CRM, producción, facturación y fidelización en un mismo flujo.
      </div>
    </aside>
  );
}
