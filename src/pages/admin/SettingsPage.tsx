import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { useAppStore } from '../../store/useAppStore';

export function SettingsPage() {
  const { roles, users, resetDemo } = useAppStore((state) => state);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sistema" title="Configuracion" description="Usuarios, roles, precios y reinicio controlado del entorno." />
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Usuarios" description="Crea y edita accesos de admin, ventas y clientes.">
          <div className="mb-4 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-soft">{user.email}</p>
              </div>
            ))}
          </div>
          <Link className="btn-secondary" to="/admin/usuarios">Gestionar usuarios</Link>
        </SectionCard>
        <SectionCard title="Roles" description="Permisos activos del sistema.">
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="font-medium">{role.name}</p>
                <p className="text-sm text-soft">{role.permissions.join(', ')}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Datos operativos" description="Restablece la persistencia local si quieres reiniciar pruebas.">
          <button className="btn-primary" onClick={resetDemo}>Dejar sistema en cero</button>
        </SectionCard>
        <SectionCard title="Reglas de precios" description="Materiales, instalacion, ciudades y multiplicadores del cotizador.">
          <Link className="btn-secondary" to="/admin/configuracion/precios">Editar reglas</Link>
        </SectionCard>
      </div>
    </div>
  );
}
