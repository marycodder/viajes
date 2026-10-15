import { useEffect } from 'react';

import './Presupuesto.css';

import GastosLista from './GastosLista';
import ResumenPresupuesto from './ResumenPresupuesto';
import Simulador from './Simulador';

import {
  MONEDAS,
  calcularResumen,
  convertir,
  generarSimulacion,
} from './presupuestoUtils';

import { usePresupuesto } from './usePresupuesto';
import { useTasasCambio } from './useTasasCambio';

export default function Presupuesto({
  destino,
  dias: diasProp,
  actividades = [],
  presupuestoInicial = 0,
  onGastosAdicionalesChange,
}) {
  const [estado, dispatch] = usePresupuesto({
    moneda: MONEDAS.includes(destino?.moneda)
      ? destino.moneda
      : 'CLP',

    presupuestoTotal: presupuestoInicial,
  });

  const { tasas, fuente, fecha, cargando } =
    useTasasCambio();

  const dias = diasProp ?? estado.dias;
  const { moneda } = estado;

  /*
   * Evita duplicar actividades que hayan podido quedar
   * guardadas anteriormente en LocalStorage.
   */
  const gastosPropios = estado.items.filter(
    (item) => item.origen !== 'actividad'
  );

  /*
   * Actividades provenientes del itinerario.
   * Se convierten desde CLP a la moneda seleccionada.
   */
  const gastosActividades = actividades.map(
    (actividad) => ({
      id: `actividad-${actividad.id}`,
      categoria: 'actividades',
      concepto: actividad.nombre,

      monto: convertir(
        Number(actividad.costo) || 0,
        'CLP',
        moneda,
        tasas
      ),

      dia: null,
      origen: 'actividad',
    })
  );

  /*
   * Para los cálculos usamos:
   * actividades + gastos propios del presupuesto.
   */
  const itemsTotales = [
    ...gastosActividades,
    ...gastosPropios,
  ];

  const resumen = calcularResumen({
    items: itemsTotales,
    presupuestoTotal: estado.presupuestoTotal,
    dias,
    viajeros: estado.viajeros,
  });

  /*
   * Convertimos solamente los gastos adicionales a CLP
   * para enviarlos al Dashboard.
   *
   * Las actividades NO se incluyen aquí porque
   * Dashboard ya recibe las actividades directamente.
   */
  const gastosAdicionalesClp = Math.round(
    gastosPropios.reduce(
      (total, item) =>
        total +
        convertir(
          Number(item.monto) || 0,
          moneda,
          'CLP',
          tasas
        ),
      0
    )
  );

  useEffect(() => {
    if (onGastosAdicionalesChange) {
      onGastosAdicionalesChange(
        gastosAdicionalesClp
      );
    }
  }, [
    gastosAdicionalesClp,
    onGastosAdicionalesChange,
  ]);

  const cambiar = (campo, valor) =>
    dispatch({
      type: 'CAMPO',
      campo,
      valor,
    });

  const generar = () =>
    dispatch({
      type: 'APLICAR_SIMULACION',

      items: generarSimulacion(
        {
          ...estado.parametros,
          dias,
          viajeros: estado.viajeros,
        },
        moneda,
        tasas
      ),
    });

  const cambiarMoneda = (nueva) =>
    dispatch({
      type: 'CAMBIAR_MONEDA',
      moneda: nueva,
      factor: convertir(
        1,
        moneda,
        nueva,
        tasas
      ),
    });

  const formatoClp = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);

  return (
    <main className="presupuesto">
      <header className="pres-header">
        <p className="pres-label">
          Planificación
        </p>

        <h2>
          Presupuesto del viaje
          {destino?.pais
            ? ` · ${destino.pais}`
            : ''}
        </h2>

        <p className="pres-tasas">
          Tasas de cambio:{' '}

          {cargando
            ? 'actualizando…'
            : fuente === 'respaldo'
              ? 'aproximadas (sin conexión a la API)'
              : `API${
                  fecha
                    ? ` · ${fecha.slice(0, 16)}`
                    : ''
                }`}
        </p>
      </header>

      <section
        className="pres-card"
        aria-labelledby="pres-datos"
      >
        <h3 id="pres-datos">
          Datos del viaje
        </h3>

        <div className="pres-grid">
          <label className="pres-field">
            <span>Moneda</span>

            <select
              value={moneda}
              onChange={(e) =>
                cambiarMoneda(e.target.value)
              }
            >
              {MONEDAS.map((mo) => (
                <option key={mo}>
                  {mo}
                </option>
              ))}
            </select>
          </label>

          <label className="pres-field">
            <span>
              Presupuesto total ({moneda})
            </span>

            <input
              type="number"
              min="0"
              value={
                estado.presupuestoTotal || ''
              }
              onChange={(e) =>
                cambiar(
                  'presupuestoTotal',
                  Math.max(
                    0,
                    Number(e.target.value) || 0
                  )
                )
              }
            />
          </label>

          <label className="pres-field">
            <span>Viajeros</span>

            <input
              type="number"
              min="1"
              max="20"
              value={estado.viajeros}
              onChange={(e) =>
                cambiar(
                  'viajeros',
                  Math.max(
                    1,
                    Number(e.target.value) || 1
                  )
                )
              }
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
              onChange={(e) =>
                cambiar(
                  'dias',
                  Math.max(
                    1,
                    Number(e.target.value) || 1
                  )
                )
              }
            />
          </label>
        </div>

        {MONEDAS.includes(destino?.moneda) &&
          destino.moneda !== moneda && (
            <button
              type="button"
              className="pres-link"
              onClick={() =>
                cambiarMoneda(
                  destino.moneda
                )
              }
            >
              Usar la moneda del destino (
              {destino.moneda})
            </button>
          )}
      </section>

      <Simulador
        parametros={estado.parametros}
        onParametro={(campo, valor) =>
          dispatch({
            type: 'PARAMETRO',
            campo,
            valor,
          })
        }
        onGenerar={generar}
      />

      <ResumenPresupuesto
        resumen={resumen}
        items={itemsTotales}
        moneda={moneda}
      />

      <section className="pres-card">
        <h3>
          Actividades del itinerario
        </h3>

        {actividades.length === 0 ? (
          <p className="pres-vacio">
            No hay actividades registradas.
          </p>
        ) : (
          <div className="pres-itinerary-list">
            {actividades.map(
              (actividad) => (
                <div
                  className="pres-itinerary-item"
                  key={actividad.id}
                >
                  <div>
                    <strong>
                      {actividad.nombre}
                    </strong>

                    <p>
                      {actividad.fecha} ·{' '}
                      {actividad.categoria}
                    </p>
                  </div>

                  <strong>
                    {formatoClp(
                      actividad.costo
                    )}
                  </strong>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <GastosLista
        items={gastosPropios}
        moneda={moneda}
        dias={dias}
        onAgregar={(item) =>
          dispatch({
            type: 'AGREGAR',
            item,
          })
        }
        onEliminar={(id) =>
          dispatch({
            type: 'ELIMINAR',
            id,
          })
        }
        onEditar={(id, monto) =>
          dispatch({
            type: 'EDITAR_MONTO',
            id,
            monto,
          })
        }
      />
    </main>
  );
}