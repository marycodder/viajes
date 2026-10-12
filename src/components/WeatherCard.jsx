function WeatherCard({ dia }) {
  const obtenerDescripcion = (codigo) => {
    if (codigo === 0) {
      return 'Despejado';
    }

    if ([1, 2, 3].includes(codigo)) {
      return 'Parcialmente nublado';
    }

    if ([45, 48].includes(codigo)) {
      return 'Niebla';
    }

    if ([51, 53, 55, 56, 57].includes(codigo)) {
      return 'Llovizna';
    }

    if ([61, 63, 65, 66, 67].includes(codigo)) {
      return 'Lluvia';
    }

    if ([71, 73, 75, 77].includes(codigo)) {
      return 'Nieve';
    }

    if ([80, 81, 82].includes(codigo)) {
      return 'Chubascos';
    }

    if ([95, 96, 99].includes(codigo)) {
      return 'Tormenta';
    }

    return 'Clima variable';
  };

  return (
    <article className="weather-card">
      <h3>{dia.fecha}</h3>

      <p className="weather-description">
        {obtenerDescripcion(dia.codigo)}
      </p>

      <div className="weather-temperatures">
        <span>Máx. {dia.maxima} °C</span>
        <span>Mín. {dia.minima} °C</span>
      </div>

      <p>Prob. lluvia: {dia.lluvia}%</p>
    </article>
  );
}

export default WeatherCard;