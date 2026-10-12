import { DISTANCIAS, ESTILOS, NIVELES_COSTO } from './presupuestoUtils'

export default function Simulador({ parametros, onParametro, onGenerar }) {
  const campo = (etiqueta, opciones, key) => (
    <label>
      {etiqueta}{' '}
      <select value={parametros[key]} onChange={(e) => onParametro(key, e.target.value)}>
        {Object.entries(opciones).map(([id, o]) => (
          <option key={id} value={id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <section>
      <h2>Presupuesto simulado</h2>
      <p>Estimación referencial según tu estilo de viaje. Después puedes ajustar cada línea.</p>

      {campo('Estilo de viaje', ESTILOS, 'estilo')}
      {campo('Costo del destino', NIVELES_COSTO, 'nivelCosto')}
      {campo('Distancia del viaje', DISTANCIAS, 'distancia')}

      <button type="button" onClick={onGenerar}>
        Generar estimación
      </button>
    </section>
  )
}

