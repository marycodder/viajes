import { money } from '../services/format';

export default function TripSummary({ trip, activities, summary }) {
  const items = [
    ['Actividades vigentes', summary.activeActivities],
    ['Favoritos personales', activities.filter((item) => item.favorite).length],
    ['Estimado de actividades', money(summary.estimatedActivitiesCost)],
    ['Gastos reales', money(summary.spent)],
    ['Disponible', money(summary.remaining)],
    ['Viajeros', summary.travelers],
    ['Reservas confirmadas', summary.confirmedReservations],
  ];
  return (
    <section className="trip-summary-section">
      <div className="section-header">
        <div>
          <p className="section-label">Vista general</p>
          <h2>Resumen del viaje</h2>
        </div>
      </div>
      <div className="trip-summary-card">
        <div className="trip-summary-main">
          <h3>{trip.name}</h3>
          <p>
            {trip.startDate} — {trip.endDate}
          </p>
        </div>
        <div className="trip-summary-grid">
          {items.map(([label, value]) => (
            <div className="summary-item" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
