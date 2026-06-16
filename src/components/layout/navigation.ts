import {
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Crown,
  FileBadge,
  FolderOpenDot,
  HandCoins,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShoppingBag,
  Sparkles,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';

export const adminNavigation = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Leads', to: '/admin/leads', icon: Sparkles },
  { label: 'CRM Clientes', to: '/admin/clientes', icon: Users },
  { label: 'Banco de Clientes', to: '/admin/banco-clientes', icon: Building2 },
  { label: 'Servicios', to: '/admin/servicios', icon: ShoppingBag },
  { label: 'Motor de Precios', to: '/admin/motor-precios', icon: CircleDollarSign },
  { label: 'Cotizaciones', to: '/admin/cotizaciones', icon: FileBadge },
  { label: 'Ordenes', to: '/admin/ordenes', icon: BriefcaseBusiness },
  { label: 'Inventario', to: '/admin/inventario', icon: PackageSearch },
  { label: 'Facturacion', to: '/admin/facturacion', icon: HandCoins },
  { label: 'Premium Pass', to: '/admin/premium-pass', icon: Crown },
  { label: 'Reportes', to: '/admin/reportes', icon: FolderOpenDot },
  { label: 'Usuarios', to: '/admin/usuarios', icon: UserCog },
  { label: 'Configuracion', to: '/admin/configuracion', icon: Settings },
];

export const clientNavigation = [
  { label: 'Inicio', to: '/portal', icon: LayoutDashboard },
  { label: 'Mis Cotizaciones', to: '/portal/cotizaciones', icon: FileBadge },
  { label: 'Mis Ordenes', to: '/portal/ordenes', icon: BriefcaseBusiness },
  { label: 'Mis Facturas', to: '/portal/facturas', icon: HandCoins },
  { label: 'Mi Premium Pass', to: '/portal/premium-pass', icon: Crown },
  { label: 'Solicitar Trabajo', to: '/portal/solicitar', icon: Wrench },
  { label: 'Mi Perfil', to: '/portal/perfil', icon: Users },
];
