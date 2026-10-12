import StatCard from '../components/StatCard';
import { viajes } from '../data/viajes';

function Dashboard({ actividades }) {
  const viaje = viajes[0];

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);

  const totalGastado = actividades.reduce(
    (total, actividad) => total + actividad.costo,
    0
  );

  const presupuestoDisponible =
    viaje.presupuesto - totalGastado;

  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);

    return fechaA - fechaB;
  });

  const proximasActividades = actividadesOrdenadas.slice(0, 3);

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <div>
          <p className="section-label">Próximo viaje</p>

          <h2>{viaje.destino}</h2>

          <p className="trip-dates">
            {viaje.fechaInicio} - {viaje.fechaFin}
          </p>
        </div>

        <div className="trip-summary">
          <span>
            {actividades.length}{' '}
            {actividades.length === 1
              ? 'actividad'
              : 'actividades'}
          </span>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          titulo="Presupuesto"
          valor={formatoMoneda(viaje.presupuesto)}
        />

        <StatCard
          titulo="Gastado"
          valor={formatoMoneda(totalGastado)}
        />

        <StatCard
          titulo="Disponible"
          valor={formatoMoneda(presupuestoDisponible)}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="section-label">Planificación</p>

            <h2>Próximas actividades</h2>
          </div>

          <span className="activities-count">
            {actividades.length}{' '}
            {actividades.length === 1
              ? 'actividad'
              : 'actividades'}
          </span>
        </div>

        {proximasActividades.length === 0 ? (
          <div className="empty-state">
            <h3>No hay actividades planificadas</h3>

            <p>
              Agrega actividades desde el itinerario para comenzar
              a organizar tu viaje.
            </p>
          </div>
        ) : (
          <div className="activities-list">
            {proximasActividades.map((actividad) => (
              <article
                className="activity-card"
                key={actividad.id}
              >
                <div className="activity-info">
                  <h3>{actividad.nombre}</h3>

                  <p>
                    {actividad.fecha} · {actividad.hora}
                  </p>

                  <p className="activity-cost">
                    {actividad.costo === 0
                      ? 'Gratis'
                      : formatoMoneda(actividad.costo)}
                  </p>
                </div>

                <div className="activity-actions">
                  <span className="activity-category">
                    {actividad.categoria}
                  </span>

                  {actividad.favorito && (
                    <span
                      className="dashboard-favorite"
                      title="Actividad favorita"
                    >
                      ♥
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;