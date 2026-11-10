import { useState } from 'react';
import EntityForm from '../components/EntityForm';
import {
  ActionFeedback,
  NoTrip,
  ReadOnlyNotice,
  ResourceFeedback,
} from '../components/Feedback';
import { useTrip, useTripResource } from '../context/trip-context';
import useAction from '../hooks/useAction';
import {
  money,
  options,
  reservationStatus,
  reservationTypes,
} from '../services/format';

export default function Reservas() {
  const { trip, owner, mutate } = useTrip();
  const root = trip ? `/trips/${trip.id}` : null;
  const reservations = useTripResource(root && `${root}/reservations`, {
    list: true,
  });
  const activities = useTripResource(root && `${root}/activities`, {
    list: true,
  });
  const [editing, setEditing] = useState(null);
  const action = useAction();
  if (!trip) return <NoTrip />;
  const fields = [
    {
      name: 'type',
      label: 'Tipo de reserva',
      required: true,
      options: options(reservationTypes),
      defaultValue: 'accommodation',
    },
    { name: 'provider', label: 'Proveedor', required: true },
    { name: 'reference', label: 'Referencia de reserva', maxLength: 100 },
    {
      name: 'startDate',
      label: 'Inicio de la reserva',
      type: 'date',
      min: trip.startDate,
      max: trip.endDate,
      required: true,
      defaultValue: trip.startDate,
    },
    {
      name: 'endDate',
      label: 'Término de la reserva',
      type: 'date',
      min: trip.startDate,
      max: trip.endDate,
      required: true,
      defaultValue: trip.endDate,
    },
    {
      name: 'estimatedCost',
      label: 'Costo estimado (CLP)',
      type: 'number',
      min: 0,
      max: 1000000000000,
      required: true,
      defaultValue: 0,
    },
    {
      name: 'status',
      label: 'Estado de la reserva',
      required: true,
      options: options(reservationStatus),
      defaultValue: 'pending',
    },
    {
      name: 'activityId',
      label: 'Actividad relacionada',
      nullable: true,
      options: [
        { value: '', label: 'Sin actividad relacionada' },
        ...(activities.data || []).map((item) => ({
          value: item.id,
          label: item.name,
        })),
      ],
    },
  ];
  return (
    <main className="itinerary-page">
      <header className="itinerary-header">
        <p className="section-label">Organización del viaje</p>
        <h2>Reservas</h2>
        <p>
          Registra y sigue tus reservas de alojamiento, transporte y
          actividades. Las reservas son simuladas.
        </p>
      </header>
      {!owner && <ReadOnlyNotice />}
      <ResourceFeedback resource={activities} />
      {owner && activities.data && (
        <EntityForm
          key={editing?.id || 'new'}
          title={editing ? 'Editar reserva' : 'Crear reserva'}
          fields={fields}
          initial={editing || {}}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSave={async (values) => {
            if (values.endDate < values.startDate)
              throw new Error(
                'El término de la reserva debe ser igual o posterior al inicio.',
              );
            await mutate(
              editing
                ? `${root}/reservations/${editing.id}`
                : `${root}/reservations`,
              editing ? 'PATCH' : 'POST',
              values,
            );
            setEditing(null);
          }}
        />
      )}
      <ResourceFeedback resource={reservations} />
      <ActionFeedback action={action} />
      {reservations.data?.length === 0 && (
        <p className="empty-state">Todavía no hay reservas registradas.</p>
      )}
      <section className="activities-list">
        {reservations.data?.map((item) => (
          <article className="activity-card" key={item.id}>
            <div>
              <h3>{item.provider}</h3>
              <p>
                {reservationTypes[item.type]} · {item.startDate} —{' '}
                {item.endDate}
              </p>
              <p>
                {reservationStatus[item.status]} · Estimado:{' '}
                {money(item.estimatedCost)}
              </p>
              {item.reference && <p>Referencia: {item.reference}</p>}
            </div>
            {owner && (
              <div className="activity-buttons">
                <button
                  className="edit-button"
                  onClick={() => setEditing(item)}
                >
                  Editar reserva
                </button>
                {item.status !== 'cancelled' && (
                  <button
                    className="cancel-button"
                    disabled={action.busy}
                    onClick={() => {
                      if (window.confirm('¿Cancelar esta reserva?'))
                        action.run(
                          () =>
                            mutate(`${root}/reservations/${item.id}`, 'PATCH', {
                              status: 'cancelled',
                            }),
                          'Reserva cancelada.',
                        );
                    }}
                  >
                    Cancelar reserva
                  </button>
                )}
                <button
                  className="delete-button"
                  disabled={action.busy}
                  onClick={() => {
                    if (window.confirm('¿Eliminar esta reserva?'))
                      action.run(
                        () =>
                          mutate(`${root}/reservations/${item.id}`, 'DELETE'),
                        'Reserva eliminada.',
                      );
                  }}
                >
                  Eliminar reserva
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
