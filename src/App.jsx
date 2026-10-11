import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Itinerario from './pages/Itinerario';
import Presupuesto from './features/presupuesto/Presupuesto'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/itinerario" element={<Itinerario />} />
        <Route path="/presupuesto" element={<Presupuesto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

