import { useState } from 'react';
import { Link } from 'react-router-dom';
import EntityForm from '../components/EntityForm';
import StatCard from '../components/StatCard';
import {
  ActionFeedback,
  NoTrip,
  ReadOnlyNotice,
  ResourceFeedback,
} from '../components/Feedback';
import { useTrip, useTripResource } from '../context/trip-context';
import useAction from '../hooks/useAction';
import { categories, money, today } from '../services/format';

export default function Presupuesto() {
  const { trip, owner, mutate } = useTrip();
  const root = trip ? `/trips/${trip.id}` : null;
  const summary = useTripResource(root && `${root}/summary`);
  const expenses = useTripResource(root && `${root}/expenses`, { list: true });
  const travelers = useTripResource(root && `${root}/travelers`);
  const activities = useTripResource(root && `${root}/activities`, {
    list: true,
  });
  const [editing, setEditing] = useState(null);
  const action = useAction();
  if (!trip) return <NoTrip />;
  const fields = [
    { name: 'description', label: 'Descripción del gasto', required: true },
    {
      name: 'category',
      label: 'Categoría del gasto',
      required: true,
      defaultValue: 'Otros',
      options: categories.map((value) => ({ value, label: value })),
    },
    {
      name: 'date',
      label: 'Fecha del pago',
      type: 'date',
      required: true,
      defaultValue: today(),
    },
    {
      name: 'amount',
      label: 'Monto pagado (CLP)',
      type: 'number',
      required: true,
      min: 1,
      max: 1000000000000,
    },
    {
      name: 'paidBy',
      label: 'Quién pagó',
      required: true,
      defaultValue: trip.ownerId,
      options: [
        ...(travelers.data || []).map((item) => ({
          value: item.id,
          label: item.name,
        })),
        ...(editing &&
        !travelers.data?.some((item) => item.id === editing.paidBy)
          ? [
              {
                value: editing.paidBy,
                label: 'Viajero registrado anteriormente',
              },
            ]
          : []),
      ],
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
  const totals = (expenses.data || []).reduce(
    (all, item) => ({
      ...all,
      [item.category]: (all[item.category] || 0) + item.amount,
    }),
    {},
  );
  return (
    <main className="itinerary-page">
      <header className="itinerary-header">
        <p className="section-label">Control de gastos</p>
        <h2>Presupuesto</h2>
        <p>Los costos estimados y los pagos reales se muestran por separado.</p>
      </header>
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
          <p className="info-message">
            Estimado de actividades:{' '}
            {money(summary.data.estimatedActivitiesCost)}. Uso del presupuesto:{' '}
            {summary.data.budgetUsedPercent === null
              ? 'sin presupuesto definido'
              : `${summary.data.budgetUsedPercent}%`}
            .
          </p>
          {summary.data.overBudget && (
            <p className="form-error" role="alert">
              Los gastos superan el presupuesto del viaje.
            </p>
          )}
        </>
      )}
      {owner ? (
        <p className="info-message">
          Puedes modificar el presupuesto en{' '}
          <Link to="/viajes">Viajes → Editar viaje</Link>.
        </p>
      ) : (
        <ReadOnlyNotice />
      )}
      <ResourceFeedback resource={travelers} />
      <ResourceFeedback resource={activities} />
      {owner && travelers.data && activities.data && (
        <EntityForm
          key={editing?.id || 'new'}
          title={editing ? 'Editar gasto' : 'Registrar gasto'}
          fields={fields}
          initial={editing || {}}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSave={async (values) => {
            if (editing && values.paidBy === editing.paidBy)
              delete values.paidBy;
            await mutate(
              editing ? `${root}/expenses/${editing.id}` : `${root}/expenses`,
              editing ? 'PATCH' : 'POST',
              values,
            );
            setEditing(null);
          }}
        />
      )}
      <ResourceFeedback resource={expenses} />
      <ActionFeedback action={action} />
      {expenses.data?.length === 0 && (
        <p className="empty-state">Todavía no hay gastos registrados.</p>
      )}
      <section className="activities-list" aria-label="Gastos registrados">
        {expenses.data?.map((expense) => (
          <article className="activity-card" key={expense.id}>
            <div>
              <h3>{expense.description}</h3>
              <p>
                {expense.date} · {expense.category} ·{' '}
                {travelers.data?.find((item) => item.id === expense.paidBy)
                  ?.name || 'Viajero anterior'}
              </p>
              <p>{money(expense.amount)}</p>
            </div>
            {owner && (
              <div className="activity-buttons">
                <button
                  className="edit-button"
                  onClick={() => setEditing(expense)}
                >
                  Editar gasto
                </button>
                <button
                  className="delete-button"
                  disabled={action.busy}
                  onClick={() => {
                    if (window.confirm('¿Eliminar este gasto?'))
                      action.run(
                        () =>
                          mutate(`${root}/expenses/${expense.id}`, 'DELETE'),
                        'Gasto eliminado.',
                      );
                  }}
                >
                  Eliminar gasto
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
      {Object.keys(totals).length > 0 && (
        <section className="dashboard-section">
          <h2>Gastos por categoría</h2>
          <div className="summary-grid">
            {Object.entries(totals).map(([category, total]) => (
              <div className="summary-item" key={category}>
                <span>{category}</span>
                <strong>{money(total)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
