import { useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityCard from '../components/ActivityCard';
import ActivityForm from '../components/ActivityForm';
import EntityForm from '../components/EntityForm';
import {
  ActionFeedback,
  NoTrip,
  ReadOnlyNotice,
  ResourceFeedback,
} from '../components/Feedback';
import { useTrip, useTripResource } from '../context/trip-context';
import useAction from '../hooks/useAction';
import { categories } from '../services/format';

export default function Itinerario() {
  const { trip, owner, mutate } = useTrip();
  const root = trip ? `/trips/${trip.id}` : null;
  const days = useTripResource(root && `${root}/days`, { list: true });
  const activities = useTripResource(root && `${root}/activities`, {
    list: true,
  });
  const destinations = useTripResource(root && `${root}/destinations`);
  const [editingDay, setEditingDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const action = useAction();
  if (!trip) return <NoTrip />;
  const dayFields = [
    {
      name: 'destinationId',
      label: 'Destino del día',
      required: true,
      options: [
        { value: '', label: 'Selecciona un destino' },
        ...(destinations.data || []).map((item) => ({
          value: item.id,
          label: item.name,
        })),
      ],
    },
    {
      name: 'date',
      label: 'Fecha del día',
      type: 'date',
      required: true,
      min: trip.startDate,
      max: trip.endDate,
    },
    { name: 'title', label: 'Título del día' },
  ];
  const filtered = (activities.data || []).filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (!category || item.category === category) &&
      (!onlyFavorites || item.favorite),
  );
  return (
    <main className="itinerary-page">
      <header className="itinerary-header">
        <p className="section-label">Tu planificación</p>
        <h2>Itinerario</h2>
        <p>
          {trip.name} · {trip.startDate} — {trip.endDate}
        </p>
      </header>
      {!owner && <ReadOnlyNotice />}
      <ResourceFeedback resource={destinations} />
      <ResourceFeedback resource={days} />
      <ResourceFeedback resource={activities} />
      <ActionFeedback action={action} />
      {owner && destinations.data?.length === 0 && (
        <p className="info-message">
          Primero agrega un lugar desde <Link to="/destinos">Destinos</Link>{' '}
          para organizar los días del viaje.
        </p>
      )}
      {owner && Boolean(destinations.data?.length) && (
        <EntityForm
          key={editingDay?.id || 'new-day'}
          title={editingDay ? 'Editar día' : 'Agregar día'}
          fields={dayFields}
          initial={editingDay || {}}
          onCancel={editingDay ? () => setEditingDay(null) : undefined}
          onSave={async (values) => {
            if (values.date < trip.startDate || values.date > trip.endDate)
              throw new Error(
                'La fecha debe estar dentro del período del viaje.',
              );
            await mutate(
              editingDay ? `${root}/days/${editingDay.id}` : `${root}/days`,
              editingDay ? 'PATCH' : 'POST',
              values,
            );
            setEditingDay(null);
          }}
        />
      )}
      {owner && Boolean(days.data?.length) && (
        <ActivityForm
          key={editingActivity?.id || 'new-activity'}
          days={days.data}
          activity={editingActivity}
          onCancel={
            editingActivity ? () => setEditingActivity(null) : undefined
          }
          onSave={async (values) => {
            await mutate(
              editingActivity
                ? `${root}/activities/${editingActivity.id}`
                : `${root}/activities`,
              editingActivity ? 'PATCH' : 'POST',
              values,
            );
            setEditingActivity(null);
          }}
        />
      )}
      <section className="itinerary-filters">
        <div className="filters-header">
          <h2>Filtrar actividades</h2>
          <button
            className="clear-filters-button"
            onClick={() => {
              setSearch('');
              setCategory('');
              setOnlyFavorites(false);
            }}
          >
            Limpiar filtros
          </button>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="activity-search">Buscar actividad</label>
            <input
              id="activity-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="activity-category">Categoría</label>
            <select
              id="activity-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <label className="favorite-filter">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
            />
            Solo favoritas
          </label>
        </div>
      </section>
      <p className="itinerary-results">
        {filtered.length} actividades encontradas
      </p>
      {!days.loading && !days.error && !days.data?.length && (
        <p className="itinerary-empty">Todavía no hay días en el itinerario.</p>
      )}
      {days.data?.map((day) => (
        <section
          className="itinerary-day"
          key={day.id}
          aria-label={`Día ${day.date}`}
        >
          <div className="itinerary-date">
            <div>
              <h3>
                {day.date}
                {day.title ? ` · ${day.title}` : ''}
              </h3>
              <p>
                {
                  destinations.data?.find(
                    (item) => item.id === day.destinationId,
                  )?.name
                }
              </p>
            </div>
            {owner && (
              <div className="activity-buttons">
                <button
                  className="edit-button"
                  onClick={() => setEditingDay(day)}
                >
                  Editar día
                </button>
                <button
                  className="delete-button"
                  disabled={action.busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Eliminar el día ${day.date}? Debe estar vacío.`,
                      )
                    )
                      action.run(
                        () => mutate(`${root}/days/${day.id}`, 'DELETE'),
                        'Día eliminado.',
                      );
                  }}
                >
                  Eliminar día
                </button>
              </div>
            )}
          </div>
          <div className="activities-list">
            {filtered
              .filter((item) => item.dayId === day.id)
              .map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  owner={owner}
                  onEdit={setEditingActivity}
                  onDelete={(id) =>
                    mutate(`${root}/activities/${id}`, 'DELETE')
                  }
                  onFavorite={(item) =>
                    mutate(
                      `${root}/activities/${item.id}/favorite`,
                      item.favorite ? 'DELETE' : 'PUT',
                    )
                  }
                />
              ))}
          </div>
          {!filtered.some((item) => item.dayId === day.id) && (
            <p className="empty-state">
              Sin actividades para este día con los filtros actuales.
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
