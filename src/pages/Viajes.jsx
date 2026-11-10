import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntityForm from '../components/EntityForm';
import {
  ActionFeedback,
  ReadOnlyNotice,
  ResourceFeedback,
} from '../components/Feedback';
import { useAuth } from '../context/auth-context';
import { useTrip, useTripResource } from '../context/trip-context';
import useAction from '../hooks/useAction';
import { money } from '../services/format';

export default function Viajes() {
  const { user } = useAuth();
  const { trip, trips, owner, mutate, selectTrip } = useTrip();
  const [editing, setEditing] = useState(null);
  const travelers = useTripResource(
    trip ? `/trips/${trip.id}/travelers` : null,
  );
  const action = useAction();
  const navigate = useNavigate();
  const fields = [
    { name: 'name', label: 'Nombre del viaje', required: true },
    {
      name: 'startDate',
      label: 'Fecha de inicio',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      label: 'Fecha de término',
      type: 'date',
      required: true,
    },
    {
      name: 'budget',
      label: 'Presupuesto (CLP)',
      type: 'number',
      min: 0,
      max: 1000000000000,
      defaultValue: 0,
      required: true,
    },
    { name: 'description', label: 'Descripción', type: 'textarea' },
  ];
  return (
    <main className="itinerary-page">
      <header className="itinerary-header">
        <p className="section-label">Tu planificación</p>
        <h2>Mis viajes</h2>
        <p>Crea viajes, administra sus fechas y organiza a sus viajeros.</p>
      </header>
      <EntityForm
        key={editing?.id || 'new'}
        title={editing ? 'Editar viaje' : 'Crear viaje'}
        fields={fields}
        initial={editing || {}}
        onCancel={editing ? () => setEditing(null) : undefined}
        onSave={async (values) => {
          if (values.endDate < values.startDate)
            throw new Error(
              'La fecha de término debe ser igual o posterior al inicio.',
            );
          const result = await mutate(
            editing ? `/trips/${editing.id}` : '/trips',
            editing ? 'PATCH' : 'POST',
            values,
          );
          selectTrip(result.id);
          setEditing(null);
        }}
      />
      <ActionFeedback action={action} />
      <ResourceFeedback resource={trips} />
      {trips.data?.length === 0 && (
        <p className="empty-state">
          Todavía no tienes viajes. Crea el primero con el formulario.
        </p>
      )}
      <section className="destinations-grid" aria-label="Mis viajes">
        {trips.data?.map((item) => (
          <article className="destination-card" key={item.id}>
            <h3>{item.name}</h3>
            <p>
              {item.startDate} — {item.endDate}
            </p>
            <p>{item.description}</p>
            <p>Presupuesto: {money(item.budget)}</p>
            <div className="activity-buttons">
              <button
                className="primary-button"
                onClick={() => {
                  selectTrip(item.id);
                  navigate('/');
                }}
              >
                Abrir viaje
              </button>
              {item.ownerId === user.id && (
                <>
                  <button
                    className="edit-button"
                    onClick={() => setEditing(item)}
                  >
                    Editar viaje
                  </button>
                  <button
                    className="delete-button"
                    disabled={action.busy}
                    onClick={() => {
                      if (
                        window.confirm(`¿Eliminar "${item.name}" y sus datos?`)
                      )
                        action.run(
                          () => mutate(`/trips/${item.id}`, 'DELETE'),
                          'Viaje eliminado.',
                        );
                    }}
                  >
                    Eliminar viaje
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>
      {trip && (
        <section className="dashboard-section">
          <h2>Viajeros de {trip.name}</h2>
          {!owner && <ReadOnlyNotice />}
          {owner && (
            <EntityForm
              key={trip.id}
              title="Agregar viajero"
              fields={[
                {
                  name: 'email',
                  label: 'Correo del viajero registrado',
                  type: 'email',
                  required: true,
                  maxLength: 254,
                },
              ]}
              onSave={(values) =>
                mutate(`/trips/${trip.id}/travelers`, 'POST', values)
              }
            />
          )}
          <ResourceFeedback resource={travelers} />
          <div className="activities-list">
            {travelers.data?.map((person) => (
              <article className="activity-card" key={person.id}>
                <div>
                  <h3>{person.name}</h3>
                  <p>
                    {person.email} ·{' '}
                    {person.role === 'owner' ? 'Propietario' : 'Viajero'}
                  </p>
                </div>
                {owner && person.role !== 'owner' && (
                  <button
                    className="delete-button"
                    disabled={action.busy}
                    onClick={() => {
                      if (window.confirm(`¿Quitar a ${person.name} del viaje?`))
                        action.run(
                          () =>
                            mutate(
                              `/trips/${trip.id}/travelers/${person.id}`,
                              'DELETE',
                            ),
                          'Viajero retirado.',
                        );
                    }}
                  >
                    Quitar viajero
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
