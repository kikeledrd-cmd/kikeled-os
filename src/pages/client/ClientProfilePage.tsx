import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAppStore, useSession } from '../../store/useAppStore';

export function ClientProfilePage() {
  const clientPortalCustomerId = useAppStore((state) => state.clientPortalCustomerId);
  const customers = useAppStore((state) => state.customers);
  const { user } = useSession();
  const customer = customers.find((item) => item.id === clientPortalCustomerId)!;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Mi perfil" title={customer.business} description="Consulta tus datos vinculados a la cuenta autenticada del portal cliente." />
      <SectionCard title="Datos del cliente" description="Información principal del perfil conectado.">
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="label mb-2">Contacto</p><p className="text-white">{customer.email}</p></div>
          <div><p className="label mb-2">WhatsApp</p><p className="text-white">{customer.whatsapp}</p></div>
          <div><p className="label mb-2">Dirección</p><p className="text-white">{customer.address}</p></div>
          <div><p className="label mb-2">Premium</p><StatusBadge label={customer.premiumLevel} /></div>
        </div>
      </SectionCard>
      <SectionCard title="Cuenta autenticada" description="Credenciales resueltas desde el backend del sistema.">
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="label mb-2">Usuario</p><p className="text-white">{user?.name}</p></div>
          <div><p className="label mb-2">Correo de acceso</p><p className="text-white">{user?.email}</p></div>
        </div>
      </SectionCard>
    </div>
  );
}
