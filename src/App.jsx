import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Itinerario from './pages/Itinerario';
import Favoritos from './pages/Favoritos';
import Destinos from './pages/Destinos';

import { actividades as actividadesIniciales } from './data/actividades';

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

  useEffect(() => {
    localStorage.setItem(
      'tripplan_actividades',
      JSON.stringify(actividades)
    );
  }, [actividades]);

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

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Dashboard actividades={actividades} />}
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