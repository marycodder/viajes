import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

// Comprobación local de solo lectura. Las credenciales y tokens nunca se imprimen.
async function check() {
  const env = parseEnv(await readFile(new URL('../../.env', import.meta.url), 'utf8'));
  const api = `http://127.0.0.1:${env.API_PORT || 3000}`;
  const web = `http://127.0.0.1:${env.WEB_PORT || 8080}`;
  let token;
  async function get(path, options = {}) {
    const response = await fetch(`${api}${path}`, {
      ...options,
      signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: HTTP ${response.status}`);
    return response.json();
  }
  const health = await get('/api/v1/health');
  assert.equal(health.status, 'ok');
  assert.equal(health.services.postgres, 'up');
  assert.equal(health.services.mongodb, 'up');
  console.log('OK: PostgreSQL y MongoDB disponibles.');

  for (const [name, url] of [['Frontend', `${web}/`], ['Swagger', `${api}/docs`]]) {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `${name} debe responder HTTP 200.`);
    await response.body?.cancel();
    console.log(`OK: ${name} responde HTTP 200.`);
  }
  const contract = await get('/docs-json');
  assert.ok(contract.paths['/api/v1/trips/{tripId}/notes']);
  const operations = Object.values(contract.paths).reduce((count, path) => count + Object.keys(path).filter(method => ['get', 'post', 'patch', 'put', 'delete'].includes(method)).length, 0);
  console.log(`OK: contrato Swagger con ${operations} operaciones.`);

  if (!env.SEED_PASSWORD) throw new Error('Falta SEED_PASSWORD en el .env local.');
  const session = await get('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: 'demo@tripplan.local', password: env.SEED_PASSWORD }) });
  assert.ok(session.accessToken);
  token = session.accessToken;
  const trips = await get('/api/v1/trips');
  const demo = trips.find(trip => trip.name === 'Semana en Santiago (demo)');
  assert.ok(demo, 'Ejecuta el seed para crear el viaje de demostración.');
  const summary = await get(`/api/v1/trips/${demo.id}/summary`);
  console.log(`OK: cuenta demo y viaje persistido; presupuesto=${summary.budget} ${summary.currency}, gastado=${summary.spent}, disponible=${summary.remaining}.`);
  const notes = await get(`/api/v1/trips/${demo.id}/notes`);
  const recommendations = await get(`/api/v1/trips/${demo.id}/recommendations`);
  const events = await get(`/api/v1/trips/${demo.id}/events`);
  assert.ok(notes.length, 'El seed debe guardar una nota en MongoDB.');
  assert.ok(recommendations.length, 'El seed debe guardar una recomendación en MongoDB.');
  assert.ok(events.length, 'Espera unos segundos para que el worker entregue el historial.');
  console.log(`OK: MongoDB devuelve ${notes.length} notas, ${recommendations.length} recomendaciones y ${events.length} eventos del viaje demo.`);
  const destinations = await get(`/api/v1/trips/${demo.id}/destinations`);
  assert.ok(destinations.length, 'El viaje demo debe tener un destino.');
  const forecast = await get(`/api/v1/trips/${demo.id}/weather?destinationId=${destinations[0].id}`);
  console.log(forecast.available
    ? `OK: ${forecast.source} devuelve ${forecast.daily.length} días de pronóstico real.`
    : `OK: clima sin pronóstico para estas fechas: ${forecast.reason}`);
  console.log('Comprobación local completada sin modificar los datos.');
}

check().catch(error => {
  console.error(`Comprobación local fallida: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  process.exitCode = 1;
});
