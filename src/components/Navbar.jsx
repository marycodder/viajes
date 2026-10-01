import { useState } from 'react';

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
        <a href="#">Inicio</a>
        <a href="#">Itinerario</a>
        <a href="#">Destinos</a>
        <a href="#">Presupuesto</a>
        <a href="#">Favoritos</a>
      </div>
    </nav>
  );
}

export default Navbar;