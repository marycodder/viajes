import { useEffect, useState } from 'react';

import StatCard from '../components/StatCard';
import WeatherCard from '../components/WeatherCard';

import { viajes } from '../data/viajes';
import { obtenerClima } from '../services/weatherApi';
import TripSummary from '../components/TripSummary';

function Dashboard({ 
  actividades,
  gastosAdicionales = 0,

 }) {
  const viaje = viajes[0];

  const [clima, setClima] = useState([]);
  const [cargandoClima, setCargandoClima] = useState(true);
  const [errorClima, setErrorClima] = useState('');

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);

  const totalActividades =
    actividades.reduce(
      (total, actividad) =>
        total +
        (Number(actividad.costo) || 0),
      0
    );

  const totalGastado =
    totalActividades +
    gastosAdicionales;

  const presupuestoDisponible =
    viaje.presupuesto - totalGastado;

  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);

    return fechaA - fechaB;
  });

  const proximasActividades = actividadesOrdenadas.slice(0, 3);

  useEffect(() => {
    const cargarClima = async () => {
      try {
        setCargandoClima(true);
        setErrorClima('');

        const datos = await obtenerClima(
          viaje.latitud,
          viaje.longitud,
          viaje.fechaInicio,
          viaje.fechaFin
        );

        const pronostico = datos.daily.time.map((fecha, indice) => ({
          fecha,
          codigo: datos.daily.weather_code[indice],
          maxima: datos.daily.temperature_2m_max[indice],
          minima: datos.daily.temperature_2m_min[indice],
          lluvia:
            datos.daily.precipitation_probability_max[indice] ?? 0,
        }));

        setClima(pronostico);
      } catch (error) {
        console.error('Error al cargar el clima:', error);

        setErrorClima(
          'No fue posible cargar el pronóstico del tiempo.'
        );
      } finally {
        setCargandoClima(false);
      }
    };

    cargarClima();
  }, [
    viaje.latitud,
    viaje.longitud,
    viaje.fechaInicio,
    viaje.fechaFin,
  ]);

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <div>
          <p className="section-label">Próximo viaje</p>

          <h2>{viaje.destino}</h2>

          <p className="trip-dates">
            {viaje.fechaInicio} - {viaje.fechaFin}
          </p>
        </div>

        <div className="trip-summary">
          <span>
            {actividades.length}{' '}
            {actividades.length === 1
              ? 'actividad'
              : 'actividades'}
          </span>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          titulo="Presupuesto"
          valor={formatoMoneda(viaje.presupuesto)}
        />

        <StatCard
          titulo="Gastado"
          valor={formatoMoneda(totalGastado)}
        />

        <StatCard
          titulo="Disponible"
          valor={formatoMoneda(presupuestoDisponible)}
        />
      </section>

      <TripSummary
          viaje={viaje}
          actividades={actividades}
          totalGastado={totalGastado}
          presupuestoDisponible={presupuestoDisponible}
        />

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="section-label">Planificación</p>
            <h2>Próximas actividades</h2>
          </div>

          <span className="activities-count">
            {actividades.length}{' '}
            {actividades.length === 1
              ? 'actividad'
              : 'actividades'}
          </span>
        </div>

        {proximasActividades.length === 0 ? (
          <div className="empty-state">
            <h3>No hay actividades planificadas</h3>

            <p>
              Agrega actividades desde el itinerario para comenzar
              a organizar tu viaje.
            </p>
          </div>
        ) : (
          <div className="activities-list">
            {proximasActividades.map((actividad) => (
              <article
                className="activity-card"
                key={actividad.id}
              >
                <div className="activity-info">
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

                <div className="activity-actions">
                  <span className="activity-category">
                    {actividad.categoria}
                  </span>

                  {actividad.favorito && (
                    <span
                      className="dashboard-favorite"
                      title="Actividad favorita"
                    >
                      ♥
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section weather-section">
        <div className="section-header">
          <div>
            <p className="section-label">Pronóstico</p>
            <h2>Clima en {viaje.destino}</h2>
          </div>
        </div>

        {cargandoClima && (
          <div className="weather-message">
            <p>Cargando pronóstico...</p>
          </div>
        )}

        {errorClima && (
          <div className="weather-error">
            <p>{errorClima}</p>
          </div>
        )}

        {!cargandoClima && !errorClima && clima.length > 0 && (
          <div className="weather-grid">
            {clima.map((dia) => (
              <WeatherCard
                key={dia.fecha}
                dia={dia}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;