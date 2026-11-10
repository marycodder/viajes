import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import TripSummary from '../components/TripSummary';
import WeatherCard from '../components/WeatherCard';
import { NoTrip, ResourceFeedback } from '../components/Feedback';
import { useTrip, useTripResource } from '../context/trip-context';
import { money } from '../services/format';

export default function Dashboard() {
  const { trip } = useTrip();
  const root = trip ? `/trips/${trip.id}` : null;
  const summary = useTripResource(root && `${root}/summary`);
  const activities = useTripResource(root && `${root}/activities`, {
    list: true,
  });
  const destinations = useTripResource(root && `${root}/destinations`);
  const [destinationId, setDestinationId] = useState('');
  const destination =
    destinations.data?.find((item) => item.id === destinationId) ||
    destinations.data?.[0];
  const weather = useTripResource(
    root && destination
      ? `${root}/weather?destinationId=${destination.id}`
      : null,
  );
  if (!trip) return <NoTrip />;
  const upcoming = (activities.data || [])
    .filter(
      (item) =>
        item.status === 'planned' &&
        new Date(`${item.date.slice(0, 10)}T${item.time}`) >= new Date(),
    )
    .slice(0, 3);
  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <p className="section-label">Tu viaje</p>
        <h2>{trip.name}</h2>
        <p className="trip-dates">
          {trip.startDate} — {trip.endDate}
        </p>
        <p>{trip.description}</p>
      </section>
      <ResourceFeedback resource={summary} />
      {summary.data && (
        <>
          <section className="stats-grid">
            <StatCard titulo="Presupuesto" valor={money(summary.data.budget)} />
            <StatCard
              titulo="Gastado realmente"
              valor={money(summary.data.spent)}
            />
            <StatCard
              titulo="Disponible"
              valor={money(summary.data.remaining)}
            />
          </section>
          {summary.data.overBudget && (
            <p className="form-error" role="alert">
              Has superado el presupuesto del viaje.
            </p>
          )}
          <TripSummary
            trip={trip}
            activities={activities.data || []}
            summary={summary.data}
          />
        </>
      )}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="section-label">Planificación</p>
            <h2>Próximas actividades</h2>
          </div>
          <Link to="/itinerario">Ver itinerario</Link>
        </div>
        <ResourceFeedback resource={activities} />
        {!activities.loading && !activities.error && !upcoming.length && (
          <div className="empty-state">
            <h3>No hay próximas actividades</h3>
            <p>Organiza los días y actividades desde el itinerario.</p>
          </div>
        )}
        <div className="activities-list">
          {upcoming.map((activity) => (
            <article className="activity-card" key={activity.id}>
              <div className="activity-info">
                <h3>{activity.name}</h3>
                <p>
                  {activity.date.slice(0, 10)} · {activity.time.slice(0, 5)}
                </p>
                <p className="activity-cost">
                  Estimado: {money(activity.estimatedCost)}
                </p>
              </div>
              <div className="activity-actions">
                <span className="activity-category">{activity.category}</span>
                {activity.favorite && <span title="Actividad favorita">♥</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="dashboard-section weather-section">
        <div className="section-header">
          <div>
            <p className="section-label">Pronóstico</p>
            <h2>Clima del destino</h2>
          </div>
        </div>
        <ResourceFeedback resource={destinations} />
        {destinations.data?.length === 0 && (
          <p className="weather-message">
            Agrega un destino al viaje para consultar su clima.
          </p>
        )}
        {destination && (
          <div className="filter-group">
            <label htmlFor="weather-destination">Destino del pronóstico</label>
            <select
              id="weather-destination"
              value={destination.id}
              onChange={(e) => setDestinationId(e.target.value)}
            >
              {destinations.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <ResourceFeedback resource={weather} />
        {weather.data && !weather.data.available && (
          <p className="weather-message">{weather.data.reason}</p>
        )}
        {weather.data?.available && (
          <>
            <div className="weather-grid">
              {weather.data.daily.map((day) => (
                <WeatherCard
                  key={day.date}
                  dia={{
                    fecha: day.date,
                    codigo: day.weatherCode,
                    maxima: day.maxTemperature ?? '—',
                    minima: day.minTemperature ?? '—',
                    lluvia: day.precipitationProbability ?? '—',
                  }}
                />
              ))}
            </div>
            <p className="weather-attribution">
              Datos meteorológicos de{' '}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo
              </a>
              .
            </p>
          </>
        )}
      </section>
    </main>
  );
}
