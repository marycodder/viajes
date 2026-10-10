import { useState } from 'react';
import { actividades as actividadesIniciales } from '../data/actividades';

import ActivityCard from '../components/ActivityCard';
import ActivityForm from '../components/ActivityForm';

function Itinerario() {
  const [actividades, setActividades] = useState(actividadesIniciales);

  const agregarActividad = (nuevaActividad) => {
    setActividades([
      ...actividades,
      nuevaActividad,
    ]);
  };

  const eliminarActividad = (id) => {
    const confirmar = window.confirm(
      '¿Seguro que quieres eliminar esta actividad?'
    );

    if (!confirmar) return;

    setActividades(
      actividades.filter((actividad) => actividad.id !== id)
    );
  };

  const actualizarActividad = (actividadActualizada) => {
    setActividades(
      actividades.map((actividad) =>
        actividad.id === actividadActualizada.id
          ? actividadActualizada
          : actividad
      )
    );
  };

  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);

    return fechaA - fechaB;
  });

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

      <ActivityForm
        onAgregarActividad={agregarActividad}
      />

      <section className="itinerary-content">
        {Object.entries(actividadesPorFecha).map(
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
                    onActualizarActividad={actualizarActividad}
                    onEliminarActividad={eliminarActividad}
                  />
                ))}
              </div>
            </div>
          )
        )}
      </section>
    </main>
  );
}

export default Itinerario;