import { useState } from 'react'
import { CATEGORIAS, formatearMonto } from './presupuestoUtils'

const nombreCat = (id) => CATEGORIAS.find((c) => c.id === id)?.nombre ?? id
const ETIQUETA_ORIGEN = { simulado: 'Estimado', manual: 'Manual', actividad: 'Itinerario' }

export default function GastosLista({ items, moneda, dias, onAgregar, onEliminar, onEditar }) {
  const [form, setForm] = useState({ categoria: 'comida', concepto: '', monto: '', dia: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const enviar = (e) => {
    e.preventDefault()
    const monto = Number(form.monto)
    if (!form.concepto.trim() || !(monto > 0)) return
    onAgregar({
      id: crypto.randomUUID(),
      categoria: form.categoria,
      concepto: form.concepto.trim(),
      monto,
      dia: form.dia === '' ? null : Number(form.dia),
      origen: 'manual',
    })
    setForm((f) => ({ ...f, concepto: '', monto: '' }))
  }

  return (
    <section>
      <h2>Gastos</h2>

      <form onSubmit={enviar}>
        <label>
          Categoría{' '}
          <select value={form.categoria} onChange={set('categoria')}>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Concepto{' '}
          <input value={form.concepto} onChange={set('concepto')} placeholder="Ej. Cena en el centro" required />
        </label>

        <label>
          Monto ({moneda}){' '}
          <input type="number" min="0" step="any" value={form.monto} onChange={set('monto')} required />
        </label>

        <label>
          Día (opcional){' '}
          <select value={form.dia} onChange={set('dia')}>
            <option value="">—</option>
            {Array.from({ length: dias }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Día {i + 1}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Agregar</button>
      </form>

      {items.length === 0 ? (
        <p>Sin gastos todavía.</p>
      ) : (
        <ul>
          {items.map((it) => {
            const editable = it.origen !== 'actividad'
            return (
              <li key={it.id}>
                <strong>{it.concepto}</strong>
                <small>
                  {' '}
                  · {nombreCat(it.categoria)} · {ETIQUETA_ORIGEN[it.origen]}
                  {it.dia != null && ` · Día ${it.dia}`}
                </small>{' '}
                {editable ? (
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={it.monto}
                    aria-label={`Monto de ${it.concepto}`}
                    onChange={(e) => onEditar(it.id, Math.max(0, Number(e.target.value) || 0))}
                  />
                ) : (
                  <b>{formatearMonto(it.monto, moneda)}</b>
                )}{' '}
                {editable && (
                  <button type="button" aria-label={`Eliminar ${it.concepto}`} onClick={() => onEliminar(it.id)}>
                    ×
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
