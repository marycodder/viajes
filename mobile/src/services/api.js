
const API_URL = 'http://localhost:3000/api/v1';

// FUNCIÓN GENERAL PARA COMUNICARSE CON EL BACKEND
async function solicitar(ruta, metodo = 'GET', token = null, datos = null) {
  const controlador = new AbortController();

  const temporizador = setTimeout(() => {
    controlador.abort();
  }, 10000);

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

    const contenido = await respuesta.json().catch(() => null);

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
      throw new Error(
        'Tiempo de espera agotado. Revisa la conexión con el servidor.'
      );
    }

    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}

// AUTENTICACIÓN
export async function iniciarSesion(correo, contrasena) {
  return solicitar('/auth/login', 'POST', null, {
    email: correo,
    password: contrasena,
  });
}

// VIAJES
export async function obtenerViajes(token) {
  return solicitar('/trips?limit=100', 'GET', token);
}

// DESTINOS
export async function obtenerDestinos(token, viajeId) {
  return solicitar(
    `/trips/${viajeId}/destinations`,
    'GET',
    token
  );
}

// DÍAS DEL ITINERARIO
export async function obtenerDias(token, viajeId) {
  return solicitar(
    `/trips/${viajeId}/days?limit=100`,
    'GET',
    token
  );
}

// ACTIVIDADES DEL VIAJE
export async function obtenerActividades(token, viajeId) {
  return solicitar(
    `/trips/${viajeId}/activities?limit=100`,
    'GET',
    token
  );
}

// MARCAR UNA ACTIVIDAD COMO REALIZADA
export async function completarActividad(
  token,
  viajeId,
  actividadId
) {
  return solicitar(
    `/trips/${viajeId}/activities/${actividadId}`,
    'PATCH',
    token,
    { status: 'completed' }
  );
}

// CONSULTAR EL RESUMEN DEL PRESUPUESTO
export async function obtenerPresupuesto(token, viajeId) {
  return solicitar(
    `/trips/${viajeId}/summary`,
    'GET',
    token
  );
}

// CONSULTAR GASTOS
export async function obtenerGastos(token, viajeId) {
  return solicitar(
    `/trips/${viajeId}/expenses?limit=100`,
    'GET',
    token
  );
}

// REGISTRAR UN GASTO
export async function registrarGasto(token, viajeId, gasto) {
  return solicitar(
    `/trips/${viajeId}/expenses`,
    'POST',
    token,
    gasto
  );
}
