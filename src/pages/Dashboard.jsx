import { viajes } from '../data/viajes';
import { actividades } from '../data/actividades';

import StatCard from '../components/StatCard';
import ActivityCard from '../components/ActivityCard';

function Dashboard() {
  const viaje = viajes[0];

  const totalGastado = actividades.reduce(
    (total, actividad) => total + actividad.costo,
    0
  );

  const presupuestoDisponible = viaje.presupuesto - totalGastado;

  const proximasActividades = actividades.slice(0, 3);

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);



  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <p className="dashboard-label">Próximo viaje</p>

        <h2>{viaje.destino}</h2>

        <p>
          {viaje.fechaInicio} — {viaje.fechaFin}
        </p>
      </section>

      <section className="stats-container">
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

      <section className="activities-section">
        <div className="section-header">
          <h2>Próximas actividades</h2>
        </div>

        <div className="activities-list">
          {proximasActividades.map((actividad) => (
            <ActivityCard
              key={actividad.id}
              actividad={actividad}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;