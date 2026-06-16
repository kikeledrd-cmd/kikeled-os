import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { clearAuthCookie, getSessionUser, readAuthPayload, requireAdmin, requireAuth, setAuthCookie, signAuthToken } from './auth.js';
import { db, initDatabase } from './db.js';
import { createClientLead, createPublicLead, filterAppDataForUser, loadAppData, saveAppData } from './state.js';
import type { AppData, User } from '../src/types/entities.js';
import { createId } from '../src/lib/utils.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', 'uploads');
const previewDir = path.join(process.cwd(), 'server', 'public-preview');
const directClientDir = path.join(process.cwd(), 'dist-direct');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

initDatabase();

export const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const allowedOrigins = [
  'http://localhost:5173',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.KIKELED_APP_URL ?? '',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadsDir));
if (fs.existsSync(directClientDir)) {
  app.use(express.static(directClientDir));
}
if (fs.existsSync(previewDir)) {
  app.use(express.static(previewDir));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/debug/auth', (_req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const adminUser = db.prepare('SELECT id, email, role_id FROM users WHERE email = ?').get('kike@kikeled.com') as
    | { id: string; email: string; role_id: string }
    | undefined;

  res.json({
    ok: true,
    userCount: userCount.count,
    adminUser: adminUser ? { id: adminUser.id, email: adminUser.email, roleId: adminUser.role_id } : null,
    runtime: process.env.VERCEL ? 'vercel' : 'local',
  });
});

app.post('/api/public/leads', upload.single('referenceFile'), (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      business: z.string().min(2),
      phone: z.string().min(6),
      whatsapp: z.string().min(6),
      email: z.string().email(),
      address: z.string().min(2),
      city: z.string().min(2),
      businessType: z.string().min(2),
      interestType: z.string().min(2),
      measures: z.string().min(2),
      urgency: z.string().min(2),
      estimatedBudget: z.coerce.number().min(0),
      description: z.string().min(5),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Datos incompletos para crear la solicitud.' });
    return;
  }

  const referenceFileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const lead = createPublicLead({ ...parsed.data, referenceFileUrl });
  res.status(201).json({ success: true, message: 'Lead creado correctamente', lead });
});

app.post('/api/auth/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Credenciales inválidas.' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as
    | { id: string; password_hash: string; role_id: string }
    | undefined;

  if (!user) {
    res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    return;
  }

  const matches = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!matches) {
    res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    return;
  }

  const sessionUser = getSessionUser(user.id);
  if (!sessionUser) {
    res.status(401).json({ message: 'No se pudo abrir la sesión.' });
    return;
  }

  setAuthCookie(res, signAuthToken({ userId: sessionUser.id, roleKind: sessionUser.roleKind }));
  res.json({ sessionUser });
});

app.post('/api/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/session', (req, res) => {
  const payload = readAuthPayload(req);
  if (!payload) {
    res.status(401).json({ message: 'Sin sesión.' });
    return;
  }

  const sessionUser = getSessionUser(payload.userId);
  if (!sessionUser) {
    clearAuthCookie(res);
    res.status(401).json({ message: 'Sesión inválida.' });
    return;
  }

  res.json({ sessionUser });
});

app.get('/api/app-state', requireAuth, (req, res) => {
  const appData = loadAppData();
  res.json({
    appData: filterAppDataForUser(appData, req.sessionUser!),
    sessionUser: req.sessionUser,
  });
});

function requireSystemAdminOnly(req: express.Request, res: express.Response) {
  if (req.sessionUser?.roleKind !== 'admin') {
    res.status(403).json({ message: 'Solo administradores pueden gestionar usuarios.' });
    return false;
  }
  return true;
}

type UserRow = {
  id: string;
  email: string;
  name: string;
  role_id: string;
  avatar: string;
  customer_id: string | null;
  password_hash: string;
};

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    roleId: row.role_id,
    email: row.email,
    avatar: row.avatar,
    customerId: row.customer_id ?? undefined,
  };
}

function syncUserIntoAppState(user: User) {
  const appData = loadAppData();
  const exists = appData.users.some((item) => item.id === user.id);
  saveAppData({
    ...appData,
    users: exists
      ? appData.users.map((item) => (item.id === user.id ? user : item))
      : [...appData.users, user],
  });
}

function removeUserFromAppState(userId: string) {
  const appData = loadAppData();
  saveAppData({
    ...appData,
    users: appData.users.filter((item) => item.id !== userId),
  });
}

app.get('/api/users', requireAuth, (req, res) => {
  if (!requireSystemAdminOnly(req, res)) return;
  const rows = db.prepare('SELECT * FROM users ORDER BY name').all() as UserRow[];
  res.json({ users: rows.map(rowToUser) });
});

