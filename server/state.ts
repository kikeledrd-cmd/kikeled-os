import { createId } from '../src/lib/utils.js';
import { normalizeLeadStatus } from '../src/lib/leadStatus.js';
import { defaultHeroSlides, defaultWebProducts } from '../src/data/webContent.js';
import type { AppData, Lead } from '../src/types/entities.js';
import { getAppStateData, saveAppStateData } from './db.js';
import type { SessionUser } from './types.js';

export async function loadAppData(): Promise<AppData> {
  const data = await getAppStateData();
  const appData = JSON.parse(data) as AppData;
  return {
    ...appData,
    heroSlides: appData.heroSlides ?? defaultHeroSlides,
    webProducts: appData.webProducts ?? defaultWebProducts,
    leads: appData.leads.map((lead) => ({
      ...lead,
      status: normalizeLeadStatus(lead.status),
      updatedAt: lead.updatedAt ?? lead.createdAt,
    })),
  };
}

export async function saveAppData(appData: AppData) {
  await saveAppStateData(JSON.stringify(appData), new Date().toISOString());
}

export function filterAppDataForUser(appData: AppData, sessionUser: SessionUser): AppData {
  if (sessionUser.roleKind === 'admin') {
    return appData;
  }

  const customerId = sessionUser.customerId;
  if (!customerId) {
    return { ...appData, customers: [], quotes: [], orders: [], invoices: [], payments: [], customerNotes: [], premiumMemberships: [], premiumBenefitUsage: [], activities: [], attachments: [], leads: [] };
  }

  return {
    ...appData,
    users: appData.users.filter((user) => user.id === sessionUser.id),
    leads: appData.leads.filter((lead) => lead.customerId === customerId || lead.email === sessionUser.email),
    customers: appData.customers.filter((customer) => customer.id === customerId),
    customerNotes: appData.customerNotes.filter((note) => note.customerId === customerId),
    quotes: appData.quotes.filter((quote) => quote.customerId === customerId),
    orders: appData.orders.filter((order) => order.customerId === customerId),
    invoices: appData.invoices.filter((invoice) => invoice.customerId === customerId),
    payments: appData.payments.filter((payment) => payment.customerId === customerId),
    premiumMemberships: appData.premiumMemberships.filter((membership) => membership.customerId === customerId),
    premiumBenefitUsage: appData.premiumBenefitUsage.filter((usage) => usage.customerId === customerId),
    activities: appData.activities.filter((activity) => activity.customerId === customerId),
    attachments: appData.attachments.filter((attachment) => attachment.customerId === customerId),
  };
}

export async function createClientLead(sessionUser: SessionUser, input: Pick<Lead, 'interestType' | 'description' | 'estimatedBudget'>) {
  const appData = await loadAppData();
  const customer = appData.customers.find((item) => item.id === sessionUser.customerId);
  if (!customer) {
    throw new Error('Cliente no asociado a la sesión.');
  }

  const newLead: Lead = {
    id: createId('lead'),
    name: customer.name,
    business: customer.business,
    phone: customer.phone,
    whatsapp: customer.whatsapp,
    email: customer.email,
    address: customer.address,
    source: 'portal cliente',
    interestType: input.interestType,
    description: input.description,
    estimatedBudget: input.estimatedBudget,
    status: 'nuevo',
    owner: 'Ejecutivo portal',
    nextAction: 'Llamar y levantar requerimientos',
    notes: 'Solicitud creada desde portal cliente.',
    customerId: customer.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  appData.leads.unshift(newLead);
  appData.activities.unshift({
    id: createId('act'),
    customerId: customer.id,
    leadId: newLead.id,
    type: 'lead',
    description: `Nueva solicitud del portal cliente para ${customer.business}.`,
    createdAt: new Date().toISOString(),
  });

  await saveAppData(appData);
  return filterAppDataForUser(appData, sessionUser);
}

export async function createPublicLead(input: {
  name: string;
  business: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  businessType: string;
  interestType: string;
  measures: string;
  urgency: string;
  estimatedBudget: number;
  description: string;
  referenceFileUrl?: string;
}) {
  const appData = await loadAppData();
  const newLead: Lead = {
    id: createId('lead'),
    name: input.name,
    business: input.business,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    address: input.address,
    city: input.city,
    businessType: input.businessType,
    source: 'web publica',
    interestType: input.interestType,
    measures: input.measures,
    urgency: input.urgency,
    referenceFileUrl: input.referenceFileUrl,
    description: input.description,
    estimatedBudget: input.estimatedBudget,
    status: 'nuevo' as Lead['status'],
    owner: 'Equipo comercial',
    nextAction: 'Contactar por WhatsApp y validar medidas',
    notes: [
      `Ciudad: ${input.city}`,
      `Tipo de negocio: ${input.businessType}`,
      `Medidas: ${input.measures}`,
      `Urgencia: ${input.urgency}`,
      input.referenceFileUrl ? `Archivo: ${input.referenceFileUrl}` : '',
    ].filter(Boolean).join('\n'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  appData.leads.unshift(newLead);
  appData.activities.unshift({
    id: createId('act'),
    leadId: newLead.id,
    type: 'lead',
    description: `Nuevo lead web para ${newLead.business}.`,
    createdAt: new Date().toISOString(),
  });

  await saveAppData(appData);
  return newLead;
}
