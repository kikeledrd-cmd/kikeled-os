import { FormEvent } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function ContactPage() {
  const addLead = useAppStore((state) => state.addLead);

  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addLead({
      name: String(formData.get('name')),
      business: String(formData.get('business')),
      phone: String(formData.get('phone')),
      whatsapp: String(formData.get('phone')),
      email: String(formData.get('email')),
      address: String(formData.get('address')),
      source: 'contacto web',
      interestType: 'consulta general',
      description: String(formData.get('description')),
      estimatedBudget: 0,
      status: 'nuevo',
      owner: 'Recepción',
      nextAction: 'Responder por correo y WhatsApp',
      notes: 'Solicitud creada desde contacto.',
    });
    event.currentTarget.reset();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="panel p-8">
          <p className="label mb-3">Contacto</p>
          <h1 className="text-4xl font-semibold text-white">Hablemos del próximo frente visual de tu negocio.</h1>
          <div className="mt-8 space-y-5 text-sm text-soft">
            <p>Santo Domingo, República Dominicana</p>
            <p>+1 (809) 555-0199</p>
            <p>ventas@kikeled.com</p>
            <p>Atención para branding físico, LED, fachadas e instalación.</p>
          </div>
        </div>
        <form onSubmit={handleContact} className="panel grid gap-4 p-8">
          <input name="name" className="field" placeholder="Nombre" required />
          <input name="business" className="field" placeholder="Negocio" required />
          <input name="phone" className="field" placeholder="Teléfono" required />
          <input name="email" className="field" placeholder="Correo" type="email" required />
          <input name="address" className="field" placeholder="Dirección" required />
          <textarea name="description" className="field" rows={5} placeholder="Cuéntanos qué necesitas" required />
          <button className="btn-primary" type="submit">
            Enviar consulta
          </button>
        </form>
      </div>
    </section>
  );
}
