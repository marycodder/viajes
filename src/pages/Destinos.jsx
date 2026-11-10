import { useState } from 'react';
import EntityForm from '../components/EntityForm';
import {
  ActionFeedback,
  ReadOnlyNotice,
  ResourceFeedback,
} from '../components/Feedback';
import { useAuth } from '../context/auth-context';
import { useTrip, useTripResource } from '../context/trip-context';
import useAction from '../hooks/useAction';

export default function Destinos() {
  const { user } = useAuth();
  const { trip, owner, mutate } = useTrip();
  const catalog = useTripResource('/destinations', { list: true });
  const linked = useTripResource(
    trip ? `/trips/${trip.id}/destinations` : null,
  );
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const action = useAction();
  const fields = [
    {
      name: 'name',
      label: 'Nombre del destino',
      required: true,
      maxLength: 120,
    },
    { name: 'country', label: 'País', required: true, maxLength: 100 },
    { name: 'region', label: 'Región', maxLength: 100 },
    {
      name: 'latitude',
      label: 'Latitud',
      type: 'number',
      step: 'any',
      min: -90,
      max: 90,
      required: true,
    },
    {
      name: 'longitude',
      label: 'Longitud',
      type: 'number',
      step: 'any',
      min: -180,
      max: 180,
      required: true,
    },
    { name: 'description', label: 'Descripción', type: 'textarea' },
  ];
  const destinations =
    catalog.data?.filter((item) =>
      `${item.name} ${item.region} ${item.country}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) || [];
  return (
    <main className="destinations-page">
      <header className="destinations-header">
        <p className="section-label">Explora y organiza</p>
        <h2>Destinos</h2>
        <p>
          Consulta el catálogo y asocia los lugares que visitarás a tu viaje.
        </p>
      </header>
      {trip && !owner && <ReadOnlyNotice />}
      <EntityForm
        key={editing?.id || 'new'}
        title={editing ? 'Editar destino' : 'Crear destino'}
        fields={fields}
        initial={editing || {}}
        onCancel={editing ? () => setEditing(null) : undefined}
        onSave={async (values) => {
          await mutate(
            editing ? `/destinations/${editing.id}` : '/destinations',
            editing ? 'PATCH' : 'POST',
            values,
          );
          setEditing(null);
        }}
      />
      <div className="destinations-search">
        <label htmlFor="destination-search">Buscar destino</label>
        <input
          id="destination-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre, región o país"
        />
      </div>
      <ActionFeedback action={action} />
      <ResourceFeedback resource={catalog} />
      <ResourceFeedback resource={linked} />
      {!catalog.loading && !catalog.error && !destinations.length && (
        <p className="destinations-empty">
          No hay destinos que coincidan con la búsqueda.
        </p>
      )}
      <section className="destinations-grid">
        {destinations.map((destination) => {
          const isLinked = linked.data?.some(
            (item) => item.id === destination.id,
          );
          return (
            <article className="destination-card" key={destination.id}>
              <div className="destination-card-header">
                <span className="destination-type">{destination.country}</span>
                {isLinked && (
                  <span className="current-destination">En tu viaje</span>
                )}
              </div>
              <h3>{destination.name}</h3>
              <p className="destination-region">{destination.region}</p>
              <p className="destination-description">
                {destination.description}
              </p>
              <div className="activity-buttons">
                {trip && owner && (
                  <button
                    disabled={action.busy || !linked.data}
                    className={isLinked ? 'cancel-button' : 'primary-button'}
                    onClick={() =>
                      action.run(
                        () =>
                          mutate(
                            `/trips/${trip.id}/destinations${isLinked ? `/${destination.id}` : ''}`,
                            isLinked ? 'DELETE' : 'POST',
                            isLinked
                              ? undefined
                              : { destinationId: destination.id },
                          ),
                        isLinked
                          ? 'Destino retirado del viaje.'
                          : 'Destino agregado al viaje.',
                      )
                    }
                  >
                    {isLinked ? 'Quitar del viaje' : 'Agregar al viaje'}
                  </button>
                )}
                {destination.createdBy === user.id && (
                  <>
                    <button
                      className="edit-button"
                      onClick={() => setEditing(destination)}
                    >
                      Editar destino
                    </button>
                    <button
                      className="delete-button"
                      disabled={action.busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar ${destination.name} del catálogo?`,
                          )
                        )
                          action.run(
                            () =>
                              mutate(
                                `/destinations/${destination.id}`,
                                'DELETE',
                              ),
                            'Destino eliminado.',
                          );
                      }}
                    >
                      Eliminar destino
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
