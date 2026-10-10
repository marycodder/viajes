import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Itinerario from './pages/Itinerario';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/itinerario" element={<Itinerario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;