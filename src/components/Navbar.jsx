import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <div className="navbar-brand">
        <h1>TripPlan</h1>
      </div>
      <button
        className="menu-toggle"
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
      <div
        id="main-navigation"
        className={`navbar-links ${open ? 'active' : ''}`}
      >
        {Object.entries({
          '/': 'Inicio',
          '/viajes': 'Viajes',
          '/itinerario': 'Itinerario',
          '/destinos': 'Destinos',
          '/presupuesto': 'Presupuesto',
          '/reservas': 'Reservas',
          '/favoritos': 'Favoritos',
          '/notas': 'Notas',
          '/historial': 'Historial',
        }).map(([path, label]) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}
        <span className="session-name">{user.name}</span>
        <button className="logout-button" onClick={signOut}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
