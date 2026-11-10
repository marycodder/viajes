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

export default function Documentos() {
  const { trip, owner, mutate } = useTrip();
  const [type, setType] = useState('notes');
  const [editing, setEditing] = useState(null);
  const root = trip ? `/trips/${trip.id}/${type}` : null;
  const documents = useTripResource(root, { list: true });
  const action = useAction();
  if (!trip) return <NoTrip />;
  const label = type === 'notes' ? 'nota' : 'recomendación';
  const fields = [
    { name: 'title', label: 'Título', required: true },
    {
      name: 'content',
      label: 'Contenido',
      type: 'textarea',
      maxLength: 10000,
      required: true,
    },
    {
      name: 'tags',
      label: 'Etiquetas',
      maxLength: 819,
      hint: 'Separa las etiquetas con comas. Máximo 20 etiquetas de 40 caracteres.',
    },
  ];
  return (
    <main className="itinerary-page">
      <header className="itinerary-header">
        <p className="section-label">Información para tu viaje</p>
        <h2>Notas y recomendaciones</h2>
        <p>
          Guarda recordatorios y recomendaciones que quieras consultar durante
          el viaje.
        </p>
      </header>
      <div
        className="document-tabs"
        role="group"
        aria-label="Tipo de documento"
      >
        {[
          ['notes', 'Notas'],
          ['recommendations', 'Recomendaciones'],
        ].map(([value, title]) => (
          <button
            key={value}
            className={type === value ? 'primary-button' : 'cancel-button'}
            aria-pressed={type === value}
            onClick={() => {
              setType(value);
              setEditing(null);
            }}
          >
            {title}
          </button>
        ))}
      </div>
      {!owner && <ReadOnlyNotice />}
      {owner && (
        <EntityForm
          key={`${type}-${editing?._id || 'new'}`}
          title={`${editing ? 'Editar' : 'Crear'} ${label}`}
          fields={fields}
          initial={editing ? { ...editing, tags: editing.tags.join(', ') } : {}}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSave={async (values) => {
            const tags = [
              ...new Set(
                values.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              ),
            ];
            if (tags.length > 20 || tags.some((tag) => tag.length > 40))
              throw new Error(
                'Usa hasta 20 etiquetas de un máximo de 40 caracteres.',
              );
            await mutate(
              editing ? `${root}/${editing._id}` : root,
              editing ? 'PATCH' : 'POST',
              { title: values.title, content: values.content, tags },
            );
            setEditing(null);
          }}
        />
      )}
      <ResourceFeedback resource={documents} />
      <ActionFeedback action={action} />
      {documents.data?.length === 0 && (
        <p className="empty-state">
          Todavía no hay {type === 'notes' ? 'notas' : 'recomendaciones'} para
          este viaje.
        </p>
      )}
      <section
        className="activities-list"
        aria-label={
          type === 'notes' ? 'Notas guardadas' : 'Recomendaciones guardadas'
        }
      >
        {documents.data?.map((item) => (
          <article className="destination-card" key={item._id}>
            <h3>{item.title}</h3>
            <p className="document-content">{item.content}</p>
            <div className="tag-list">
              {item.tags.map((tag) => (
                <span className="activity-category" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer">
                Consultar enlace recomendado
              </a>
            )}
            {owner && (
              <div className="activity-buttons">
                <button
                  className="edit-button"
                  onClick={() => setEditing(item)}
                >
                  Editar {label}
                </button>
                <button
                  className="delete-button"
                  disabled={action.busy}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar esta ${label}?`))
                      action.run(
                        () => mutate(`${root}/${item._id}`, 'DELETE'),
                        `${type === 'notes' ? 'Nota eliminada' : 'Recomendación eliminada'}.`,
                      );
                  }}
                >
                  Eliminar {label}
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
