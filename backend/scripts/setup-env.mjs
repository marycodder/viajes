import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const backend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(backend, '..');
const rootEnv = resolve(root, '.env');
const apiEnv = resolve(backend, '.env');

if (existsSync(rootEnv)) {
  console.log('Se conserva el .env existente de la raíz.');
} else {
  const values = readFileSync(resolve(root, '.env.example'), 'utf8')
    .replace('POSTGRES_PASSWORD=REPLACE_WITH_LOCAL_PASSWORD', `POSTGRES_PASSWORD=${randomBytes(20).toString('hex')}`)
    .replace('MONGO_PASSWORD=REPLACE_WITH_LOCAL_PASSWORD', `MONGO_PASSWORD=${randomBytes(20).toString('hex')}`)
    .replace('REPLACE_WITH_RANDOM_SECRET_AT_LEAST_32_CHARACTERS', randomBytes(48).toString('hex'))
    .replace('REPLACE_WITH_DEMO_PASSWORD', randomBytes(16).toString('hex'));
  writeFileSync(rootEnv, values, { flag: 'wx' });
  console.log('Creado .env en la raíz con claves locales aleatorias.');
}

if (existsSync(apiEnv)) {
  console.log('Se conserva backend/.env existente.');
} else {
  const values = Object.fromEntries(readFileSync(rootEnv, 'utf8').split(/\r?\n/)
    .filter(line => line && !line.startsWith('#'))
    .map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
  const config = [
    'NODE_ENV=development', `PORT=${values.API_PORT || 3000}`,
    `CORS_ORIGINS=${values.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080'}`,
    'POSTGRES_HOST=localhost', 'POSTGRES_PORT=5432',
    ...['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'MONGO_USER', 'MONGO_PASSWORD', 'JWT_SECRET', 'SEED_PASSWORD']
      .map(key => `${key}=${values[key]}`),
    `MONGODB_URI=mongodb://${encodeURIComponent(values.MONGO_USER)}:${encodeURIComponent(values.MONGO_PASSWORD)}@localhost:27017/tripplan?authSource=admin`,
  ];
  writeFileSync(apiEnv, config.join('\n') + '\n', { flag: 'wx' });
  console.log('Creado backend/.env para ejecución fuera de Docker.');
}
console.log('Las credenciales se guardaron localmente; no se imprimen ni se suben a Git.');
