import { DISTANCIAS, ESTILOS, NIVELES_COSTO } from './presupuestoUtils'

export default function Simulador({ parametros, onParametro, onGenerar }) {
  const campo = (etiqueta, opciones, key) => (
    <label className="pres-field">
      <span>{etiqueta}</span>
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
    <section className="pres-card" aria-labelledby="pres-sim">
      <h3 id="pres-sim">Presupuesto simulado</h3>
      <p className="pres-nota">
        Estimación referencial según tu estilo de viaje. Después puedes ajustar cada línea.
      </p>

      <div className="pres-grid">
        {campo('Estilo de viaje', ESTILOS, 'estilo')}
        {campo('Costo del destino', NIVELES_COSTO, 'nivelCosto')}
        {campo('Distancia del viaje', DISTANCIAS, 'distancia')}
      </div>

      <button type="button" className="pres-btn" onClick={onGenerar}>
        Generar estimación
      </button>
    </section>
  )
}
