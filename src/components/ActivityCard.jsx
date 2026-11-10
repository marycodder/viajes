import useAction from '../hooks/useAction';
import { activityStatus, money } from '../services/format';
import { ActionFeedback } from './Feedback';

export default function ActivityCard({
  activity,
  owner = false,
  onEdit,
  onDelete,
  onFavorite,
}) {
  const action = useAction();
  return (
    <article className="activity-card">
      <div className="activity-info">
        <h3>{activity.name}</h3>
        <p>
          {activity.date?.slice(0, 10)} · {activity.time.slice(0, 5)}
        </p>
        <p className="activity-cost">
          Estimado: {money(activity.estimatedCost)}
        </p>
        <p>{activityStatus[activity.status]}</p>
        {activity.description && <p>{activity.description}</p>}
        <ActionFeedback action={action} />
      </div>
      <div className="activity-actions">
        <div className="activity-top-actions">
          <span className="activity-category">{activity.category}</span>
          <button
            className={`favorite-button ${activity.favorite ? 'active' : ''}`}
            disabled={action.busy}
            aria-label={
              activity.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
            }
            aria-pressed={activity.favorite}
            onClick={() =>
              action.run(
                () => onFavorite(activity),
                activity.favorite ? 'Favorito retirado.' : 'Favorito guardado.',
              )
            }
          >
            {activity.favorite ? '♥' : '♡'}
          </button>
        </div>
        {owner && (
          <div className="activity-buttons">
            <button className="edit-button" onClick={() => onEdit(activity)}>
              Editar actividad
            </button>
            <button
              className="delete-button"
              disabled={action.busy}
              onClick={() => {
                if (window.confirm(`¿Eliminar "${activity.name}"?`))
                  action.run(
                    () => onDelete(activity.id),
                    'Actividad eliminada.',
                  );
              }}
            >
              Eliminar actividad
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
