import { Link } from 'react-router-dom';

export function ActionFeedback({ action }) {
  return (
    <>
      {action.error && (
        <p className="form-error" role="alert">
          {action.error}
        </p>
      )}
      {action.message && (
        <p className="success-message" role="status">
          {action.message}
        </p>
      )}
    </>
  );
}
export function ResourceFeedback({ resource }) {
  return (
    <>
      {resource.loading && (
        <p className="loading-message" role="status">
          Cargando…
        </p>
      )}
      {resource.error && (
        <div className="form-error" role="alert">
          <p>{resource.error}</p>
          <button className="cancel-button" onClick={resource.reload}>
            Reintentar
          </button>
        </div>
      )}
    </>
  );
}
export function NoTrip() {
  return (
    <main className="itinerary-page">
      <div className="itinerary-empty">
        <h2>Comienza tu planificación</h2>
        <p>Crea un viaje o selecciona uno para consultar sus actividades.</p>
        <Link className="primary-button" to="/viajes">
          Administrar viajes
        </Link>
      </div>
    </main>
  );
}
export function ReadOnlyNotice() {
  return (
    <p className="info-message">
      Participas como viajero. Puedes consultar el viaje y guardar tus
      favoritos; el propietario administra la planificación.
    </p>
  );
}
