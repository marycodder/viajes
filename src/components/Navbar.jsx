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
        <a href="#">Destinos</a>
        <a href="#">Presupuesto</a>
        <Link to="/favoritos">Favoritos</Link>
      </div>
    </nav>
  );
}

export default Navbar;