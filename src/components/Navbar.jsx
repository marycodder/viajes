function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>TripPlan</h1>
      </div>

      <div className="navbar-links">
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