app.post('/api/users', requireAuth, async (req, res) => {
  if (!requireSystemAdminOnly(req, res)) return;
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      roleId: z.enum(['role-admin', 'role-sales', 'role-client']),
      password: z.string().min(6),
      avatar: z.string().min(1).optional(),
      customerId: z.string().optional().nullable(),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Datos de usuario invalidos.' });
    return;
  }

  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as UserRow | undefined;
  if (existing) {
    res.status(409).json({ message: 'Ya existe un usuario con ese correo.' });
    return;
  }

  const initials = parsed.data.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const user = {
    id: createId('user'),
    email: parsed.data.email,
    name: parsed.data.name,
    roleId: parsed.data.roleId,
    avatar: parsed.data.avatar || initials || 'US',
    customerId: parsed.data.roleId === 'role-client' ? parsed.data.customerId ?? null : null,
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
  };

  db.prepare(`
    INSERT INTO users (id, email, name, role_id, avatar, customer_id, password_hash)
    VALUES (@id, @email, @name, @roleId, @avatar, @customerId, @passwordHash)
  `).run(user);

  const appUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    avatar: user.avatar,
    customerId: user.customerId ?? undefined,
  };
  syncUserIntoAppState(appUser);
  res.status(201).json({ user: appUser });
});

app.put('/api/users/:userId', requireAuth, async (req, res) => {
  if (!requireSystemAdminOnly(req, res)) return;
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      roleId: z.enum(['role-admin', 'role-sales', 'role-client']),
      password: z.string().min(6).optional().or(z.literal('')),
      avatar: z.string().min(1).optional(),
      customerId: z.string().optional().nullable(),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Datos de usuario invalidos.' });
    return;
  }

  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId) as UserRow | undefined;
  if (!current) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  const duplicate = db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as UserRow | undefined;
  if (duplicate && duplicate.id !== current.id) {
    res.status(409).json({ message: 'Ya existe otro usuario con ese correo.' });
    return;
  }

  const passwordHash = parsed.data.password ? await bcrypt.hash(parsed.data.password, 10) : current.password_hash;
  const next = {
    id: current.id,
    email: parsed.data.email,
    name: parsed.data.name,
    roleId: parsed.data.roleId,
    avatar: parsed.data.avatar || current.avatar,
    customerId: parsed.data.roleId === 'role-client' ? parsed.data.customerId ?? null : null,
    passwordHash,
  };

  db.prepare(`
    UPDATE users SET
      email = @email,
      name = @name,
      role_id = @roleId,
      avatar = @avatar,
      customer_id = @customerId,
      password_hash = @passwordHash
    WHERE id = @id
  `).run(next);

  const appUser = {
    id: next.id,
    email: next.email,
    name: next.name,
    roleId: next.roleId,
    avatar: next.avatar,
    customerId: next.customerId ?? undefined,
  };
  syncUserIntoAppState(appUser);
  res.json({ user: appUser });
});

app.delete('/api/users/:userId', requireAuth, (req, res) => {
  if (!requireSystemAdminOnly(req, res)) return;
  const userId = String(req.params.userId);
  if (userId === req.sessionUser?.id) {
    res.status(400).json({ message: 'No puedes eliminar tu propio usuario activo.' });
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  removeUserFromAppState(userId);
  res.json({ ok: true });
});

app.put('/api/app-state', requireAuth, requireAdmin, (req, res) => {
  const schema = z.custom<AppData>();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Payload inválido.' });
    return;
  }

  saveAppData(parsed.data);
  res.json({
    ok: true,
    appData: parsed.data,
    sessionUser: req.sessionUser,
  });
});

app.post('/api/client/requests', requireAuth, (req, res) => {
  if (req.sessionUser?.roleKind !== 'client') {
    res.status(403).json({ message: 'Solo el portal cliente puede crear esta solicitud.' });
    return;
  }

  const parsed = z
    .object({
      interestType: z.string().min(2),
      description: z.string().min(5),
      estimatedBudget: z.number().min(0),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Solicitud inválida.' });
    return;
  }

  const appData = createClientLead(req.sessionUser, parsed.data);
  res.json({ appData, sessionUser: req.sessionUser });
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No se recibió ningún archivo.' });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({
    url,
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});

if (fs.existsSync(directClientDir) || fs.existsSync(previewDir)) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      next();
      return;
    }
    const indexPath = fs.existsSync(directClientDir)
      ? path.join(directClientDir, 'index.html')
      : path.join(previewDir, 'index.html');
    res.sendFile(indexPath);
  });
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Error interno del servidor.';
  console.error('Kikeled OS API error:', error);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor.' : message,
    detail: process.env.NODE_ENV === 'production' ? undefined : message,
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Kikeled OS API running on http://localhost:${PORT}`);
  });
}
