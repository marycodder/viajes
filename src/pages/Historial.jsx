import { useEffect } from 'react';
import { NoTrip, ResourceFeedback } from '../components/Feedback';
import { useTrip, useTripResource } from '../context/trip-context';

const resources = {
  trip: 'Viaje',
  traveler: 'Viajero',
  destination: 'Destino',
  itinerary: 'Día del itinerario',
  activity: 'Actividad',
  favorite: 'Favorito',
  expense: 'Gasto',
  reservation: 'Reserva',
};
const actions = {
  created: 'creado',
  updated: 'actualizado',
  deleted: 'eliminado',
  added: 'agregado',
  removed: 'retirado',
  linked: 'asociado',
  unlinked: 'desasociado',
  seeded: 'de demostración creado',
};
function describe(action) {
  const [resource, verb] = action.split('.');
  return resources[resource] && actions[verb]
    ? `${resources[resource]} ${actions[verb]}`
    : 'Cambio en el viaje';
}
export default function Historial() {
  const { trip } = useTrip();
  const events = useTripResource(trip ? `/trips/${trip.id}/events` : null, {
    list: true,
  });
  const travelers = useTripResource(
    trip ? `/trips/${trip.id}/travelers` : null,
  );
  const reload = events.reload;
  useEffect(() => {
    const timer = setInterval(reload, 10000);
    return () => clearInterval(timer);
  }, [reload]);
  if (!trip) return <NoTrip />;
  return (
    <main className="itinerary-page">
      <header className="itinerary-header">
        <p className="section-label">Seguimiento de la planificación</p>
        <h2>Historial del viaje</h2>
        <p>Los cambios pueden tardar unos segundos en aparecer.</p>
      </header>
      <button
        className="clear-filters-button"
        disabled={events.loading}
        onClick={events.reload}
      >
        Actualizar historial
      </button>
      <ResourceFeedback resource={events} />
      <ResourceFeedback resource={travelers} />
      {events.data?.length === 0 && (
        <p className="empty-state">
          Todavía no aparecen cambios en el historial.
        </p>
      )}
      <ol className="history-list">
        {events.data?.map((event) => (
          <li className="activity-card" key={event.eventId}>
            <div>
              <h3>{describe(event.action)}</h3>
              <p>
                {travelers.data?.find((item) => item.id === event.actorId)
                  ?.name || 'Usuario del viaje'}
              </p>
            </div>
            <time dateTime={event.occurredAt}>
              {new Date(event.occurredAt).toLocaleString('es-CL')}
            </time>
          </li>
        ))}
      </ol>
    </main>
  );
}
