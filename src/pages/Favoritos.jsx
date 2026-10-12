function Favoritos({ actividades, onAlternarFavorito }) {
  const actividadesFavoritas = actividades.filter(
    (actividad) => actividad.favorito
  );

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);

  return (
    <main className="favorites-page">
      <section className="favorites-header">
        <p className="section-label">Tus preferidas</p>

        <h2>Favoritos</h2>

        <p>
          Guarda las actividades que más te interesan para encontrarlas
          rápidamente.
        </p>
      </section>

      {actividadesFavoritas.length === 0 ? (
        <div className="favorites-empty">
          <span className="favorites-empty-icon">♡</span>

          <h3>Aún no tienes actividades favoritas</h3>

          <p>
            Marca una actividad con el corazón desde tu itinerario para
            agregarla aquí.
          </p>
        </div>
      ) : (
        <section className="favorites-list">
          {actividadesFavoritas.map((actividad) => (
            <article className="favorite-card" key={actividad.id}>
              <div className="favorite-card-info">
                <span className="activity-category">
                  {actividad.categoria}
                </span>

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

              <button
                className="remove-favorite-button"
                onClick={() => onAlternarFavorito(actividad.id)}
              >
                ♥ Quitar de favoritos
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Favoritos;