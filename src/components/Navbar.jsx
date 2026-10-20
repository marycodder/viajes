import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoTripPlan from '../assets/logotp.jpg';

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const alternarMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img
          src={logoTripPlan}
          alt="TripPlan"
          className="navbar-logo"
        />
    <span className="navbar-brand-text">
      Trip Plan
    </span>

      </Link>

      <button
        className="menu-toggle"
        onClick={alternarMenu}
        aria-label="Abrir menú de navegación"
      >
        ☰
      </button>

      <div className={`navbar-links ${menuAbierto ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuAbierto(false)}>
          Inicio
        </Link>

        <Link
          to="/itinerario"
          onClick={() => setMenuAbierto(false)}
        >
          Itinerario
        </Link>

        <Link
          to="/destinos"
          onClick={() => setMenuAbierto(false)}
        >
          Destinos
        </Link>

        <Link
          to="/presupuesto"
          onClick={() => setMenuAbierto(false)}
        >
          Presupuesto
        </Link>

        <Link
          to="/favoritos"
          onClick={() => setMenuAbierto(false)}
        >
          Favoritos
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;