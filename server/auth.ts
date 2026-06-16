import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from './types.js';
import { getUserById } from './db.js';
import { loadAppData } from './state.js';
import type { SessionUser } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be configured in production.');
}
const effectiveJwtSecret = JWT_SECRET ?? 'kikeled-os-dev-secret';
export const AUTH_COOKIE = 'kikeled_session';

export function signAuthToken(payload: AuthPayload) {
  return jwt.sign(payload, effectiveJwtSecret, { expiresIn: '7d' });
}

export async function getSessionUser(userId: string): Promise<SessionUser | null> {
  const dbUser = await getUserById(userId);
  if (!dbUser) return null;

  const appData = await loadAppData();
  const role = appData.roles.find((item) => item.id === dbUser.role_id);
  const roleKind = role?.permissions.includes('portal')
    ? 'client'
    : role?.id === 'role-sales'
      ? 'sales'
      : 'admin';

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    roleId: dbUser.role_id,
    avatar: dbUser.avatar,
    customerId: dbUser.customer_id ?? undefined,
    roleName: role?.name ?? 'Usuario',
    roleKind,
  };
}

export function readAuthPayload(req: Request): AuthPayload | null {
  const token = req.cookies[AUTH_COOKIE];
  if (!token) return null;

  try {
    return jwt.verify(token, effectiveJwtSecret) as AuthPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  void (async () => {
    const payload = readAuthPayload(req);
    if (!payload) {
      res.status(401).json({ message: 'No autenticado.' });
      return;
    }

    const sessionUser = await getSessionUser(payload.userId);
    if (!sessionUser) {
      res.status(401).json({ message: 'Sesion invalida.' });
      return;
    }

    req.sessionUser = sessionUser;
    next();
  })().catch(next);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.sessionUser || !['admin', 'sales'].includes(req.sessionUser.roleKind)) {
    res.status(403).json({ message: 'Acceso restringido a administracion.' });
    return;
  }
  next();
}

declare global {
  namespace Express {
    interface Request {
      sessionUser?: SessionUser;
    }
  }
}
