import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';

const base = (process.env.API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const password = `Viajes1${randomBytes(12).toString('hex')}`;
const run = randomUUID();
let token;
let trip;
let destination;
async function request(path, method = 'GET', body, expected = 200, auth = token) {
  const response = await fetch(`${base}${path}`, { method, signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
}

try {
  assert.equal((await request('/health')).status, 'ok');
  await request('/trips', 'GET', undefined, 401, '');
  const owner = await request('/auth/register', 'POST', { name: 'Smoke propietario', email: `smoke-owner-${run}@example.com`, password }, 201, '');
  token = owner.accessToken;
  const traveler = await request('/auth/register', 'POST', { name: 'Smoke viajero', email: `smoke-traveler-${run}@example.com`, password }, 201, '');
  const stranger = await request('/auth/register', 'POST', { name: 'Smoke ajeno', email: `smoke-stranger-${run}@example.com`, password }, 201, '');
  await request('/auth/login', 'POST', { email: owner.user.email, password }, 200, '');
  assert.equal((await request('/users/me')).passwordHash, undefined);
  console.log('OK: autenticación y perfil sin credenciales expuestas.');

  trip = await request('/trips', 'POST', { name: `Smoke ${run}`, startDate: '2027-01-10', endDate: '2027-01-17', budget: 10000 }, 201);
  assert.equal((await request(`/trips/${trip.id}`)).name, trip.name);
  await request(`/trips/${trip.id}`, 'GET', undefined, 403, stranger.accessToken);
  await request(`/trips/${trip.id}/travelers`, 'POST', { email: traveler.user.email }, 201);
  await request(`/trips/${trip.id}`, 'PATCH', { budget: 999 }, 403, traveler.accessToken);
  destination = await request('/destinations', 'POST', { name: `Santiago smoke ${run}`, country: 'Chile', latitude: -33.4489, longitude: -70.6693 }, 201);
  await request(`/trips/${trip.id}/destinations`, 'POST', { destinationId: destination.id }, 201);
  await request(`/trips/${trip.id}/days`, 'POST', { destinationId: destination.id, date: '2027-01-09' }, 400);
  const day = await request(`/trips/${trip.id}/days`, 'POST', { destinationId: destination.id, date: '2027-01-11' }, 201);
  await request(`/trips/${trip.id}/days`, 'POST', { destinationId: destination.id, date: '2027-01-11' }, 409);
  const activity = await request(`/trips/${trip.id}/activities`, 'POST', { dayId: day.id, name: 'Cerro smoke', category: 'Turismo', time: '09:00', estimatedCost: 5000 }, 201);
  await request(`/trips/${trip.id}/activities/${activity.id}/favorite`, 'PUT', undefined, 200, traveler.accessToken);
  assert.equal((await request(`/trips/${trip.id}/favorites`, 'GET', undefined, 200, traveler.accessToken)).length, 1);
  assert.equal((await request(`/trips/${trip.id}/favorites`)).length, 0);
  console.log('OK: persistencia SQL, viajeros, permisos, días, actividades y favoritos personales.');

  await request(`/trips/${trip.id}/expenses`, 'POST', { description: 'Inválido', category: 'Turismo', date: '2027-01-11', amount: -1 }, 400);
  await request(`/trips/${trip.id}/expenses`, 'POST', { description: 'Gasto real smoke', category: 'Turismo', date: '2027-01-11', amount: 12000, activityId: activity.id }, 201);
  const summary = await request(`/trips/${trip.id}/summary`);
  assert.equal(summary.spent, 12000); assert.equal(summary.estimatedActivitiesCost, 5000);
  assert.equal(summary.remaining, -2000); assert.equal(summary.overBudget, true);
  const reservation = await request(`/trips/${trip.id}/reservations`, 'POST', { provider: 'Reserva smoke', type: 'activity', startDate: '2027-01-11', endDate: '2027-01-11', activityId: activity.id }, 201);
  await request(`/trips/${trip.id}/reservations/${reservation.id}`, 'PATCH', { status: 'confirmed' });
  await request(`/trips/${trip.id}/activities/${activity.id}`, 'DELETE', undefined, 409);
  await request(`/trips/${trip.id}`, 'PATCH', { startDate: '2027-01-12' }, 400);
  console.log('OK: gastos reales, indicadores, reservas y validaciones de dependencias.');

  const note = await request(`/trips/${trip.id}/notes`, 'POST', { title: 'Nota smoke', content: 'Documento persistido en MongoDB', tags: ['prueba'] }, 201);
  assert.ok((await request(`/trips/${trip.id}/notes`)).some(item => item._id === note._id));
  await request(`/trips/${trip.id}/notes/${note._id}`, 'PATCH', { content: 'Nota actualizada' });
  const recommendation = await request(`/trips/${trip.id}/recommendations`, 'POST', { title: 'Recomendación smoke', content: 'Revisar horarios antes de salir.', tags: ['turismo'] }, 201);
  assert.ok((await request(`/trips/${trip.id}/recommendations`)).some(item => item._id === recommendation._id));
  let events = [];
  for (let attempt = 0; attempt < 12; attempt++) {
    events = await request(`/trips/${trip.id}/events`);
    if (events.some(event => event.action === 'expense.created')) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  assert.ok(events.some(event => event.action === 'expense.created'), 'El worker debe entregar el historial a MongoDB.');
  await request(`/trips/${trip.id}/notes/${note._id}`, 'DELETE');
  console.log('OK: escritura, lectura y actualización MongoDB; historial entregado desde SQL.');
  console.log('Prueba de integración completa aprobada. Se eliminan el viaje y el destino de prueba; permanecen tres cuentas de prueba sin privilegios.');
} catch (error) {
  console.error(`La comprobación falló: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  process.exitCode = 1;
} finally {
  if (trip && token) {
    try { await request(`/trips/${trip.id}`, 'DELETE'); }
    catch { console.error('No fue posible limpiar el viaje de prueba.'); process.exitCode = 1; }
  }
  if (destination && token) {
    try { await request(`/destinations/${destination.id}`, 'DELETE'); }
    catch { console.error('No fue posible limpiar el destino de prueba.'); process.exitCode = 1; }
  }
}
