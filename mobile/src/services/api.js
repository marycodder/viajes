
const API_URL = 'http://localhost:3000/api/v1';

// FUNCIÓN GENERAL DE CONEXIÓN
async function solicitar(ruta, metodo = 'GET', token = null, datos = null) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 10000);

  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(datos !== null
        ? { body: JSON.stringify(datos) }
        : {}),
      signal: controlador.signal,
    });

    const contenido = respuesta.status === 204
      ? null
      : await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      const mensaje = contenido?.message;

      throw new Error(
        Array.isArray(mensaje)
          ? mensaje.join(', ')
          : mensaje || `Error HTTP ${respuesta.status}`
      );
    }

    return contenido;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Revisa la conexión.');
    }

    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}

// AUTENTICACIÓN
export function iniciarSesion(correo, contrasena) {
  return solicitar('/auth/login', 'POST', null, {
    email: correo,
    password: contrasena,
  });
}

// VIAJES
export function obtenerViajes(token) {
  return solicitar('/trips?limit=100', 'GET', token);
}

// DESTINOS DEL VIAJE
export function obtenerDestinos(token, viajeId) {
  return solicitar(`/trips/${viajeId}/destinations`, 'GET', token);
}

// DÍAS DEL ITINERARIO
export function obtenerDias(token, viajeId) {
  return solicitar(`/trips/${viajeId}/days?limit=100`, 'GET', token);
}

// ACTIVIDADES DEL VIAJE
export function obtenerActividades(token, viajeId) {
  return solicitar(`/trips/${viajeId}/activities?limit=100`, 'GET', token);
}

// MARCAR ACTIVIDAD COMO REALIZADA
export function completarActividad(token, viajeId, actividadId) {
  return solicitar(
    `/trips/${viajeId}/activities/${actividadId}`,
    'PATCH',
    token,
    { status: 'completed' }
  );
}

// RESUMEN DEL PRESUPUESTO
export function obtenerPresupuesto(token, viajeId) {
  return solicitar(`/trips/${viajeId}/summary`, 'GET', token);
}

// GASTOS
export function obtenerGastos(token, viajeId) {
  return solicitar(`/trips/${viajeId}/expenses?limit=100`, 'GET', token);
}

// REGISTRAR GASTO
export function registrarGasto(token, viajeId, gasto) {
  return solicitar(
    `/trips/${viajeId}/expenses`,
    'POST',
    token,
    gasto
  );
}
