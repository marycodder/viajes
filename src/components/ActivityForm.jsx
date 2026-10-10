import { useState } from 'react';

function ActivityForm({ agregarActividad }) {
  const [formulario, setFormulario] = useState({
    nombre: '',
    fecha: '',
    hora: '',
    categoria: '',
    costo: '',
  });

  const [error, setError] = useState('');

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();

    if (
      !formulario.nombre ||
      !formulario.fecha ||
      !formulario.hora ||
      !formulario.categoria
    ) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    const nuevaActividad = {
      id: Date.now(),
      nombre: formulario.nombre,
      fecha: formulario.fecha,
      hora: formulario.hora,
      categoria: formulario.categoria,
      costo: Number(formulario.costo) || 0,
      favorito: false,
    };

    agregarActividad(nuevaActividad);

    setFormulario({
      nombre: '',
      fecha: '',
      hora: '',
      categoria: '',
      costo: '',
    });

    setError('');
  };

  return (
    <form className="activity-form" onSubmit={manejarEnvio}>
      <h2>Agregar actividad</h2>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="form-group">
        <label htmlFor="nombre">Nombre *</label>

        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formulario.nombre}
          onChange={manejarCambio}
          placeholder="Ej: Visita a Sky Costanera"
        />
      </div>

      <div className="form-group">
        <label htmlFor="categoria">Categoría *</label>

        <select
          id="categoria"
          name="categoria"
          value={formulario.categoria}
          onChange={manejarCambio}
        >
          <option value="">Selecciona una categoría</option>
          <option value="Turismo">Turismo</option>
          <option value="Cultura">Cultura</option>
          <option value="Gastronomía">Gastronomía</option>
          <option value="Paseo">Paseo</option>
          <option value="Entretenimiento">Entretenimiento</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fecha">Fecha *</label>

          <input
            id="fecha"
            name="fecha"
            type="date"
            value={formulario.fecha}
            onChange={manejarCambio}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hora">Hora *</label>

          <input
            id="hora"
            name="hora"
            type="time"
            value={formulario.hora}
            onChange={manejarCambio}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="costo">Costo estimado</label>

        <input
          id="costo"
          name="costo"
          type="number"
          min="0"
          value={formulario.costo}
          onChange={manejarCambio}
          placeholder="0"
        />
      </div>

      <button type="submit" className="primary-button">
        Agregar actividad
      </button>
    </form>
  );
}

export default ActivityForm;