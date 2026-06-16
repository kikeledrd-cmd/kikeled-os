import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import bcrypt from 'bcryptjs';
import { emptyData } from '../src/data/empty.js';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role_id: string;
  avatar: string;
  customer_id: string | null;
  password_hash: string;
};

type JsonDbState = {
  users: UserRow[];
  appState: {
    data: string;
    updated_at: string;
  } | null;
};

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
        if (sql.includes('SELECT * FROM users ORDER BY name')) {
          return state.users.sort((a, b) => a.name.localeCompare(b.name));
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

function createDatabase() {
  try {
    const require = createRequire(import.meta.url);
    const Database = require('better-sqlite3') as new (filename: string) => unknown;
    return new Database(sqlitePath) as ReturnType<typeof createJsonFallbackDb>;
  } catch {
    return createJsonFallbackDb();
  }
}

export const db = createDatabase();

export function initDatabase() {
  db.exec(`
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
  `);

  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, name, role_id, avatar, customer_id, password_hash)
      VALUES (@id, @email, @name, @roleId, @avatar, @customerId, @passwordHash)
    `);

    const passwordMap: Record<string, string> = {
      'kike@kikeled.com': 'KikeledAdmin#2026',
      'ventas@kikeled.com': 'VentasKikeled#2026',
    };

    for (const user of emptyData.users) {
      insertUser.run({
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        avatar: user.avatar,
        customerId: user.customerId ?? null,
        passwordHash: bcrypt.hashSync(passwordMap[user.email] ?? 'Kikeled#2026', 10),
      });
    }
  }

  const existingState = db.prepare('SELECT COUNT(*) as count FROM app_state').get() as { count: number };
  if (existingState.count === 0) {
    db.prepare('INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?)').run(
      JSON.stringify(emptyData),
      new Date().toISOString(),
    );
  }
}
