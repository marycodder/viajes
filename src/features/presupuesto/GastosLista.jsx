import { useState } from 'react'
import { CATEGORIAS, formatearMonto } from './presupuestoUtils'

const nombreCat = (id) => CATEGORIAS.find((c) => c.id === id)?.nombre ?? id
const colorCat = (id) => CATEGORIAS.find((c) => c.id === id)?.color ?? '#8C7B5B'
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
    <section className="pres-card" aria-labelledby="pres-gastos">
      <h3 id="pres-gastos">Gastos</h3>

      <form className="pres-form" onSubmit={enviar}>
        <label className="pres-field">
          <span>Categoría</span>
          <select value={form.categoria} onChange={set('categoria')}>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="pres-field">
          <span>Concepto</span>
          <input value={form.concepto} onChange={set('concepto')} placeholder="Ej. Cena en el centro" required />
        </label>

        <label className="pres-field">
          <span>Monto ({moneda})</span>
          <input type="number" min="0" step="any" value={form.monto} onChange={set('monto')} required />
        </label>

        <label className="pres-field">
          <span>Día (opcional)</span>
          <select value={form.dia} onChange={set('dia')}>
            <option value="">—</option>
            {Array.from({ length: dias }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Día {i + 1}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="pres-btn">
          Agregar
        </button>
      </form>

      {items.length === 0 ? (
        <p className="pres-vacio">Sin gastos todavía.</p>
      ) : (
        <ul className="pres-lista">
          {items.map((it) => {
            const editable = it.origen !== 'actividad'
            return (
              <li key={it.id}>
                <i className="pres-punto" style={{ background: colorCat(it.categoria) }} title={nombreCat(it.categoria)} />
                <div className="pres-concepto">
                  <strong>{it.concepto}</strong>
                  <small>
                    {nombreCat(it.categoria)} · {ETIQUETA_ORIGEN[it.origen]}
                    {it.dia != null && ` · Día ${it.dia}`}
                  </small>
                </div>
                {editable ? (
                  <input
                    className="pres-monto"
                    type="number"
                    min="0"
                    step="any"
                    value={it.monto}
                    aria-label={`Monto de ${it.concepto}`}
                    onChange={(e) => onEditar(it.id, Math.max(0, Number(e.target.value) || 0))}
                  />
                ) : (
                  <b className="pres-monto">{formatearMonto(it.monto, moneda)}</b>
                )}
                {editable ? (
                  <button
                    type="button"
                    className="pres-x"
                    aria-label={`Eliminar ${it.concepto}`}
                    onClick={() => onEliminar(it.id)}
                  >
                    ×
                  </button>
                ) : (
                  <span className="pres-x" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

