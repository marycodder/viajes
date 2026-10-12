import './Presupuesto.css'
import GastosLista from './GastosLista'
import ResumenPresupuesto from './ResumenPresupuesto'
import Simulador from './Simulador'
import { MONEDAS, calcularResumen, convertir, generarSimulacion } from './presupuestoUtils'
import { usePresupuesto } from './usePresupuesto'
import { useTasasCambio } from './useTasasCambio'

/**
 * Módulo de presupuesto del viaje.
 * Props opcionales:
 *  - destino: { pais: 'Chile', moneda: 'CLP' }
 *  - dias: nº de días del itinerario (si se pasa, manda sobre el valor guardado)
 */
export default function Presupuesto({ destino, dias: diasProp }) {
  const [estado, dispatch] = usePresupuesto({
    moneda: MONEDAS.includes(destino?.moneda) ? destino.moneda : 'USD',
  })
  const { tasas, fuente, fecha, cargando } = useTasasCambio()

  const dias = diasProp ?? estado.dias
  const { moneda } = estado

  const resumen = calcularResumen({
    items: estado.items,
    presupuestoTotal: estado.presupuestoTotal,
    dias,
    viajeros: estado.viajeros,
  })

  const cambiar = (campo, valor) => dispatch({ type: 'CAMPO', campo, valor })

  const generar = () =>
    dispatch({
      type: 'APLICAR_SIMULACION',
      items: generarSimulacion(
        { ...estado.parametros, dias, viajeros: estado.viajeros },
        moneda,
        tasas,
      ),
    })

  const cambiarMoneda = (nueva) =>
    dispatch({
      type: 'CAMBIAR_MONEDA',
      moneda: nueva,
      factor: convertir(1, moneda, nueva, tasas),
    })

  return (
    <main className="presupuesto">
      <header className="pres-header">
        <p className="pres-label">Planificación</p>
        <h2>Presupuesto del viaje{destino?.pais ? ` · ${destino.pais}` : ''}</h2>
        <p className="pres-tasas">
          Tasas de cambio:{' '}
          {cargando
            ? 'actualizando…'
            : fuente === 'respaldo'
              ? 'aproximadas (sin conexión a la API)'
              : `API${fecha ? ` · ${fecha.slice(0, 16)}` : ''}`}
        </p>
      </header>

      <section className="pres-card" aria-labelledby="pres-datos">
        <h3 id="pres-datos">Datos del viaje</h3>

        <div className="pres-grid">
          <label className="pres-field">
            <span>Moneda</span>
            <select value={moneda} onChange={(e) => cambiarMoneda(e.target.value)}>
              {MONEDAS.map((mo) => (
                <option key={mo}>{mo}</option>
              ))}
            </select>
          </label>

          <label className="pres-field">
            <span>Presupuesto total ({moneda})</span>
            <input
              type="number"
              min="0"
              value={estado.presupuestoTotal || ''}
              onChange={(e) => cambiar('presupuestoTotal', Math.max(0, Number(e.target.value) || 0))}
            />
          </label>

          <label className="pres-field">
            <span>Viajeros</span>
            <input
              type="number"
              min="1"
              max="20"
              value={estado.viajeros}
              onChange={(e) => cambiar('viajeros', Math.max(1, Number(e.target.value) || 1))}
            />
          </label>

          <label className="pres-field">
            <span>Días</span>
            <input
              type="number"
              min="1"
              max="90"
              value={dias}
              disabled={diasProp != null}
              onChange={(e) => cambiar('dias', Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
        </div>

        {MONEDAS.includes(destino?.moneda) && destino.moneda !== moneda && (
          <button type="button" className="pres-link" onClick={() => cambiarMoneda(destino.moneda)}>
            Usar la moneda del destino ({destino.moneda})
          </button>
        )}
      </section>

      <Simulador
        parametros={estado.parametros}
        onParametro={(campo, valor) => dispatch({ type: 'PARAMETRO', campo, valor })}
        onGenerar={generar}
      />

      <ResumenPresupuesto resumen={resumen} items={estado.items} moneda={moneda} />

      <GastosLista
        items={estado.items}
        moneda={moneda}
        dias={dias}
        onAgregar={(item) => dispatch({ type: 'AGREGAR', item })}
        onEliminar={(id) => dispatch({ type: 'ELIMINAR', id })}
        onEditar={(id, monto) => dispatch({ type: 'EDITAR_MONTO', id, monto })}
      />
    </main>
  )
}

