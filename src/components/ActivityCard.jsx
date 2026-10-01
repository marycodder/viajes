function ActivityCard({ actividad }) {
  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);

  return (
    <article className="activity-card">
      <div>
        <h3>{actividad.nombre}</h3>

        <p>
          {actividad.fecha} · {actividad.hora}
        </p>

        <p className="activity-cost">
          {actividad.costo === 0
            ? 'Gratis'
            : formatoMoneda(actividad.costo)}
        </p>
      </div>

      <span>{actividad.categoria}</span>
    </article>
  );
}

export default ActivityCard;