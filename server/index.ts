import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { clearAuthCookie, getSessionUser, readAuthPayload, requireAdmin, requireAuth, setAuthCookie, signAuthToken } from './auth.js';
import {
  deleteUser,
  getDatabaseMode,
  getUserByEmail,
  getUserById,
  getUserCount,
  initDatabase,
  insertUser,
  listUsers,
  updateUser,
  type UserRow,
} from './db.js';
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

const allowedUploadMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedUploadMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Tipo de archivo no permitido.'));
  },
});

await initDatabase();

export const app = express();
const PORT = Number(process.env.PORT ?? 4000);
app.set('trust proxy', 1);

if (process.env.VERCEL) {
  app.use((req, _res, next) => {
    if (!req.url.startsWith('/api')) {
      req.url = `/api${req.url === '/' ? '' : req.url}`;
    }
    next();
  });
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.KIKELED_APP_URL ?? '',
].filter(Boolean);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de acceso. Intenta de nuevo en unos minutos.' },
});

const publicWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo mas tarde.' },
});

const heroSlideSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(2),
  subtitle: z.string().optional(),
  mediaType: z.enum(['image', 'video']),
  mediaUrl: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  badge: z.string().optional(),
  order: z.coerce.number().int().min(0),
  isActive: z.boolean(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const webProductSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  shortDescription: z.string().min(5),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  priceFrom: z.coerce.number().min(0),
  priceUnit: z.string().optional(),
  materials: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  deliveryTime: z.string().optional(),
  details: z.array(z.string()).optional(),
  ctaLabel: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  order: z.coerce.number().int().min(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

function isWithinPublishWindow(item: { startsAt?: string; endsAt?: string }) {
  const now = Date.now();
  const startsAt = item.startsAt ? new Date(item.startsAt).getTime() : null;
  const endsAt = item.endsAt ? new Date(item.endsAt).getTime() : null;
  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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
app.use('/api', apiLimiter);
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

app.get('/api/debug/auth', async (_req, res, next) => {
  if (process.env.ENABLE_DEBUG_ROUTES !== 'true') {
    res.status(404).json({ message: 'No encontrado.' });
    return;
  }

  try {
    const userCount = await getUserCount();
    const adminUser = await getUserByEmail('kike@kikeled.com');

    res.json({
      ok: true,
      userCount,
      adminUser: adminUser ? { id: adminUser.id, email: adminUser.email, roleId: adminUser.role_id } : null,
      runtime: process.env.VERCEL ? 'vercel' : 'local',
      database: getDatabaseMode(),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/public/leads', publicWriteLimiter, upload.single('referenceFile'), async (req, res, next) => {
  try {
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
  const lead = await createPublicLead({ ...parsed.data, referenceFileUrl });
  res.status(201).json({ success: true, message: 'Lead creado correctamente', lead });
  } catch (error) {
    next(error);
  }
});

app.get('/api/public/hero-slides', async (_req, res, next) => {
  try {
    const appData = await loadAppData();
    const slides = appData.heroSlides
      .filter((slide) => slide.isActive && isWithinPublishWindow(slide))
      .sort((a, b) => a.order - b.order);
    res.json({ slides });
  } catch (error) {
    next(error);
  }
});

app.get('/api/public/products', async (req, res, next) => {
  try {
    const featuredOnly = String(req.query.featured ?? '') === 'true';
    const appData = await loadAppData();
    const activeProducts = appData.webProducts
      .filter((product) => product.isActive)
      .sort((a, b) => a.order - b.order);
    const featured = activeProducts.filter((product) => product.isFeatured);
    res.json({ products: featuredOnly ? (featured.length ? featured : activeProducts) : activeProducts });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/hero-slides', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    if (!requireSystemAdminOnly(_req, res)) return;
    const appData = await loadAppData();
    res.json({ slides: [...appData.heroSlides].sort((a, b) => a.order - b.order) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/hero-slides', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (!requireSystemAdminOnly(req, res)) return;
    const parsed = heroSlideSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Datos del slide inválidos.' });
      return;
    }
    const now = new Date().toISOString();
    const appData = await loadAppData();
    const slide = {
      ...parsed.data,
      id: parsed.data.id ?? createId('hero'),
      createdAt: parsed.data.createdAt ?? now,
      updatedAt: now,
    };
    appData.heroSlides = [slide, ...appData.heroSlides.filter((item) => item.id !== slide.id)];
    await saveAppData(appData);
    res.status(201).json({ slide });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/hero-slides/:slideId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (!requireSystemAdminOnly(req, res)) return;
    const parsed = heroSlideSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Datos del slide inválidos.' });
      return;
    }
    const appData = await loadAppData();
    const current = appData.heroSlides.find((slide) => slide.id === req.params.slideId);
    if (!current) {
      res.status(404).json({ message: 'Slide no encontrado.' });
      return;
    }
    const slide = { ...current, ...parsed.data, id: current.id, updatedAt: new Date().toISOString() };
    appData.heroSlides = appData.heroSlides.map((item) => (item.id === slide.id ? slide : item));
    await saveAppData(appData);
    res.json({ slide });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/hero-slides/:slideId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (!requireSystemAdminOnly(req, res)) return;
    const appData = await loadAppData();
    appData.heroSlides = appData.heroSlides.filter((slide) => slide.id !== req.params.slideId);
    await saveAppData(appData);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/products', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    if (!requireSystemAdminOnly(_req, res)) return;
    const appData = await loadAppData();
    res.json({ products: [...appData.webProducts].sort((a, b) => a.order - b.order) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/products', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (!requireSystemAdminOnly(req, res)) return;
    const parsed = webProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Datos del producto inválidos.' });
      return;
    }
    const now = new Date().toISOString();
    const appData = await loadAppData();
    const product = {
      ...parsed.data,
      id: parsed.data.id ?? createId('prod'),
      createdAt: parsed.data.createdAt ?? now,
      updatedAt: now,
    };
    appData.webProducts = [product, ...appData.webProducts.filter((item) => item.id !== product.id)];
    await saveAppData(appData);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/products/:productId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (!requireSystemAdminOnly(req, res)) return;
    const parsed = webProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Datos del producto inválidos.' });
      return;
    }
    const appData = await loadAppData();
    const current = appData.webProducts.find((product) => product.id === req.params.productId);
    if (!current) {
      res.status(404).json({ message: 'Producto no encontrado.' });
      return;
    }
    const product = { ...current, ...parsed.data, id: current.id, updatedAt: new Date().toISOString() };
    appData.webProducts = appData.webProducts.map((item) => (item.id === product.id ? product : item));
    await saveAppData(appData);
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/products/:productId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (!requireSystemAdminOnly(req, res)) return;
    const appData = await loadAppData();
    appData.webProducts = appData.webProducts.filter((product) => product.id !== req.params.productId);
    await saveAppData(appData);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Credenciales inválidas.' });
    return;
  }

  const user = await getUserByEmail(parsed.data.email);

  if (!user) {
    res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    return;
  }

  const matches = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!matches) {
    res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    return;
  }

  const sessionUser = await getSessionUser(user.id);
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

app.get('/api/auth/session', async (req, res, next) => {
  try {
  const payload = readAuthPayload(req);
  if (!payload) {
    res.status(401).json({ message: 'Sin sesión.' });
    return;
  }

  const sessionUser = await getSessionUser(payload.userId);
  if (!sessionUser) {
    clearAuthCookie(res);
    res.status(401).json({ message: 'Sesión inválida.' });
    return;
  }

  res.json({ sessionUser });
  } catch (error) {
    next(error);
  }
});

app.get('/api/app-state', requireAuth, async (req, res, next) => {
  try {
  const appData = await loadAppData();
  res.json({
    appData: filterAppDataForUser(appData, req.sessionUser!),
    sessionUser: req.sessionUser,
  });
  } catch (error) {
    next(error);
  }
});

function requireSystemAdminOnly(req: express.Request, res: express.Response) {
  if (req.sessionUser?.roleKind !== 'admin') {
    res.status(403).json({ message: 'Solo administradores pueden gestionar usuarios.' });
    return false;
  }
  return true;
}

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

async function syncUserIntoAppState(user: User) {
  const appData = await loadAppData();
  const exists = appData.users.some((item) => item.id === user.id);
  await saveAppData({
    ...appData,
    users: exists
      ? appData.users.map((item) => (item.id === user.id ? user : item))
      : [...appData.users, user],
  });
}

async function removeUserFromAppState(userId: string) {
  const appData = await loadAppData();
  await saveAppData({
    ...appData,
    users: appData.users.filter((item) => item.id !== userId),
  });
}

app.get('/api/users', requireAuth, async (req, res, next) => {
  try {
  if (!requireSystemAdminOnly(req, res)) return;
  const rows = await listUsers();
  res.json({ users: rows.map(rowToUser) });
  } catch (error) {
    next(error);
  }
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

  const existing = await getUserByEmail(parsed.data.email);
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
  const user: UserRow = {
    id: createId('user'),
    email: parsed.data.email,
    name: parsed.data.name,
    role_id: parsed.data.roleId,
    avatar: parsed.data.avatar || initials || 'US',
    customer_id: parsed.data.roleId === 'role-client' ? parsed.data.customerId ?? null : null,
    password_hash: await bcrypt.hash(parsed.data.password, 10),
  };

  await insertUser(user);

  const appUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.role_id,
    avatar: user.avatar,
    customerId: user.customer_id ?? undefined,
  };
  await syncUserIntoAppState(appUser);
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

  const current = await getUserById(String(req.params.userId));
  if (!current) {
    res.status(404).json({ message: 'Usuario no encontrado.' });
    return;
  }

  const duplicate = await getUserByEmail(parsed.data.email);
  if (duplicate && duplicate.id !== current.id) {
    res.status(409).json({ message: 'Ya existe otro usuario con ese correo.' });
    return;
  }

  const passwordHash = parsed.data.password ? await bcrypt.hash(parsed.data.password, 10) : current.password_hash;
  const next: UserRow = {
    id: current.id,
    email: parsed.data.email,
    name: parsed.data.name,
    role_id: parsed.data.roleId,
    avatar: parsed.data.avatar || current.avatar,
    customer_id: parsed.data.roleId === 'role-client' ? parsed.data.customerId ?? null : null,
    password_hash: passwordHash,
  };

  await updateUser(next);

  const appUser = {
    id: next.id,
    email: next.email,
    name: next.name,
    roleId: next.role_id,
    avatar: next.avatar,
    customerId: next.customer_id ?? undefined,
  };
  await syncUserIntoAppState(appUser);
  res.json({ user: appUser });
});

app.delete('/api/users/:userId', requireAuth, async (req, res, next) => {
  try {
  if (!requireSystemAdminOnly(req, res)) return;
  const userId = String(req.params.userId);
  if (userId === req.sessionUser?.id) {
    res.status(400).json({ message: 'No puedes eliminar tu propio usuario activo.' });
    return;
  }

  await deleteUser(userId);
  await removeUserFromAppState(userId);
  res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/app-state', requireAuth, requireAdmin, async (req, res, next) => {
  try {
  const schema = z.custom<AppData>();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Payload inválido.' });
    return;
  }

  await saveAppData(parsed.data);
  res.json({
    ok: true,
    appData: parsed.data,
    sessionUser: req.sessionUser,
  });
  } catch (error) {
    next(error);
  }
});

app.post('/api/client/requests', requireAuth, async (req, res, next) => {
  try {
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

  const appData = await createClientLead(req.sessionUser, parsed.data);
  res.json({ appData, sessionUser: req.sessionUser });
  } catch (error) {
    next(error);
  }
});

app.post('/api/upload', publicWriteLimiter, requireAuth, upload.single('file'), (req, res) => {
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
