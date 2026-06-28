import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Pool, type QueryResultRow } from 'pg';
import bcrypt from 'bcryptjs';
import { emptyData } from '../src/data/empty.js';

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role_id: string;
  avatar: string;
  customer_id: string | null;
  password_hash: string;
};

export type MediaAssetRow = {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  data: Buffer;
  created_at: string;
};

type JsonDbState = {
  users: UserRow[];
  appState: {
    data: string;
    updated_at: string;
  } | null;
};

type LocalDb = ReturnType<typeof createJsonFallbackDb>;

const databaseUrl = process.env.DATABASE_URL;
const postgresPool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: Number(process.env.PG_POOL_MAX ?? 3),
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    })
  : null;

const baseDataDir =
  process.env.KIKELED_DB_DIR ??
  (process.env.VERCEL ? path.join('/tmp', 'kikeled-os-data') : path.join(process.cwd(), 'server', 'data'));

const dataDir = baseDataDir;
fs.mkdirSync(dataDir, { recursive: true });

const sqlitePath = path.join(dataDir, 'kikeled-os.db');
const jsonFallbackPath = path.join(dataDir, 'kikeled-os-fallback.json');

function readJsonDb(): JsonDbState {
  if (!fs.existsSync(jsonFallbackPath)) {
    return { users: [], appState: null };
  }
  return JSON.parse(fs.readFileSync(jsonFallbackPath, 'utf8')) as JsonDbState;
}

function writeJsonDb(state: JsonDbState) {
  fs.writeFileSync(jsonFallbackPath, JSON.stringify(state, null, 2));
}

function createJsonFallbackDb() {
  return {
    exec: (_sql: string) => undefined,
    prepare: (sql: string) => ({
      all: (...params: unknown[]) => {
        const state = readJsonDb();
        if (sql.includes('SELECT * FROM users ORDER BY name')) {
          return [...state.users].sort((a, b) => a.name.localeCompare(b.name));
        }
        return [];
      },
      get: (...params: unknown[]) => {
        const state = readJsonDb();
        if (sql.includes('SELECT COUNT(*) as count FROM users')) {
          return { count: state.users.length };
        }
        if (sql.includes('SELECT * FROM users WHERE email = ?')) {
          return state.users.find((user) => user.email === params[0]);
        }
        if (sql.includes('SELECT * FROM users WHERE id = ?')) {
          return state.users.find((user) => user.id === params[0]);
        }
        if (sql.includes('SELECT id, email, role_id FROM users WHERE email = ?')) {
          const user = state.users.find((item) => item.email === params[0]);
          return user ? { id: user.id, email: user.email, role_id: user.role_id } : undefined;
        }
        if (sql.includes('SELECT data FROM app_state WHERE id = 1')) {
          if (!state.appState) return { data: JSON.stringify(emptyData) };
          return { data: state.appState.data };
        }
        if (sql.includes('SELECT COUNT(*) as count FROM app_state')) {
          return { count: state.appState ? 1 : 0 };
        }
        return undefined;
      },
      run: (...params: unknown[]) => {
        const state = readJsonDb();
        if (sql.includes('INSERT INTO users')) {
          const input = params[0] as {
            id: string;
            email: string;
            name: string;
            roleId?: string;
            role_id?: string;
            avatar: string;
            customerId?: string | null;
            customer_id?: string | null;
            passwordHash?: string;
            password_hash?: string;
          };
          const nextUser = {
            id: input.id,
            email: input.email,
            name: input.name,
            role_id: input.roleId ?? input.role_id ?? 'role-client',
            avatar: input.avatar,
            customer_id: input.customerId ?? input.customer_id ?? null,
            password_hash: input.passwordHash ?? input.password_hash ?? '',
          };
          const existingIndex = state.users.findIndex((user) => user.id === nextUser.id);
          if (existingIndex >= 0) {
            state.users[existingIndex] = nextUser;
          } else {
            state.users.push(nextUser);
          }
          writeJsonDb(state);
          return { changes: 1 };
        }
        if (sql.includes('UPDATE users SET')) {
          const input = params[0] as {
            id: string;
            email: string;
            name: string;
            roleId?: string;
            role_id?: string;
            avatar: string;
            customerId?: string | null;
            customer_id?: string | null;
            passwordHash?: string;
            password_hash?: string;
          };
          const index = state.users.findIndex((user) => user.id === input.id);
          if (index >= 0) {
            state.users[index] = {
              ...state.users[index],
              email: input.email,
              name: input.name,
              role_id: input.roleId ?? input.role_id ?? state.users[index].role_id,
              avatar: input.avatar,
              customer_id: input.customerId ?? input.customer_id ?? null,
              password_hash: input.passwordHash ?? input.password_hash ?? state.users[index].password_hash,
            };
            writeJsonDb(state);
            return { changes: 1 };
          }
          return { changes: 0 };
        }
        if (sql.includes('DELETE FROM users WHERE id = ?')) {
          const before = state.users.length;
          state.users = state.users.filter((user) => user.id !== params[0]);
          writeJsonDb(state);
          return { changes: before - state.users.length };
        }
        if (sql.includes('INSERT INTO app_state')) {
          state.appState = {
            data: String(params[0]),
            updated_at: String(params[1]),
          };
          writeJsonDb(state);
          return { changes: 1 };
        }
        if (sql.includes('UPDATE app_state SET data = ?')) {
          state.appState = {
            data: String(params[0]),
            updated_at: String(params[1]),
          };
          writeJsonDb(state);
          return { changes: 1 };
        }
        return { changes: 0 };
      },
    }),
  };
}

