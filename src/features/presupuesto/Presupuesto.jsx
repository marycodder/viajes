import GastosLista from './GastosLista'
import Simulador from './Simulador'
import { MONEDAS, calcularResumen, convertir, formatearMonto, generarSimulacion } from './presupuestoUtils'
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
  const m = (n) => formatearMonto(n, moneda)

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
    <div>
      <h1>Presupuesto del viaje{destino?.pais ? ` · ${destino.pais}` : ''}</h1>

      <p>
        Tasas de cambio:{' '}
        {cargando
          ? 'actualizando…'
          : fuente === 'respaldo'
            ? 'aproximadas (sin conexión a la API)'
            : `API${fecha ? ` · ${fecha.slice(0, 16)}` : ''}`}
      </p>

      <section>
        <h2>Datos del viaje</h2>

        <label>
          Moneda{' '}
          <select value={moneda} onChange={(e) => cambiarMoneda(e.target.value)}>
            {MONEDAS.map((mo) => (
              <option key={mo}>{mo}</option>
            ))}
          </select>
        </label>

        <label>
          Presupuesto total ({moneda}){' '}
          <input
            type="number"
            min="0"
            value={estado.presupuestoTotal || ''}
            onChange={(e) => cambiar('presupuestoTotal', Math.max(0, Number(e.target.value) || 0))}
          />
        </label>

        <label>
          Viajeros{' '}
          <input
            type="number"
            min="1"
            max="20"
            value={estado.viajeros}
            onChange={(e) => cambiar('viajeros', Math.max(1, Number(e.target.value) || 1))}
          />
        </label>

        <label>
          Días{' '}
          <input
            type="number"
            min="1"
            max="90"
            value={dias}
            disabled={diasProp != null}
            onChange={(e) => cambiar('dias', Math.max(1, Number(e.target.value) || 1))}
          />
        </label>

        {MONEDAS.includes(destino?.moneda) && destino.moneda !== moneda && (
          <button type="button" onClick={() => cambiarMoneda(destino.moneda)}>
            Usar la moneda del destino ({destino.moneda})
          </button>
        )}
      </section>

      <Simulador
        parametros={estado.parametros}
        onParametro={(campo, valor) => dispatch({ type: 'PARAMETRO', campo, valor })}
        onGenerar={generar}
      />

      <section>
        <h2>Resumen</h2>
        <ul>
          <li>Presupuesto: {m(resumen.meta)}</li>
          <li>Gastado: {m(resumen.gastado)}</li>
          <li>Restante: {m(resumen.restante)}</li>
          <li>Por persona: {m(resumen.porPersona)}</li>
          <li>Por día: {m(resumen.porDia)}</li>
        </ul>
      </section>

      <GastosLista
        items={estado.items}
        moneda={moneda}
        dias={dias}
        onAgregar={(item) => dispatch({ type: 'AGREGAR', item })}
        onEliminar={(id) => dispatch({ type: 'ELIMINAR', id })}
        onEditar={(id, monto) => dispatch({ type: 'EDITAR_MONTO', id, monto })}
      />
    </div>
  )
}

