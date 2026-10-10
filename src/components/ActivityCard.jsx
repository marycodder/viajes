import { useState } from 'react';

function ActivityCard({
  actividad,
  onActualizarActividad,
  onEliminarActividad,
}) {
  const [editando, setEditando] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: actividad.nombre,
    fecha: actividad.fecha,
    hora: actividad.hora,
    categoria: actividad.categoria,
    costo: actividad.costo,
  });

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const guardarCambios = () => {
    const actividadActualizada = {
      ...actividad,
      nombre: formulario.nombre,
      fecha: formulario.fecha,
      hora: formulario.hora,
      categoria: formulario.categoria,
      costo: Number(formulario.costo) || 0,
    };

    onActualizarActividad(actividadActualizada);
    setEditando(false);
  };

  const cancelarEdicion = () => {
    setFormulario({
      nombre: actividad.nombre,
      fecha: actividad.fecha,
      hora: actividad.hora,
      categoria: actividad.categoria,
      costo: actividad.costo,
    });

    setEditando(false);
  };

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);

  if (editando) {
    return (
      <article className="activity-card activity-card-editing">
        <div className="inline-edit-form">
          <div className="form-group">
            <label>Nombre</label>

            <input
              name="nombre"
              type="text"
              value={formulario.nombre}
              onChange={manejarCambio}
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>

            <select
              name="categoria"
              value={formulario.categoria}
              onChange={manejarCambio}
            >
              <option value="Turismo">Turismo</option>
              <option value="Cultura">Cultura</option>
              <option value="Gastronomía">Gastronomía</option>
              <option value="Paseo">Paseo</option>
              <option value="Entretenimiento">Entretenimiento</option>
            </select>
          </div>

          <div className="inline-edit-row">
            <div className="form-group">
              <label>Fecha</label>

              <input
                name="fecha"
                type="date"
                value={formulario.fecha}
                onChange={manejarCambio}
              />
            </div>

            <div className="form-group">
              <label>Hora</label>

              <input
                name="hora"
                type="time"
                value={formulario.hora}
                onChange={manejarCambio}
              />
            </div>

            <div className="form-group">
              <label>Costo</label>

              <input
                name="costo"
                type="number"
                min="0"
                value={formulario.costo}
                onChange={manejarCambio}
              />
            </div>
          </div>

          <div className="activity-buttons">
            <button
              className="edit-button"
              onClick={guardarCambios}
            >
              Guardar
            </button>

            <button
              className="cancel-button"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="activity-card">
      <div className="activity-info">
        <h3>{actividad.nombre}</h3>

        <p>
          {actividad.fecha} · {actividad.hora}
        </p>

        <p className="activity-cost">
          {actividad.costo === 0
            ? 'Gratis'
            : formatoMoneda(actividad.costo)}
        </p>
      </div>

      <div className="activity-actions">
        <span className="activity-category">
          {actividad.categoria}
        </span>

        <div className="activity-buttons">
          <button
            className="edit-button"
            onClick={() => setEditando(true)}
          >
            Editar
          </button>

          <button
            className="delete-button"
            onClick={() => onEliminarActividad(actividad.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

export default ActivityCard;