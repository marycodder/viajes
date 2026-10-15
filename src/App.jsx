import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Itinerario from './pages/Itinerario';
import Destinos from './pages/Destinos';
import Favoritos from './pages/Favoritos';
import Presupuesto from './features/presupuesto/Presupuesto';

import { actividades as actividadesIniciales } from './data/actividades';
import { viajes } from './data/viajes';

function App() {
  const [actividades, setActividades] = useState(() => {
    const actividadesGuardadas = localStorage.getItem(
      'tripplan_actividades'
    );

    if (actividadesGuardadas) {
      try {
        return JSON.parse(actividadesGuardadas);
      } catch (error) {
        console.error(
          'Error al cargar las actividades guardadas:',
          error
        );
      }
    }

    return actividadesIniciales;
  });

  const [gastosAdicionalesClp, setGastosAdicionalesClp] =
    useState(() => {
      const guardado = localStorage.getItem(
        'tripplan_gastos_adicionales_clp'
      );

      return guardado
        ? Number(guardado) || 0
        : 0;
    });

  useEffect(() => {
    localStorage.setItem(
      'tripplan_actividades',
      JSON.stringify(actividades)
    );
  }, [actividades]);

  useEffect(() => {
    localStorage.setItem(
      'tripplan_gastos_adicionales_clp',
      String(gastosAdicionalesClp)
    );
  }, [gastosAdicionalesClp]);

  const alternarFavorito = (id) => {
    setActividades((actividadesActuales) =>
      actividadesActuales.map((actividad) =>
        actividad.id === id
          ? {
              ...actividad,
              favorito: !actividad.favorito,
            }
          : actividad
      )
    );
  };

  const viajeActual = viajes[0];

  const diasViaje =
    Math.ceil(
      (new Date(viajeActual.fechaFin) -
        new Date(viajeActual.fechaInicio)) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              actividades={actividades}
              gastosAdicionales={gastosAdicionalesClp}
            />
          }
        />

        <Route
          path="/itinerario"
          element={
            <Itinerario
              actividades={actividades}
              setActividades={setActividades}
              onAlternarFavorito={alternarFavorito}
            />
          }
        />

        <Route
          path="/destinos"
          element={<Destinos />}
        />

        <Route
          path="/presupuesto"
          element={
            <Presupuesto
              actividades={actividades}
              presupuestoInicial={viajeActual.presupuesto}
              dias={diasViaje}
              destino={{
                nombre: viajeActual.destino,
                pais: 'Chile',
                moneda: 'CLP',
              }}
              onGastosAdicionalesChange={
                setGastosAdicionalesClp
              }
            />
          }
        />

        <Route
          path="/favoritos"
          element={
            <Favoritos
              actividades={actividades}
              onAlternarFavorito={alternarFavorito}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;