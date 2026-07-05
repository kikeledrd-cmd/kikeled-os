import type { AppData, HeroSlide, Lead, User, WebProduct } from '../types/entities';

export interface SessionUser extends User {
  roleName: string;
  roleKind: 'admin' | 'sales' | 'client';
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error inesperado.' }));
    throw new Error(error.message ?? 'Error inesperado.');
  }

  return response.json() as Promise<T>;
}

export async function apiGetSession() {
  return request<{ sessionUser: SessionUser }>('/api/auth/session');
}

export async function apiLogin(email: string, password: string) {
  return request<{ sessionUser: SessionUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout() {
  return request<{ ok: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function apiGetAppState() {
  return request<{ appData: AppData; sessionUser: SessionUser; stateVersion: string }>('/api/app-state');
}

/** Conflicto de versiones: otro usuario guardó primero. Trae el estado fresco del servidor. */
export class StateConflictError extends Error {
  constructor(
    public payload: { appData: AppData; sessionUser: SessionUser; stateVersion: string },
    message: string,
  ) {
    super(message);
    this.name = 'StateConflictError';
  }
}

export async function apiSaveAppState(appData: AppData, stateVersion: string | null) {
  const response = await fetch('/api/app-state', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appData, stateVersion }),
  });

  if (response.status === 409) {
    const payload = await response.json();
    throw new StateConflictError(payload, payload.message ?? 'Otro usuario guardó cambios.');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error inesperado.' }));
    throw new Error(error.message ?? 'Error inesperado.');
  }

  return response.json() as Promise<{ ok: boolean; appData: AppData; sessionUser: SessionUser; stateVersion: string }>;
}

export async function apiExportAppData(): Promise<void> {
  const response = await fetch('/api/admin/export', { credentials: 'include' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'No se pudo exportar.' }));
    throw new Error(error.message ?? 'No se pudo exportar.');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `kikeled-os-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function apiImportAppData(appData: unknown) {
  return request<{ ok: boolean }>('/api/admin/import', {
    method: 'POST',
    body: JSON.stringify(appData),
  });
}

export type DocumentEntity = 'quote' | 'order' | 'invoice';

export async function apiNextDocumentNumber(entity: DocumentEntity) {
  return request<{ number: string; value: number }>('/api/counters/next', {
    method: 'POST',
    body: JSON.stringify({ entity }),
  });
}

export async function apiCreateClientRequest(input: Pick<Lead, 'interestType' | 'description' | 'estimatedBudget'>) {
  return request<{ appData: AppData; sessionUser: SessionUser }>('/api/client/requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiCreatePublicLead(formData: FormData): Promise<{ success?: boolean; message?: string; lead: Lead }> {
  const response = await fetch('/api/public/leads', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'No se pudo crear el lead.' }));
    throw new Error(error.message ?? 'No se pudo crear el lead.');
  }

  return response.json() as Promise<{ success?: boolean; message?: string; lead: Lead }>;
}

export async function apiGetPublicHeroSlides() {
  return request<{ slides: HeroSlide[] }>('/api/public/hero-slides');
}

export async function apiGetPublicProducts(featured = false) {
  return request<{ products: WebProduct[] }>(featured ? '/api/public/products?featured=true' : '/api/public/products');
}

export async function apiUploadFile(file: File): Promise<{ url: string; name: string; type: string; size: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error subiendo archivo.' }));
    throw new Error(error.message ?? 'Error subiendo archivo.');
  }

  return response.json();
}

export type UserInput = {
  name: string;
  email: string;
  roleId: 'role-admin' | 'role-sales' | 'role-client';
  password?: string;
  avatar?: string;
  customerId?: string | null;
};

export async function apiListUsers() {
  return request<{ users: User[] }>('/api/users');
}

export async function apiCreateUser(input: UserInput & { password: string }) {
  return request<{ user: User }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiUpdateUser(userId: string, input: UserInput) {
  return request<{ user: User }>(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function apiDeleteUser(userId: string) {
  return request<{ ok: boolean }>(`/api/users/${userId}`, {
    method: 'DELETE',
  });
}
