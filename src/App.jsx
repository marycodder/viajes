import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Itinerario from './pages/Itinerario';
import Favoritos from './pages/Favoritos';

import { actividades as actividadesIniciales } from './data/actividades';

function App() {
  const [actividades, setActividades] = useState(actividadesIniciales);

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
        <Route path="/" element={<Dashboard />} />

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