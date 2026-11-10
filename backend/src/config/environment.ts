export function validateEnvironment(input: Record<string, unknown>) {
  const env = { ...input };
  for (const key of ['POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'MONGODB_URI', 'JWT_SECRET']) {
    if (typeof env[key] !== 'string' || !(env[key] as string).trim() || (env[key] as string).includes('REPLACE_WITH')) {
      throw new Error(`Falta configurar ${key}. Ejecuta node backend/scripts/setup-env.mjs desde la raíz.`);
    }
  }
  if (String(env.JWT_SECRET).length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
  for (const [key, fallback] of [['PORT', 3000], ['POSTGRES_PORT', 5432]] as const) {
    const value = Number(env[key] || fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`${key} no es un puerto válido.`);
    env[key] = value;
  }
  return env;
}
