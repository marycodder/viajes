import { actividades } from '../data/actividades';
import ActivityCard from '../components/ActivityCard';

function Itinerario() {
  const actividadesPorFecha = actividades.reduce((grupos, actividad) => {
    const fecha = actividad.fecha;

    if (!grupos[fecha]) {
      grupos[fecha] = [];
    }

    grupos[fecha].push(actividad);

    return grupos;
  }, {});

  return (
    <main className="itinerary-page">
      <section className="itinerary-header">
        <p className="section-label">Tu planificación</p>
        <h2>Itinerario</h2>
        <p>
          Revisa todas las actividades organizadas para tu viaje.
        </p>
      </section>

      <section className="itinerary-content">
        {Object.entries(actividadesPorFecha).map(
          ([fecha, actividadesDelDia]) => (
            <div className="itinerary-day" key={fecha}>
              <div className="itinerary-date">
                <h3>{fecha}</h3>
                <span>
                  {actividadesDelDia.length}{' '}
                  {actividadesDelDia.length === 1
                    ? 'actividad'
                    : 'actividades'}
                </span>
              </div>

              <div className="activities-list">
                {actividadesDelDia.map((actividad) => (
                  <ActivityCard
                    key={actividad.id}
                    actividad={actividad}
                  />
                ))}
              </div>
            </div>
          )
        )}
      </section>
    </main>
  );
}

export default Itinerario;