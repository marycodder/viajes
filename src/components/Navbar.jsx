import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const alternarMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>TripPlan</h1>
      </div>

      <button
        className="menu-toggle"
        onClick={alternarMenu}
        aria-label="Abrir menú de navegación"
      >
        ☰
      </button>

      <div className={`navbar-links ${menuAbierto ? 'active' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/itinerario">Itinerario</Link>
        <Link to="/presupuesto">Presupuesto</Link>
        <a href="#">Destinos</a>
        <a href="#">Favoritos</a>
      </div>
    </nav>
  );
}

export default Navbar;