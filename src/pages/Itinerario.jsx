import { useState } from 'react';

import ActivityCard from '../components/ActivityCard';
import ActivityForm from '../components/ActivityForm';

function Itinerario({
  actividades,
  setActividades,
  onAlternarFavorito,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  const agregarActividad = (nuevaActividad) => {
    setActividades((actividadesActuales) => [
      ...actividadesActuales,
      nuevaActividad,
    ]);
  };

  const eliminarActividad = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que quieres eliminar esta actividad?'
    );

    if (!confirmar) {
      return;
    }

    setActividades((actividadesActuales) =>
      actividadesActuales.filter(
        (actividad) => actividad.id !== id
      )
    );
  };

  const actualizarActividad = (actividadActualizada) => {
    setActividades((actividadesActuales) =>
      actividadesActuales.map((actividad) =>
        actividad.id === actividadActualizada.id
          ? actividadActualizada
          : actividad
      )
    );
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoria('Todas');
    setSoloFavoritos(false);
  };

  const actividadesFiltradas = actividades.filter((actividad) => {
    const coincideBusqueda = actividad.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === 'Todas' ||
      actividad.categoria === categoria;

    const coincideFavorito =
      !soloFavoritos || actividad.favorito;

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideFavorito
    );
  });

  const actividadesOrdenadas = [...actividadesFiltradas].sort(
    (a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);

      return fechaA - fechaB;
    }
  );

  const actividadesPorFecha = actividadesOrdenadas.reduce(
    (grupos, actividad) => {
      const fecha = actividad.fecha;

      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }

      grupos[fecha].push(actividad);

      return grupos;
    },
    {}
  );

  return (
    <main className="itinerary-page">
      <section className="itinerary-header">
        <p className="section-label">Tu planificación</p>

        <h2>Itinerario</h2>

        <p>
          Revisa todas las actividades organizadas para tu viaje.
        </p>
      </section>

      <ActivityForm onAgregarActividad={agregarActividad} />

      <section className="itinerary-filters">
        <div className="filters-header">
          <div>
            <p className="section-label">Organiza tu búsqueda</p>
            <h2>Filtrar actividades</h2>
          </div>

          <button
            className="clear-filters-button"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="buscar-actividad">
              Buscar actividad
            </label>

            <input
              id="buscar-actividad"
              type="text"
              placeholder="Ej: museo, cena, parque..."
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="categoria-filtro">
              Categoría
            </label>

            <select
              id="categoria-filtro"
              value={categoria}
              onChange={(evento) =>
                setCategoria(evento.target.value)
              }
            >
              <option value="Todas">Todas</option>
              <option value="Turismo">Turismo</option>
              <option value="Cultura">Cultura</option>
              <option value="Gastronomía">
                Gastronomía
              </option>
              <option value="Paseo">Paseo</option>
              <option value="Entretenimiento">
                Entretenimiento
              </option>
            </select>
          </div>

          <label className="favorite-filter">
            <input
              type="checkbox"
              checked={soloFavoritos}
              onChange={(evento) =>
                setSoloFavoritos(evento.target.checked)
              }
            />

            <span>Solo favoritas</span>
          </label>
        </div>
      </section>

      <section className="itinerary-content">
        <div className="itinerary-results">
          <span>
            {actividadesFiltradas.length}{' '}
            {actividadesFiltradas.length === 1
              ? 'actividad encontrada'
              : 'actividades encontradas'}
          </span>
        </div>

        {actividadesFiltradas.length === 0 ? (
          <div className="itinerary-empty">
            <h3>No encontramos actividades</h3>

            <p>
              Prueba modificando o limpiando los filtros.
            </p>

            <button
              className="primary-button"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          Object.entries(actividadesPorFecha).map(
            ([fecha, actividadesDelDia]) => (
              <div className="itinerary-day" key={fecha}>
                <div className="itinerary-date">
                  <h3>{fecha}</h3>

                  <span>
                    {actividadesDelDia.length}{' '}
                    {actividadesDelDia.length === 1
                      ? 'actividad'
                      : 'actividades'}
                  </span>
                </div>

                <div className="activities-list">
                  {actividadesDelDia.map((actividad) => (
                    <ActivityCard
                      key={actividad.id}
                      actividad={actividad}
                      onActualizarActividad={
                        actualizarActividad
                      }
                      onEliminarActividad={
                        eliminarActividad
                      }
                      onAlternarFavorito={
                        onAlternarFavorito
                      }
                    />
                  ))}
                </div>
              </div>
            )
          )
        )}
      </section>
    </main>
  );
}

export default Itinerario;