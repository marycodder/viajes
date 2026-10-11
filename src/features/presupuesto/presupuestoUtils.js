// Funciones puras del módulo de presupuesto (sin React).
// Convención: todos los montos de los ítems están en la moneda del viaje.

export const CATEGORIAS = [
  { id: 'vuelos', nombre: 'Vuelos / traslado largo', color: '#6366f1' },
  { id: 'alojamiento', nombre: 'Alojamiento', color: '#0ea5e9' },
  { id: 'transporte', nombre: 'Transporte local', color: '#14b8a6' },
  { id: 'comida', nombre: 'Comida', color: '#f59e0b' },
  { id: 'actividades', nombre: 'Actividades', color: '#ec4899' },
  { id: 'otros', nombre: 'Otros / imprevistos', color: '#94a3b8' },
]

export const MONEDAS = ['USD', 'EUR', 'CLP', 'ARS', 'MXN', 'COP', 'PEN', 'BRL', 'GBP', 'JPY']

// Tasas aproximadas (1 USD = X). Solo se usan si no hay API ni caché.
export const TASAS_RESPALDO = {
  USD: 1, EUR: 0.92, CLP: 950, ARS: 1000, MXN: 18, COP: 4000,
  PEN: 3.75, BRL: 5.5, GBP: 0.78, JPY: 150,
}

// ---- Parámetros de la simulación (valores en USD, por persona y por día) ----
export const ESTILOS = {
  economico: { nombre: 'Económico (mochilero)', alojamiento: 25, transporte: 8, comida: 15, actividades: 10, otros: 5, vuelos: 0.7 },
  medio: { nombre: 'Medio', alojamiento: 70, transporte: 20, comida: 35, actividades: 30, otros: 10, vuelos: 1 },
  premium: { nombre: 'Premium', alojamiento: 200, transporte: 60, comida: 90, actividades: 80, otros: 30, vuelos: 2.2 },
}

// Multiplicador según qué tan caro es el destino.
export const NIVELES_COSTO = {
  bajo: { nombre: 'Destino barato (ej. Sudeste asiático, Bolivia)', factor: 0.6 },
  medio: { nombre: 'Destino intermedio (ej. Chile, México)', factor: 1 },
  alto: { nombre: 'Destino caro (ej. Suiza, Japón, Nueva York)', factor: 1.6 },
}

// Vuelo ida y vuelta por persona en USD (estilo "medio").
export const DISTANCIAS = {
  regional: { nombre: 'Regional (mismo subcontinente)', vuelo: 250 },
  continental: { nombre: 'Continental', vuelo: 600 },
  intercontinental: { nombre: 'Intercontinental', vuelo: 1200 },
}

export const PARAMETROS_INICIALES = {
  estilo: 'medio',
  nivelCosto: 'medio',
  distancia: 'continental',
}

const redondear = (n) => Math.round(n * 100) / 100

/** Convierte entre monedas usando tasas con base USD. */
export function convertir(monto, de, a, tasas) {
  if (de === a) return monto
  const tDe = tasas[de]
  const tA = tasas[a]
  if (!tDe || !tA) return monto
  return (monto / tDe) * tA
}

export function formatearMonto(monto, moneda) {
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: moneda,
      maximumFractionDigits: moneda === 'CLP' || moneda === 'JPY' || moneda === 'COP' ? 0 : 2,
    }).format(monto || 0)
  } catch {
    return `${redondear(monto || 0)} ${moneda}`
  }
}

/** Genera un presupuesto simulado (una línea por categoría). */
export function generarSimulacion({ dias, viajeros, estilo, nivelCosto, distancia }, moneda, tasas) {
  const d = Math.max(1, Number(dias) || 1)
  const v = Math.max(1, Number(viajeros) || 1)
  const e = ESTILOS[estilo] ?? ESTILOS.medio
  const factor = (NIVELES_COSTO[nivelCosto] ?? NIVELES_COSTO.medio).factor
  const vueloBase = (DISTANCIAS[distancia] ?? DISTANCIAS.continental).vuelo
  const habitaciones = Math.ceil(v / 2)
  const noches = Math.max(1, d - 1)

  const usd = {
    vuelos: vueloBase * e.vuelos * v,
    alojamiento: e.alojamiento * factor * noches * habitaciones,
    transporte: e.transporte * factor * d * v,
    comida: e.comida * factor * d * v,
    actividades: e.actividades * factor * d * v,
  }
  // Imprevistos: 10% de todo lo anterior, más el "otros" diario del estilo.
  const subtotal = Object.values(usd).reduce((a, b) => a + b, 0)
  usd.otros = subtotal * 0.1 + e.otros * factor * d * v

  const detalle = {
    vuelos: `Vuelos ida y vuelta (${v} ${v === 1 ? 'persona' : 'personas'})`,
    alojamiento: `${noches} ${noches === 1 ? 'noche' : 'noches'} × ${habitaciones} ${habitaciones === 1 ? 'habitación' : 'habitaciones'}`,
    transporte: `${d} ${d === 1 ? 'día' : 'días'} × ${v} ${v === 1 ? 'persona' : 'personas'}`,
    comida: `${d} ${d === 1 ? 'día' : 'días'} × ${v} ${v === 1 ? 'persona' : 'personas'}`,
    actividades: 'Entradas y tours estimados',
    otros: 'Imprevistos (10%) y gastos menores',
  }

  return CATEGORIAS.map((c) => ({
    id: `sim-${c.id}`,
    categoria: c.id,
    concepto: `${c.nombre} · ${detalle[c.id]}`,
    monto: redondear(convertir(usd[c.id], 'USD', moneda, tasas)),
    dia: null,
    origen: 'simulado',
  }))
}

export function totalPorCategoria(items) {
  const acc = Object.fromEntries(CATEGORIAS.map((c) => [c.id, 0]))
  for (const it of items) {
    acc[it.categoria] = (acc[it.categoria] ?? 0) + (Number(it.monto) || 0)
  }
  return acc
}

export function sumar(items) {
  return redondear(items.reduce((a, it) => a + (Number(it.monto) || 0), 0))
}

/** Gasto agrupado por día del itinerario (solo ítems con `dia`). */
export function totalPorDia(items) {
  const acc = {}
  for (const it of items) {
    if (it.dia == null) continue
    acc[it.dia] = (acc[it.dia] ?? 0) + (Number(it.monto) || 0)
  }
  return acc
}

export const UMBRAL_ALERTA = 0.85

/**
 * Resumen general.
 * estado: 'sinMeta' | 'ok' | 'alerta' (>=85%) | 'excedido' (>100%)
 */
export function calcularResumen({ items, presupuestoTotal, dias, viajeros }) {
  const gastado = sumar(items)
  const meta = Number(presupuestoTotal) || 0
  const d = Math.max(1, Number(dias) || 1)
  const v = Math.max(1, Number(viajeros) || 1)
  const restante = redondear(meta - gastado)
  const porcentaje = meta > 0 ? gastado / meta : 0
  let estado = 'sinMeta'
  if (meta > 0) {
    estado = porcentaje > 1 ? 'excedido' : porcentaje >= UMBRAL_ALERTA ? 'alerta' : 'ok'
  }
  return {
    gastado,
    meta,
    restante,
    porcentaje,
    estado,
    porPersona: redondear(gastado / v),
    porDia: redondear(gastado / d),
    porPersonaPorDia: redondear(gastado / d / v),
  }
}

