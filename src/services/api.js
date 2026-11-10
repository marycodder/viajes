const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(
  /\/$/,
  '',
);
const tokenKey = 'tripplan_token';

export const sessionToken = {
  get: () => sessionStorage.getItem(tokenKey),
  set: (token) =>
    token
      ? sessionStorage.setItem(tokenKey, token)
      : sessionStorage.removeItem(tokenKey),
};

export async function request(path, { method = 'GET', body, signal } = {}) {
  const token = sessionToken.get();
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      'No se pudo conectar con el servidor. Comprueba tu conexión e intenta nuevamente.',
      { cause: error },
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith('/auth/')) {
      sessionToken.set(null);
      window.dispatchEvent(new Event('tripplan:unauthorized'));
    }
    const message = Array.isArray(data?.message)
      ? data.message.join(' · ')
      : data?.message;
    throw new Error(
      message || `No se pudo completar la operación (${response.status}).`,
    );
  }
  return data;
}

// La API pagina a 100 registros: se recorren las páginas para no ocultar datos.
export async function listAll(path, { signal } = {}) {
  const rows = [];
  for (let offset = 0; ; offset += 100) {
    const page = await request(
      `${path}${path.includes('?') ? '&' : '?'}limit=100&offset=${offset}`,
      { signal },
    );
    rows.push(...page);
    if (page.length < 100) return rows;
  }
}
