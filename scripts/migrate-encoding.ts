/**
 * Migración de encoding: repara strings mojibake (UTF-8 leído como Latin-1/CP1252)
 * en el app_state guardado. Ej.: 'diseÃ±o' -> 'diseño', 'cotizaciÃ³n' -> 'cotización'.
 *
 * Uso:
 *   npx tsx scripts/migrate-encoding.ts            (dry-run: solo muestra qué cambiaría)
 *   npx tsx scripts/migrate-encoding.ts --apply    (aplica; saveAppData respalda antes)
 *
 * Funciona contra el backend activo (Postgres si hay DATABASE_URL; si no, SQLite/JSON local).
 */
import { initDatabase } from '../server/db.js';
import { loadAppData, saveAppData } from '../server/state.js';

const apply = process.argv.includes('--apply');

// Casos CP1252 que el roundtrip latin1 no cubre (comillas tipográficas, etc.).
const explicitMap: Array<[string, string]> = [
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã±', 'ñ'],
  ['Ã‰', 'É'],
  ['Ã“', 'Ó'],
  ['Ãš', 'Ú'],
  ['Ã‘', 'Ñ'],
  ['Ã¼', 'ü'],
];

function fixString(value: string): string {
  if (!value.includes('Ã')) return value;
  let fixed = value;
  for (const [bad, good] of explicitMap) {
    fixed = fixed.split(bad).join(good);
  }
  if (fixed.includes('Ã')) {
    const roundtrip = Buffer.from(fixed, 'latin1').toString('utf8');
    if (!roundtrip.includes('�')) fixed = roundtrip;
  }
  return fixed;
}

const changes: Array<{ path: string; before: string; after: string }> = [];
const leftovers: string[] = [];

function walk(value: unknown, path: string): unknown {
  if (typeof value === 'string') {
    const fixed = fixString(value);
    if (fixed !== value) changes.push({ path, before: value, after: fixed });
    if (fixed.includes('Ã')) leftovers.push(`${path}: ${fixed.slice(0, 80)}`);
    return fixed;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => walk(item, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item, `${path}.${key}`)]));
  }
  return value;
}

async function main() {
  await initDatabase();
  const appData = await loadAppData();
  const fixedData = walk(appData, '$') as typeof appData;

  if (changes.length === 0) {
    console.log('Sin mojibake pendiente. Datos limpios.');
    return;
  }

  console.log(`Cambios ${apply ? 'aplicados' : 'detectados (dry-run)'}: ${changes.length}\n`);
  for (const change of changes) {
    console.log(`  ${change.path}`);
    console.log(`    - ${change.before.slice(0, 100)}`);
    console.log(`    + ${change.after.slice(0, 100)}`);
  }
  if (leftovers.length > 0) {
    console.warn(`\nADVERTENCIA: ${leftovers.length} strings siguen con 'Ã' tras la reparación:`);
    for (const item of leftovers) console.warn(`  ${item}`);
  }

  if (!apply) {
    console.log('\nDry-run: no se guardó nada. Ejecuta con --apply para aplicar.');
    return;
  }

  await saveAppData(fixedData);
  console.log('\nGuardado. Se creó un backup del estado anterior en server/data/backups/.');
}

main().catch((error) => {
  console.error('Error en la migración:', error);
  process.exit(1);
});
