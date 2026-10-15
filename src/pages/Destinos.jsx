import { useState } from 'react';
import { destinos } from '../data/destinos';

function Destinos() {
  const [busqueda, setBusqueda] = useState('');

  const destinosFiltrados = destinos.filter((destino) => {
    const texto = busqueda.toLowerCase();

    return (
      destino.nombre.toLowerCase().includes(texto) ||
      destino.region.toLowerCase().includes(texto) ||
      destino.tipo.toLowerCase().includes(texto)
    );
  });

  return (
    <main className="destinations-page">
      <section className="destinations-header">
        <p className="section-label">Explora Chile</p>

        <h2>Destinos</h2>

        <p>
          Santiago es el destino de tu viaje actual. También puedes explorar
          otros destinos sugeridos para futuras planificaciones.
        </p>
      </section>

      <section className="destinations-search">
        <label htmlFor="buscar-destino">
          Buscar destino
        </label>

        <input
          id="buscar-destino"
          type="text"
          placeholder="Busca destinos sugeridos por nombre, región o tipo..."
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </section>

      {destinosFiltrados.length === 0 ? (
        <div className="destinations-empty">
          <h3>No encontramos destinos</h3>

          <p>
            Intenta buscar utilizando otro nombre, región o tipo de destino.
          </p>
        </div>
      ) : (
        <section className="destinations-grid">
          {destinosFiltrados.map((destino) => (
            <article
              className="destination-card"
              key={destino.id}
            >
              <div className="destination-card-header">
                <span className="destination-type">
                  {destino.tipo}
                </span>

                {destino.destacado && (
                  <span className="current-destination">
                    Destino actual
                  </span>
                )}
              </div>

              <h3>{destino.nombre}</h3>

              <p className="destination-region">
                {destino.region}
              </p>

              <p className="destination-description">
                {destino.descripcion}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Destinos;