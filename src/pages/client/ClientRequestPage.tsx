import { FormEvent } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { useAppStore } from '../../store/useAppStore';

export function ClientRequestPage() {
  const customerId = useAppStore((state) => state.clientPortalCustomerId);
  const customer = useAppStore((state) => state.customers.find((item) => item.id === customerId)!);
  const addLead = useAppStore((state) => state.addLead);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Nueva solicitud" title="Solicitar Trabajo" description="Crea una solicitud conectada con tu perfil para seguimiento comercial inmediato." />
      <SectionCard title="Formulario" description="Se registra como lead asociado al cliente.">
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            addLead({
              name: customer.name,
              business: customer.business,
              phone: customer.phone,
              whatsapp: customer.whatsapp,
              email: customer.email,
              address: customer.address,
              source: 'portal cliente',
              interestType: String(formData.get('interestType')),
              description: String(formData.get('description')),
              estimatedBudget: Number(formData.get('estimatedBudget')),
              status: 'nuevo',
              owner: 'Ejecutivo portal',
              nextAction: 'Llamar y levantar requerimientos',
              notes: 'Solicitud creada desde portal cliente.',
              customerId,
            });
            event.currentTarget.reset();
          }}
          className="grid gap-3"
        >
          <input name="interestType" className="field" placeholder="Tipo de trabajo" required />
          <input name="estimatedBudget" className="field" type="number" placeholder="Presupuesto estimado" required />
          <textarea name="description" className="field" rows={5} placeholder="Describe lo que necesitas" required />
          <button className="btn-primary" type="submit">Enviar solicitud</button>
        </form>
      </SectionCard>
    </div>
  );
}
