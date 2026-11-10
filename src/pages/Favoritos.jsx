import ActivityCard from '../components/ActivityCard';
import { NoTrip, ResourceFeedback } from '../components/Feedback';
import { useTrip, useTripResource } from '../context/trip-context';

export default function Favoritos() {
  const { trip, mutate } = useTrip();
  const root = trip ? `/trips/${trip.id}` : null;
  const favorites = useTripResource(root && `${root}/favorites`, {
    list: true,
  });
  if (!trip) return <NoTrip />;
  return (
    <main className="favorites-page">
      <header className="favorites-header">
        <p className="section-label">Tus lugares preferidos</p>
        <h2>Favoritos</h2>
        <p>Actividades guardadas personalmente para {trip.name}.</p>
      </header>
      <ResourceFeedback resource={favorites} />
      {favorites.data?.length === 0 && (
        <div className="favorites-empty">
          <span className="favorites-empty-icon">♡</span>
          <h3>Todavía no tienes favoritos</h3>
          <p>Marca una actividad con el corazón desde el itinerario.</p>
        </div>
      )}
      <section className="favorites-list">
        {favorites.data?.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onFavorite={(item) =>
              mutate(`${root}/activities/${item.id}/favorite`, 'DELETE')
            }
          />
        ))}
      </section>
    </main>
  );
}
