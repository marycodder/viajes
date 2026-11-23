
import React, { useState } from 'react';

import Ingreso from './src/screens/Ingreso';
import Viajes from './src/screens/Viajes';
import DetalleViaje from './src/screens/DetalleViaje';
import Itinerario from './src/screens/Itinerario';
import Presupuesto from './src/screens/Presupuesto';

import {
  iniciarSesion,
  obtenerViajes,
  obtenerDestinos,
  obtenerDias,
  obtenerActividades,
  completarActividad,
  obtenerPresupuesto,
  obtenerGastos,
  registrarGasto,
} from './src/services/api';

// NORMALIZAR RESPUESTAS DE LA API
function obtenerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.items)) return respuesta.items;

  throw new Error('La API devolvió un formato de lista inesperado.');
}

// VALIDAR FECHA
function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const d = new Date(`${fecha}T12:00:00Z`);

  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === fecha
  );
}

export default function App() {
  // SESIÓN
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [sesion, setSesion] = useState(null);

  // NAVEGACIÓN
  const [pantalla, setPantalla] = useState('viajes');

  // VIAJES
  const [viajes, setViajes] = useState([]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [destinos, setDestinos] = useState([]);

  // ITINERARIO
  const [dias, setDias] = useState([]);
  const [actividades, setActividades] = useState([]);

  // PRESUPUESTO
  const [resumen, setResumen] = useState(null);
  const [gastos, setGastos] = useState([]);

  // FORMULARIO DE GASTOS
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Otros');
  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');

  // INTERFAZ
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const propietario =
    viajeSeleccionado?.ownerId === sesion?.user?.id;

  function limpiarMensajes() {
    setError('');
    setMensaje('');
  }

  // INICIAR SESIÓN
  async function ingresar() {
    if (!correo.trim() || !contrasena) {
      setError('Completa el correo y la contraseña.');
      return;
    }

    setCargando(true);
    limpiarMensajes();

    try {
      const datos = await iniciarSesion(
        correo.trim().toLowerCase(),
        contrasena
      );

      if (!datos?.accessToken) {
        throw new Error('El servidor no entregó un token.');
      }

      const respuesta = await obtenerViajes(datos.accessToken);

      setViajes(obtenerLista(respuesta));
      setSesion(datos);
      setContrasena('');
      setPantalla('viajes');
    } catch (e) {
      setError(e.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  // ACTUALIZAR VIAJES
  async function cargarViajes() {
    setCargando(true);
    limpiarMensajes();

    try {
      const respuesta = await obtenerViajes(sesion.accessToken);
      setViajes(obtenerLista(respuesta));
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los viajes.');
    } finally {
      setCargando(false);
    }
  }

  // ABRIR DETALLE DEL VIAJE
  async function abrirViaje(viaje) {
    setCargando(true);
    limpiarMensajes();

    try {
      const respuesta = await obtenerDestinos(
        sesion.accessToken,
        viaje.id
      );

      setDestinos(obtenerLista(respuesta));
      setViajeSeleccionado(viaje);
      setPantalla('detalle');
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los destinos.');
    } finally {
      setCargando(false);
    }
  }

  // OBTENER DATOS DEL ITINERARIO
  async function consultarItinerario() {
    const [respuestaDias, respuestaActividades] =
      await Promise.all([
        obtenerDias(
          sesion.accessToken,
          viajeSeleccionado.id
        ),
        obtenerActividades(
          sesion.accessToken,
          viajeSeleccionado.id
        ),
      ]);

    setDias(obtenerLista(respuestaDias));
    setActividades(obtenerLista(respuestaActividades));
  }

  // ABRIR ITINERARIO
  async function abrirItinerario() {
    setCargando(true);
    limpiarMensajes();

    try {
      await consultarItinerario();
      setPantalla('itinerario');
    } catch (e) {
      setError(e.message || 'No se pudo cargar el itinerario.');
    } finally {
      setCargando(false);
    }
  }

  // ACTUALIZAR ITINERARIO
  async function actualizarItinerario() {
    setCargando(true);
    limpiarMensajes();

    try {
      await consultarItinerario();
    } catch (e) {
      setError(e.message || 'No se pudo actualizar el itinerario.');
    } finally {
      setCargando(false);
    }
  }

  // MARCAR ACTIVIDAD COMO REALIZADA
  async function marcarRealizada(actividadId) {
    setCargando(true);
    limpiarMensajes();

    try {
      await completarActividad(
        sesion.accessToken,
        viajeSeleccionado.id,
        actividadId
      );

      const respuesta = await obtenerActividades(
        sesion.accessToken,
        viajeSeleccionado.id
      );

      setActividades(obtenerLista(respuesta));
      setMensaje('Actividad marcada como realizada.');
    } catch (e) {
      setError(e.message || 'No se pudo actualizar la actividad.');
    } finally {
      setCargando(false);
    }
  }

  // OBTENER PRESUPUESTO Y GASTOS
  async function consultarPresupuesto() {
    const [respuestaResumen, respuestaGastos] =
      await Promise.all([
        obtenerPresupuesto(
          sesion.accessToken,
          viajeSeleccionado.id
        ),
        obtenerGastos(
          sesion.accessToken,
          viajeSeleccionado.id
        ),
      ]);

    setResumen(respuestaResumen);
    setGastos(obtenerLista(respuestaGastos));
  }

  // ABRIR PRESUPUESTO
  async function abrirPresupuesto() {
    setCargando(true);
    limpiarMensajes();

    try {
      await consultarPresupuesto();
      setPantalla('presupuesto');
    } catch (e) {
      setError(e.message || 'No se pudo cargar el presupuesto.');
    } finally {
      setCargando(false);
    }
  }

  // ACTUALIZAR PRESUPUESTO
  async function actualizarPresupuesto() {
    setCargando(true);
    limpiarMensajes();

    try {
      await consultarPresupuesto();
    } catch (e) {
      setError(e.message || 'No se pudo actualizar el presupuesto.');
    } finally {
      setCargando(false);
    }
  }

  // GUARDAR NUEVO GASTO
  async function guardarGasto() {
    if (!propietario) {
      setError('No tienes permiso para registrar gastos.');
      return;
    }

    if (!descripcion.trim() || !categoria.trim()) {
      setError('Completa la descripción y la categoría.');
      return;
    }

    if (!fechaValida(fecha)) {
      setError('Ingresa una fecha válida en formato AAAA-MM-DD.');
      return;
    }

    const cantidad = Number(monto);

    if (
      !monto.trim() ||
      !Number.isSafeInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > 1000000000000
    ) {
      setError('El monto debe ser un entero mayor que cero.');
      return;
    }

    setCargando(true);
    limpiarMensajes();

    try {
      await registrarGasto(
        sesion.accessToken,
        viajeSeleccionado.id,
        {
          description: descripcion.trim(),
          category: categoria.trim(),
          date: fecha,
          amount: cantidad,
        }
      );

      await consultarPresupuesto();

      setDescripcion('');
      setCategoria('Otros');
      setFecha('');
      setMonto('');

      setMensaje('Gasto registrado correctamente.');
    } catch (e) {
      setError(e.message || 'No se pudo registrar el gasto.');
    } finally {
      setCargando(false);
    }
  }

  // NAVEGACIÓN
  function volverAlViaje() {
    setPantalla('detalle');
    limpiarMensajes();
  }

  function volverAViajes() {
    setPantalla('viajes');
    setViajeSeleccionado(null);
    setDestinos([]);
    setDias([]);
    setActividades([]);
    setResumen(null);
    setGastos([]);
    limpiarMensajes();
  }

  function salir() {
    setSesion(null);
    setViajes([]);
    setCorreo('');
    setContrasena('');
    volverAViajes();
  }

  // PANTALLA DE INGRESO
  if (!sesion) {
    return (
      <Ingreso
        correo={correo}
        setCorreo={setCorreo}
        contrasena={contrasena}
        setContrasena={setContrasena}
        ingresar={ingresar}
        cargando={cargando}
        error={error}
      />
    );
  }

  // PANTALLA DE VIAJES
  if (pantalla === 'viajes') {
    return (
      <Viajes
        sesion={sesion}
        viajes={viajes}
        cargarViajes={cargarViajes}
        abrirViaje={abrirViaje}
        salir={salir}
        cargando={cargando}
        error={error}
      />
    );
  }

  // DETALLE DEL VIAJE
  if (pantalla === 'detalle' && viajeSeleccionado) {
    return (
      <DetalleViaje
        viaje={viajeSeleccionado}
        destinos={destinos}
        abrirItinerario={abrirItinerario}
        abrirPresupuesto={abrirPresupuesto}
        volverAViajes={volverAViajes}
        cargando={cargando}
        error={error}
      />
    );
  }

  // ITINERARIO
  if (pantalla === 'itinerario' && viajeSeleccionado) {
    return (
      <Itinerario
        viaje={viajeSeleccionado}
        destinos={destinos}
        dias={dias}
        actividades={actividades}
        propietario={propietario}
        actualizarItinerario={actualizarItinerario}
        marcarRealizada={marcarRealizada}
        volverAlViaje={volverAlViaje}
        cargando={cargando}
        error={error}
        mensaje={mensaje}
      />
    );
  }

  // PRESUPUESTO
  if (pantalla === 'presupuesto' && viajeSeleccionado) {
    return (
      <Presupuesto
        viaje={viajeSeleccionado}
        resumen={resumen}
        gastos={gastos}
        propietario={propietario}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        categoria={categoria}
        setCategoria={setCategoria}
        fecha={fecha}
        setFecha={setFecha}
        monto={monto}
        setMonto={setMonto}
        guardarGasto={guardarGasto}
        actualizarPresupuesto={actualizarPresupuesto}
        volverAlViaje={volverAlViaje}
        cargando={cargando}
        error={error}
        mensaje={mensaje}
      />
    );
  }

  // PANTALLA DE RESPALDO
  return <Viajes
    sesion={sesion}
    viajes={viajes}
    cargarViajes={cargarViajes}
    abrirViaje={abrirViaje}
    salir={salir}
    cargando={cargando}
    error={error}
  />;
}
