import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

async function navigate(page, label) {
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  const link = nav.getByRole('link', { name: label, exact: true });
  if (!(await link.isVisible()))
    await nav.getByRole('button', { name: 'Abrir menú de navegación' }).click();
  await link.click();
}
async function submit(form) {
  await form.locator('button[type="submit"]').click();
}
async function login(page, email, password) {
  const form = page.getByRole('form', { name: 'Iniciar sesión' });
  await form.getByLabel('Correo electrónico').fill(email);
  await form.getByLabel('Contraseña', { exact: false }).fill(password);
  await submit(form);
  await expect(
    page.getByRole('navigation', { name: 'Navegación principal' }),
  ).toBeVisible();
}

test('flujo completo React, SQL, MongoDB, persistencia, permisos y errores', async ({
  page,
  browser,
  request,
  baseURL,
}, testInfo) => {
  const marker = randomUUID().slice(0, 8);
  const email = `web-owner-${marker}@example.com`;
  const password = `Viajes2026${marker}`;
  const tripName = `Viaje web ${marker}`;
  const destinationName = `Destino web ${marker}`;
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());
  // Ritmo de interacción limitado para respetar los límites reales por IP de la API.
  let nextRequest = 0;
  await page.route('**/api/v1/**', async (route) => {
    const wait = Math.max(0, nextRequest - Date.now());
    nextRequest = Math.max(nextRequest, Date.now()) + 550;
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    await route.continue();
  });
  let token, trip, destination;
  let guestContext;
  try {
    await test.step('ruta protegida, registro y viaje vacío', async () => {
      await page.goto('/itinerario');
      await expect(page).toHaveURL(/\/login$/);
      await page
        .getByRole('button', { name: 'No tengo cuenta: registrarme' })
        .click();
      const form = page.getByRole('form', { name: 'Crear cuenta' });
      await form.getByLabel('Nombre').fill('Propietario web');
      await form.getByLabel('Correo electrónico').fill(email);
      await form.getByLabel('Contraseña', { exact: false }).fill(password);
      await submit(form);
      await expect(
        page.getByRole('heading', { name: 'Comienza tu planificación' }),
      ).toBeVisible();
      token = await page.evaluate(() =>
        sessionStorage.getItem('tripplan_token'),
      );
      await navigate(page, 'Viajes');
      const tripForm = page.getByRole('form', { name: 'Crear viaje' });
      await tripForm.getByLabel('Nombre del viaje').fill(tripName);
      await tripForm.getByLabel('Fecha de inicio').fill('2027-01-10');
      await tripForm.getByLabel('Fecha de término').fill('2027-01-17');
      await tripForm.getByLabel('Presupuesto (CLP)').fill('10000');
      const created = page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/v1/trips') &&
          response.request().method() === 'POST',
      );
      await submit(tripForm);
      trip = await (await created).json();
      await expect(
        page.getByRole('heading', { name: tripName, exact: true }),
      ).toBeVisible();
    });

    await test.step('destinos, días, validación de duplicados y actividades', async () => {
      await navigate(page, 'Destinos');
      const form = page.getByRole('form', { name: 'Crear destino' });
      await form.getByLabel('Nombre del destino').fill(destinationName);
      await form.getByLabel('País').fill('Chile');
      await form.getByLabel('Latitud').fill('-33.4489');
      await form.getByLabel('Longitud').fill('-70.6693');
      const created = page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/v1/destinations') &&
          response.request().method() === 'POST',
      );
      await submit(form);
      destination = await (await created).json();
      const card = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: destinationName,
            exact: true,
          }),
        });
      await card
        .getByRole('button', { name: 'Agregar al viaje', exact: true })
        .click();
      await expect(card.getByText('En tu viaje')).toBeVisible();
      await navigate(page, 'Itinerario');
      const dayForm = page.getByRole('form', { name: 'Agregar día' });
      await dayForm
        .getByLabel('Destino del día')
        .selectOption({ label: destinationName });
      await dayForm.getByLabel('Fecha del día').fill('2027-01-11');
      await dayForm.getByLabel('Título del día').fill('Día de prueba');
      await submit(dayForm);
      await expect(
        page.getByRole('region', { name: 'Día 2027-01-11' }),
      ).toBeVisible();
      await dayForm
        .getByLabel('Destino del día')
        .selectOption({ label: destinationName });
      await dayForm.getByLabel('Fecha del día').fill('2027-01-11');
      await submit(dayForm);
      await expect(dayForm.getByRole('alert')).toContainText('conflicto');
      const activityForm = page.getByRole('form', {
        name: 'Agregar actividad',
      });
      await activityForm
        .getByLabel('Nombre de la actividad')
        .fill('Actividad persistente');
      await activityForm
        .getByLabel('Día del itinerario')
        .selectOption({ label: '2027-01-11 · Día de prueba' });
      await activityForm.getByLabel('Hora', { exact: false }).fill('09:00');
      await activityForm.getByLabel('Costo estimado (CLP)').fill('5000');
      await submit(activityForm);
      const activity = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: 'Actividad persistente',
            exact: true,
          }),
        });
      await expect(activity).toBeVisible();
      await activity
        .getByRole('button', { name: 'Editar actividad', exact: true })
        .click();
      const edit = page.getByRole('form', { name: 'Editar actividad' });
      await edit.getByLabel('Estado de la actividad').selectOption('completed');
      await submit(edit);
      await expect(
        activity.getByText('Completada', { exact: true }),
      ).toBeVisible();
      await activity
        .getByRole('button', { name: 'Agregar a favoritos' })
        .click();
      await expect(
        activity.getByRole('button', { name: 'Quitar de favoritos' }),
      ).toHaveAttribute('aria-pressed', 'true');
      await navigate(page, 'Favoritos');
      await expect(
        page.getByRole('heading', {
          name: 'Actividad persistente',
          exact: true,
        }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByRole('heading', {
          name: 'Actividad persistente',
          exact: true,
        }),
      ).toBeVisible();
    });

    await test.step('gastos reales, presupuesto y reservas', async () => {
      await navigate(page, 'Presupuesto');
      const form = page.getByRole('form', { name: 'Registrar gasto' });
      await form.getByLabel('Descripción del gasto').fill('Gasto persistente');
      await form.getByLabel('Monto pagado (CLP)').fill('12000');
      await form
        .getByLabel('Actividad relacionada')
        .selectOption({ label: 'Actividad persistente' });
      await submit(form);
      const expense = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: 'Gasto persistente',
            exact: true,
          }),
        });
      await expect(expense).toContainText('12.000');
      await expect(
        page.getByRole('alert').filter({ hasText: 'superan el presupuesto' }),
      ).toBeVisible();
      await expect(page.getByText(/Estimado de actividades:/)).toContainText(
        '5.000',
      );
      await expense
        .getByRole('button', { name: 'Editar gasto', exact: true })
        .click();
      const edit = page.getByRole('form', { name: 'Editar gasto' });
      await edit.getByLabel('Monto pagado (CLP)').fill('8000');
      await submit(edit);
      await expect(expense).toContainText('8.000');
      await navigate(page, 'Reservas');
      const reservation = page.getByRole('form', { name: 'Crear reserva' });
      await reservation.getByLabel('Proveedor').fill('Proveedor de prueba');
      await reservation
        .getByLabel('Estado de la reserva')
        .selectOption('confirmed');
      await reservation
        .getByLabel('Actividad relacionada')
        .selectOption({ label: 'Actividad persistente' });
      await submit(reservation);
      const card = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: 'Proveedor de prueba',
            exact: true,
          }),
        });
      await expect(card).toContainText('Confirmada');
      await card
        .getByRole('button', { name: 'Cancelar reserva', exact: true })
        .click();
      await expect(card).toContainText('Cancelada');
      await navigate(page, 'Itinerario');
      const activity = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: 'Actividad persistente',
            exact: true,
          }),
        });
      await activity
        .getByRole('button', { name: 'Eliminar actividad', exact: true })
        .click();
      await expect(activity.getByRole('alert')).toContainText(
        'gastos o reservas',
      );
    });

    await test.step('notas y recomendaciones persistidas en MongoDB e historial visible', async () => {
      await navigate(page, 'Notas');
      const note = page.getByRole('form', { name: 'Crear nota' });
      await note.getByLabel('Título').fill('Equipaje persistente');
      await note.getByLabel('Contenido').fill('Agua y protector solar.');
      await note.getByLabel('Etiquetas').fill('equipaje, turismo');
      await submit(note);
      const card = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: 'Equipaje persistente',
            exact: true,
          }),
        });
      await card
        .getByRole('button', { name: 'Editar nota', exact: true })
        .click();
      const edit = page.getByRole('form', { name: 'Editar nota' });
      await edit
        .getByLabel('Contenido')
        .fill('Agua, protector solar y calzado cómodo.');
      await submit(edit);
      await expect(card).toContainText('Agua, protector solar y calzado cómodo.');
      await page.reload();
      await expect(
        page.getByText('Agua, protector solar y calzado cómodo.', {
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Recomendaciones', exact: true })
        .click();
      const recommendation = page.getByRole('form', {
        name: 'Crear recomendación',
      });
      await recommendation.getByLabel('Título').fill('Consejo persistente');
      await recommendation
        .getByLabel('Contenido')
        .fill('Revisar horarios antes de salir.');
      await submit(recommendation);
      await expect(
        page.getByRole('heading', { name: 'Consejo persistente', exact: true }),
      ).toBeVisible();
      await navigate(page, 'Historial');
      await expect(
        page.getByRole('heading', { name: 'Gasto creado', exact: true }),
      ).toBeVisible();
    });

    await test.step('viajero con lectura, favoritos personales y tercero sin acceso', async () => {
      const guestEmail = `web-guest-${marker}@example.com`;
      const guest = await request.post('/api/v1/auth/register', {
        data: { name: 'Viajero web', email: guestEmail, password },
      });
      expect(guest.ok()).toBeTruthy();
      const guestSession = await guest.json();
      await navigate(page, 'Viajes');
      const add = page.getByRole('form', { name: 'Agregar viajero' });
      await add.getByLabel('Correo del viajero registrado').fill(guestEmail);
      await submit(add);
      await expect(
        page.getByRole('heading', { name: 'Viajero web', exact: true }),
      ).toBeVisible();
      guestContext = await browser.newContext({
        baseURL,
        viewport: { width: 1440, height: 1000 },
      });
      const guestPage = await guestContext.newPage();
      await guestPage.goto('/login');
      await login(guestPage, guestEmail, password);
      await navigate(guestPage, 'Favoritos');
      await expect(
        guestPage.getByRole('heading', { name: 'Todavía no tienes favoritos' }),
      ).toBeVisible();
      await navigate(guestPage, 'Itinerario');
      await expect(
        guestPage.getByRole('form', { name: 'Agregar actividad' }),
      ).toHaveCount(0);
      await expect(
        guestPage.getByRole('button', {
          name: 'Editar actividad',
          exact: true,
        }),
      ).toHaveCount(0);
      await guestPage
        .getByRole('button', { name: 'Agregar a favoritos' })
        .click();
      await expect(
        guestPage.getByRole('button', { name: 'Quitar de favoritos' }),
      ).toBeVisible();
      const forbidden = await request.patch(`/api/v1/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${guestSession.accessToken}` },
        data: { budget: 0 },
      });
      expect(forbidden.status()).toBe(403);
      const outsider = await request.post('/api/v1/auth/register', {
        data: {
          name: 'Ajeno web',
          email: `web-outsider-${marker}@example.com`,
          password,
        },
      });
      expect(outsider.ok()).toBeTruthy();
      const outsiderSession = await outsider.json();
      const denied = await request.get(`/api/v1/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${outsiderSession.accessToken}` },
      });
      expect(denied.status()).toBe(403);
      await guestContext.close();
      guestContext = null;
    });

    await test.step('cierre de sesión, nuevo acceso y persistencia', async () => {
      await page
        .getByRole('button', { name: 'Cerrar sesión', exact: true })
        .click();
      await expect(page).toHaveURL(/\/login$/);
      await login(page, email, password);
      await navigate(page, 'Presupuesto');
      await expect(
        page.getByRole('heading', { name: 'Gasto persistente', exact: true }),
      ).toBeVisible();
      await expect(
        page.locator('.stat-card').filter({ hasText: 'Gastado realmente' }),
      ).toContainText('8.000');
      await navigate(page, 'Notas');
      await expect(
        page.getByRole('heading', {
          name: 'Equipaje persistente',
          exact: true,
        }),
      ).toBeVisible();
    });

    await test.step('error de conexión, recuperación y pantalla móvil', async () => {
      await page.route('**/api/v1/trips/*/expenses?*', (route) =>
        route.abort(),
      );
      await navigate(page, 'Presupuesto');
      await expect(
        page.getByRole('alert').filter({ hasText: 'No se pudo conectar' }),
      ).toBeVisible();
      await page.unroute('**/api/v1/trips/*/expenses?*');
      await page
        .getByRole('button', { name: 'Reintentar', exact: true })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Gasto persistente', exact: true }),
      ).toBeVisible();
      await page.setViewportSize({ width: 390, height: 844 });
      await navigate(page, 'Inicio');
      await expect(
        page.getByRole('heading', { name: tripName, exact: true }).first(),
      ).toBeVisible();
      await expect(page.getByText('Cargando…', { exact: true })).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
      ).toBeTruthy();
      await page.screenshot({
        path: testInfo.outputPath('mobile.png'),
        fullPage: true,
      });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({
        path: testInfo.outputPath('desktop.png'),
        fullPage: true,
      });
      await page.evaluate(() =>
        sessionStorage.setItem('tripplan_token', 'invalid-token'),
      );
      await page.reload();
      await expect(page).toHaveURL(/\/login$/);
      expect(errors).toEqual([]);
    });

    await test.step('editar el viaje y eliminar recursos propios desde la interfaz', async () => {
      await login(page, email, password);
      await navigate(page, 'Viajes');
      const card = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', { name: tripName, exact: true }),
        });
      await card
        .getByRole('button', { name: 'Editar viaje', exact: true })
        .click();
      const edit = page.getByRole('form', { name: 'Editar viaje' });
      await edit.getByLabel('Nombre del viaje').fill(`${tripName} editado`);
      await submit(edit);
      const updated = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: `${tripName} editado`,
            exact: true,
          }),
        });
      await expect(updated).toBeVisible();
      await updated
        .getByRole('button', { name: 'Eliminar viaje', exact: true })
        .click();
      await expect(updated).toHaveCount(0);
      await navigate(page, 'Destinos');
      const destinationCard = page
        .getByRole('article')
        .filter({
          has: page.getByRole('heading', {
            name: destinationName,
            exact: true,
          }),
        });
      await destinationCard
        .getByRole('button', { name: 'Editar destino', exact: true })
        .click();
      const editDestination = page.getByRole('form', {
        name: 'Editar destino',
      });
      await editDestination
        .getByLabel('Región', { exact: true })
        .fill('Región de prueba');
      await submit(editDestination);
      await expect(destinationCard).toContainText('Región de prueba');
      await destinationCard
        .getByRole('button', { name: 'Eliminar destino', exact: true })
        .click();
      await expect(destinationCard).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  } finally {
    if (guestContext) await guestContext.close();
    if (token && trip?.id) {
      const deleted = await request.delete(`/api/v1/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(deleted.status());
    }
    if (token && destination?.id) {
      const deleted = await request.delete(
        `/api/v1/destinations/${destination.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect([200, 404]).toContain(deleted.status());
    }
  }
});
