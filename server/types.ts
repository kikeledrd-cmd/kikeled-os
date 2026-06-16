import type { AppData, User } from '../src/types/entities.js';

export interface SessionUser extends User {
  roleName: string;
  roleKind: 'admin' | 'sales' | 'client';
}

export interface AuthPayload {
  userId: string;
  roleKind: 'admin' | 'sales' | 'client';
}

export interface FilteredAppPayload {
  appData: AppData;
  sessionUser: SessionUser;
}