function createLocalDatabase(): LocalDb {
  try {
    const require = createRequire(import.meta.url);
    const Database = require('better-sqlite3') as new (filename: string) => unknown;
    return new Database(sqlitePath) as LocalDb;
  } catch {
    return createJsonFallbackDb();
  }
}

const localDb = postgresPool ? null : createLocalDatabase();

async function postgresQuery<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  if (!postgresPool) {
    throw new Error('Postgres is not configured.');
  }
  return postgresPool.query<T>(sql, params);
}

export function getDatabaseMode() {
  return postgresPool ? 'postgres' : 'local';
}

export async function initDatabase() {
  if (postgresPool) {
    await postgresQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role_id TEXT NOT NULL,
        avatar TEXT NOT NULL,
        customer_id TEXT,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS media_assets (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data BYTEA NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
      CREATE INDEX IF NOT EXISTS users_customer_id_idx ON users (customer_id);
    `);
    await postgresQuery(`
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
      REVOKE ALL ON TABLE users FROM anon, authenticated;
      REVOKE ALL ON TABLE app_state FROM anon, authenticated;
      ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
      REVOKE ALL ON TABLE media_assets FROM anon, authenticated;
    `);
  } else {
    localDb!.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role_id TEXT NOT NULL,
        avatar TEXT NOT NULL,
        customer_id TEXT,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS media_assets (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data BYTEA NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  const existingUsers = await getUserCount();
  if (existingUsers === 0) {
    const passwordMap: Record<string, string> = {
      'kike@kikeled.com': 'KikeledAdmin#2026',
      'ventas@kikeled.com': 'VentasKikeled#2026',
    };

    for (const user of emptyData.users) {
      await insertUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.roleId,
        avatar: user.avatar,
        customer_id: user.customerId ?? null,
        password_hash: bcrypt.hashSync(passwordMap[user.email] ?? 'Kikeled#2026', 10),
      });
    }
  }

  const existingState = await getAppStateCount();
  if (existingState === 0) {
    await insertAppState(JSON.stringify(emptyData), new Date().toISOString());
  }
}

export async function getUserCount() {
  if (postgresPool) {
    const result = await postgresQuery<{ count: string }>('SELECT COUNT(*) as count FROM users');
    return Number(result.rows[0]?.count ?? 0);
  }
  const row = localDb!.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  return row.count;
}

async function getAppStateCount() {
  if (postgresPool) {
    const result = await postgresQuery<{ count: string }>('SELECT COUNT(*) as count FROM app_state');
    return Number(result.rows[0]?.count ?? 0);
  }
  const row = localDb!.prepare('SELECT COUNT(*) as count FROM app_state').get() as { count: number };
  return row.count;
}

export async function getUserByEmail(email: string) {
  if (postgresPool) {
    const result = await postgresQuery<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
  return localDb!.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
}

export async function getUserById(id: string) {
  if (postgresPool) {
    const result = await postgresQuery<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
  return localDb!.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export async function listUsers() {
  if (postgresPool) {
    const result = await postgresQuery<UserRow>('SELECT * FROM users ORDER BY name');
    return result.rows;
  }
  return localDb!.prepare('SELECT * FROM users ORDER BY name').all() as UserRow[];
}

export async function insertUser(user: UserRow) {
  if (postgresPool) {
    await postgresQuery(
      `
        INSERT INTO users (id, email, name, role_id, avatar, customer_id, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [user.id, user.email, user.name, user.role_id, user.avatar, user.customer_id, user.password_hash],
    );
    return;
  }
  localDb!.prepare(`
    INSERT INTO users (id, email, name, role_id, avatar, customer_id, password_hash)
    VALUES (@id, @email, @name, @roleId, @avatar, @customerId, @passwordHash)
  `).run({
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.role_id,
    avatar: user.avatar,
    customerId: user.customer_id,
    passwordHash: user.password_hash,
  });
}

export async function updateUser(user: UserRow) {
  if (postgresPool) {
    await postgresQuery(
      `
        UPDATE users SET
          email = $1,
          name = $2,
          role_id = $3,
          avatar = $4,
          customer_id = $5,
          password_hash = $6
        WHERE id = $7
      `,
      [user.email, user.name, user.role_id, user.avatar, user.customer_id, user.password_hash, user.id],
    );
    return;
  }
  localDb!.prepare(`
    UPDATE users SET
      email = @email,
      name = @name,
      role_id = @roleId,
      avatar = @avatar,
      customer_id = @customerId,
      password_hash = @passwordHash
    WHERE id = @id
  `).run({
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.role_id,
    avatar: user.avatar,
    customerId: user.customer_id,
    passwordHash: user.password_hash,
  });
}

export async function deleteUser(userId: string) {
  if (postgresPool) {
    await postgresQuery('DELETE FROM users WHERE id = $1', [userId]);
    return;
  }
  localDb!.prepare('DELETE FROM users WHERE id = ?').run(userId);
}

export async function getAppStateData() {
  if (postgresPool) {
    const result = await postgresQuery<{ data: string }>('SELECT data FROM app_state WHERE id = 1');
    return result.rows[0]?.data ?? JSON.stringify(emptyData);
  }
  const row = localDb!.prepare('SELECT data FROM app_state WHERE id = 1').get() as { data: string };
  return row.data;
}

export async function saveAppStateData(data: string, updatedAt: string) {
  if (postgresPool) {
    await postgresQuery('UPDATE app_state SET data = $1, updated_at = $2 WHERE id = 1', [data, updatedAt]);
    return;
  }
  localDb!.prepare('UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1').run(data, updatedAt);
}

async function insertAppState(data: string, updatedAt: string) {
  if (postgresPool) {
    await postgresQuery('INSERT INTO app_state (id, data, updated_at) VALUES (1, $1, $2)', [data, updatedAt]);
    return;
  }
  localDb!.prepare('INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?)').run(data, updatedAt);
}

export async function insertMediaAsset(asset: MediaAssetRow) {
  if (postgresPool) {
    await postgresQuery(
      `
        INSERT INTO media_assets (id, filename, mime_type, size, data, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [asset.id, asset.filename, asset.mime_type, asset.size, asset.data, asset.created_at],
    );
    return;
  }
}

export async function getMediaAsset(assetId: string) {
  if (postgresPool) {
    const result = await postgresQuery<MediaAssetRow>('SELECT * FROM media_assets WHERE id = $1', [assetId]);
    return result.rows[0];
  }
  return undefined;
}