import { CATEGORIAS, formatearMonto, totalPorCategoria } from './presupuestoUtils'

const MENSAJES = {
  sinMeta: 'Define un presupuesto total para ver cuánto te queda.',
  ok: 'Vas dentro del presupuesto.',
  alerta: 'Cuidado: ya usaste más del 85% del presupuesto.',
  excedido: 'Te pasaste del presupuesto. Revisa los gastos o sube la meta.',
}

export default function ResumenPresupuesto({ resumen, items, moneda }) {
  const m = (n) => formatearMonto(n, moneda)
  const porCategoria = totalPorCategoria(items)
  const pct = Math.min(100, Math.round(resumen.porcentaje * 100))

  return (
    <section className="pres-card" aria-labelledby="pres-resumen">
      <h3 id="pres-resumen">Resumen</h3>

      <div className="pres-kpis">
        <div className="pres-kpi">
          <span>Presupuesto</span>
          <strong>{m(resumen.meta)}</strong>
        </div>
        <div className="pres-kpi">
          <span>Gastado</span>
          <strong>{m(resumen.gastado)}</strong>
        </div>
        <div className={`pres-kpi ${resumen.restante < 0 ? 'negativo' : ''}`}>
          <span>Disponible</span>
          <strong>{m(resumen.restante)}</strong>
        </div>
        <div className="pres-kpi">
          <span>Por persona</span>
          <strong>{m(resumen.porPersona)}</strong>
        </div>
        <div className="pres-kpi">
          <span>Por día</span>
          <strong>{m(resumen.porDia)}</strong>
        </div>
      </div>

      <div
        className={`pres-barra estado-${resumen.estado}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Porcentaje del presupuesto gastado"
      >
        <div style={{ width: `${pct}%` }} />
      </div>
      <p className={`pres-mensaje estado-${resumen.estado}`} role="status">
        {resumen.meta > 0 && `${Math.round(resumen.porcentaje * 100)}% usado. `}
        {MENSAJES[resumen.estado]}
      </p>

      <h4>Distribución por categoría</h4>
      {resumen.gastado > 0 ? (
        <>
          <div className="pres-apilada" aria-hidden="true">
            {CATEGORIAS.map((c) => (
              <div
                key={c.id}
                style={{ width: `${(porCategoria[c.id] / resumen.gastado) * 100}%`, background: c.color }}
              />
            ))}
          </div>
          <ul className="pres-leyenda">
            {CATEGORIAS.filter((c) => porCategoria[c.id] > 0).map((c) => (
              <li key={c.id}>
                <i style={{ background: c.color }} />
                <span>{c.nombre}</span>
                <b>{m(porCategoria[c.id])}</b>
                <em>{Math.round((porCategoria[c.id] / resumen.gastado) * 100)}%</em>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="pres-vacio">Aún no hay gastos. Genera una estimación o agrega gastos a mano.</p>
      )}
    </section>
  )
}

