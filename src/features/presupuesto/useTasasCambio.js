import { useEffect, useState } from 'react'
import { TASAS_RESPALDO } from './presupuestoUtils'

// API gratuita y sin clave (base USD): https://open.er-api.com
const URL_TASAS = 'https://open.er-api.com/v6/latest/USD'
const CLAVE_CACHE = 'viajes.tasas.v1'
const VIGENCIA_MS = 12 * 60 * 60 * 1000 // 12 horas

function leerCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE_CACHE))
    return c?.tasas ? c : null
  } catch {
    return null
  }
}

/**
 * Tasas de cambio con base USD.
 * fuente: 'cache' | 'api' | 'respaldo' (valores aproximados fijos)
 */
export function useTasasCambio() {
  const [estado, setEstado] = useState(() => {
    const c = leerCache()
    return c
      ? { tasas: c.tasas, fuente: 'cache', fecha: c.fecha, cargando: Date.now() - c.guardado > VIGENCIA_MS }
      : { tasas: TASAS_RESPALDO, fuente: 'respaldo', fecha: null, cargando: true }
  })

  useEffect(() => {
    const c = leerCache()
    if (c && Date.now() - c.guardado <= VIGENCIA_MS) return

    const ctrl = new AbortController()
    fetch(URL_TASAS, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (data.result !== 'success' || !data.rates) throw new Error('Respuesta inválida')
        const fecha = data.time_last_update_utc ?? null
        try {
          localStorage.setItem(CLAVE_CACHE, JSON.stringify({ tasas: data.rates, fecha, guardado: Date.now() }))
        } catch {
          /* sin caché */
        }
        setEstado({ tasas: data.rates, fuente: 'api', fecha, cargando: false })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setEstado((prev) => ({ ...prev, cargando: false }))
      })

    return () => ctrl.abort()
  }, [])

  return estado
}

