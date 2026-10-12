function TripSummary({
  viaje,
  actividades,
  totalGastado,
  presupuestoDisponible,
}) {
  const cantidadFavoritos = actividades.filter(
    (actividad) => actividad.favorito
  ).length;

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);

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
          <h3>{viaje.destino}</h3>

          <p>
            {viaje.fechaInicio} - {viaje.fechaFin}
          </p>
        </div>

        <div className="trip-summary-grid">
          <div className="summary-item">
            <span>Actividades</span>
            <strong>{actividades.length}</strong>
          </div>

          <div className="summary-item">
            <span>Favoritos</span>
            <strong>{cantidadFavoritos}</strong>
          </div>

          <div className="summary-item">
            <span>Gastado</span>
            <strong>{formatoMoneda(totalGastado)}</strong>
          </div>

          <div className="summary-item">
            <span>Disponible</span>
            <strong>{formatoMoneda(presupuestoDisponible)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TripSummary;