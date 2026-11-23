
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';

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

// FUNCIONES AUXILIARES
function obtenerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.items)) return respuesta.items;

  throw new Error('Formato de lista inesperado.');
}

function dinero(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CL');
}

function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const d = new Date(`${fecha}T12:00:00Z`);

  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === fecha
  );
}

export default function App() {
  // AUTENTICACIÓN
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [sesion, setSesion] = useState(null);

  // NAVEGACIÓN
  const [pantalla, setPantalla] = useState('viajes');

  // VIAJES Y DESTINOS
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

  // ESTADOS DE INTERFAZ
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const propietario =
    viajeSeleccionado?.ownerId === sesion?.user?.id;

  // INICIAR SESIÓN
  async function ingresar() {
    if (!correo.trim() || !contrasena) {
      setError('Completa el correo y la contraseña.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const datos = await iniciarSesion(
        correo.trim().toLowerCase(),
        contrasena
      );

      if (!datos?.accessToken) {
        throw new Error('No se recibió un token.');
      }

      const respuesta = await obtenerViajes(datos.accessToken);

      setViajes(obtenerLista(respuesta));
      setSesion(datos);
      setContrasena('');
      setPantalla('viajes');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // CONSULTAR VIAJES
  async function cargarViajes() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerViajes(sesion.accessToken);
      setViajes(obtenerLista(respuesta));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // ABRIR VIAJE
  async function abrirViaje(viaje) {
    setCargando(true);
    setError('');
    setMensaje('');

    try {
      const respuesta = await obtenerDestinos(
        sesion.accessToken,
        viaje.id
      );

      setDestinos(obtenerLista(respuesta));
      setViajeSeleccionado(viaje);
      setPantalla('detalle');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // CONSULTAR ITINERARIO
  async function abrirItinerario() {
    setCargando(true);
    setError('');
    setMensaje('');

    try {
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
      setPantalla('itinerario');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // ACTUALIZAR ITINERARIO
  async function actualizarItinerario() {
    setCargando(true);
    setError('');

    try {
      const [respuestaDias, respuestaActividades] =
        await Promise.all([
          obtenerDias(sesion.accessToken, viajeSeleccionado.id),
          obtenerActividades(sesion.accessToken, viajeSeleccionado.id),
        ]);

      setDias(obtenerLista(respuestaDias));
      setActividades(obtenerLista(respuestaActividades));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // MARCAR ACTIVIDAD REALIZADA
  async function marcarRealizada(actividadId) {
    setCargando(true);
    setError('');
    setMensaje('');

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
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // CONSULTAR PRESUPUESTO
  async function abrirPresupuesto() {
    setCargando(true);
    setError('');
    setMensaje('');

    try {
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
      setPantalla('presupuesto');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // ACTUALIZAR PRESUPUESTO
  async function actualizarPresupuesto() {
    setCargando(true);
    setError('');

    try {
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
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // REGISTRAR UN GASTO REAL
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
      !Number.isSafeInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > 1000000000000
    ) {
      setError('El monto debe ser un número entero válido y mayor que cero.');
      return;
    }

    setCargando(true);
    setError('');
    setMensaje('');

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

      setDescripcion('');
      setCategoria('Otros');
      setFecha('');
      setMonto('');

      setMensaje('Gasto registrado correctamente.');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // NAVEGACIÓN
  function volverAlViaje() {
    setPantalla('detalle');
    setError('');
    setMensaje('');
  }

  function volverAViajes() {
    setPantalla('viajes');
    setViajeSeleccionado(null);
    setDestinos([]);
    setDias([]);
    setActividades([]);
    setResumen(null);
    setGastos([]);
    setError('');
    setMensaje('');
  }

  function salir() {
    setSesion(null);
    setViajes([]);
    setCorreo('');
    setContrasena('');
    volverAViajes();
  }

  // COMPONENTES DE ESTADO
  function estados() {
    return (
      <>
        {cargando && (
          <ActivityIndicator
            size="large"
            color="#2563eb"
            style={estilos.cargando}
          />
        )}

        {error ? (
          <Text style={estilos.error}>{error}</Text>
        ) : null}

        {mensaje ? (
          <Text style={estilos.exito}>{mensaje}</Text>
        ) : null}
      </>
    );
  }

  // PANTALLA: INICIO DE SESIÓN
  if (!sesion) {
    return (
      <View style={estilos.acceso}>
        <Text style={estilos.titulo}>TripPlan</Text>

        <Text style={estilos.descripcion}>
          Inicia sesión para organizar tus viajes
        </Text>

        <TextInput
          style={estilos.campo}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />

        <TextInput
          style={estilos.campo}
          placeholder="Contraseña"
          secureTextEntry
          value={contrasena}
          onChangeText={setContrasena}
        />

        {estados()}

        <Button
          title="Ingresar"
          onPress={ingresar}
          disabled={cargando}
        />
      </View>
    );
  }

  // PANTALLA: MIS VIAJES
  if (pantalla === 'viajes') {
    return (
      <ScrollView
        style={estilos.pantalla}
        contentContainerStyle={estilos.contenido}
      >
        <Text style={estilos.titulo}>TripPlan</Text>

        <Text style={estilos.bienvenida}>
          Bienvenido, {sesion.user?.name || 'viajero'}
        </Text>

        <Text style={estilos.seccion}>Mis viajes</Text>

        <Button
          title="Actualizar viajes"
          onPress={cargarViajes}
          disabled={cargando}
        />

        {estados()}

        {!cargando && viajes.length === 0 && !error && (
          <Text style={estilos.vacio}>
            No tienes viajes registrados.
          </Text>
        )}

        {viajes.map((viaje) => (
          <View key={viaje.id} style={estilos.tarjeta}>
            <Text style={estilos.nombre}>
              {viaje.name}
            </Text>

            <Text>Inicio: {viaje.startDate}</Text>
            <Text>Término: {viaje.endDate}</Text>

            <Text style={estilos.destacado}>
              Presupuesto: {dinero(viaje.budget)}
            </Text>

            <View style={estilos.espacio}>
              <Button
                title="Abrir viaje"
                onPress={() => abrirViaje(viaje)}
                disabled={cargando}
              />
            </View>
          </View>
        ))}

        <View style={estilos.separacion}>
          <Button
            title="Cerrar sesión"
            color="#dc2626"
            onPress={salir}
          />
        </View>
      </ScrollView>
    );
  }

  // PANTALLA: DETALLE DEL VIAJE
  if (pantalla === 'detalle' && viajeSeleccionado) {
    return (
      <ScrollView
        style={estilos.pantalla}
        contentContainerStyle={estilos.contenido}
      >
        <Text style={estilos.titulo}>
          {viajeSeleccionado.name}
        </Text>

        <Text>
          {viajeSeleccionado.startDate} al{' '}
          {viajeSeleccionado.endDate}
        </Text>

        <Text style={estilos.destacado}>
          Presupuesto: {dinero(viajeSeleccionado.budget)}
        </Text>

        <Text style={estilos.seccion}>
          Destinos del viaje
        </Text>

        {estados()}

        {destinos.length === 0 && !cargando && (
          <Text style={estilos.vacio}>
            Este viaje no tiene destinos asociados.
          </Text>
        )}

        {destinos.map((destino) => (
          <View key={destino.id} style={estilos.tarjeta}>
            <Text style={estilos.nombre}>
              {destino.name}
            </Text>

            <Text>
              {[destino.region, destino.country]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        ))}

        <View style={estilos.separacion}>
          <Button
            title="Ver itinerario"
            onPress={abrirItinerario}
            disabled={cargando}
          />
        </View>

        <View style={estilos.espacio}>
          <Button
            title="Ver presupuesto"
            onPress={abrirPresupuesto}
            disabled={cargando}
          />
        </View>

        <View style={estilos.separacion}>
          <Button
            title="Volver a mis viajes"
            onPress={volverAViajes}
          />
        </View>
      </ScrollView>
    );
  }

  // PANTALLA: ITINERARIO
  if (pantalla === 'itinerario' && viajeSeleccionado) {
    return (
      <ScrollView
        style={estilos.pantalla}
        contentContainerStyle={estilos.contenido}
      >
        <Text style={estilos.titulo}>Itinerario</Text>

        <Text style={estilos.bienvenida}>
          {viajeSeleccionado.name}
        </Text>

        <Button
          title="Actualizar itinerario"
          onPress={actualizarItinerario}
          disabled={cargando}
        />

        {estados()}

        {dias.length === 0 && !cargando && (
          <Text style={estilos.vacio}>
            Este viaje no tiene días planificados.
          </Text>
        )}

        {dias.map((dia) => {
          const actividadesDia = actividades.filter(
            (actividad) => actividad.dayId === dia.id
          );

          const destino = destinos.find(
            (item) => item.id === dia.destinationId
          );

          return (
            <View key={dia.id} style={estilos.tarjeta}>
              <Text style={estilos.nombre}>
                {dia.date}
              </Text>

              {destino ? (
                <Text>Destino: {destino.name}</Text>
              ) : null}

              {dia.title ? <Text>{dia.title}</Text> : null}

              {actividadesDia.length === 0 && (
                <Text>Sin actividades.</Text>
              )}

              {actividadesDia.map((actividad) => (
                <View
                  key={actividad.id}
                  style={estilos.actividad}
                >
                  <Text style={estilos.nombre}>
                    {actividad.name}
                  </Text>

                  <Text>
                    Hora: {actividad.time?.slice(0, 5) || 'Sin hora'}
                  </Text>

                  <Text>
                    Categoría: {actividad.category}
                  </Text>

                  <Text>
                    Costo estimado: {dinero(
                      actividad.estimatedCost
                    )}
                  </Text>

                  <Text>
                    Estado: {
                      actividad.status === 'completed'
                        ? 'Realizada'
                        : actividad.status === 'cancelled'
                          ? 'Cancelada'
                          : 'Planificada'
                    }
                  </Text>

                  {propietario &&
                    actividad.status === 'planned' && (
                      <View style={estilos.espacio}>
                        <Button
                          title="Marcar como realizada"
                          onPress={() =>
                            marcarRealizada(actividad.id)
                          }
                          disabled={cargando}
                        />
                      </View>
                    )}
                </View>
              ))}
            </View>
          );
        })}

        <View style={estilos.separacion}>
          <Button
            title="Volver al viaje"
            onPress={volverAlViaje}
          />
        </View>
      </ScrollView>
    );
  }

  // PANTALLA: PRESUPUESTO
  if (pantalla === 'presupuesto' && viajeSeleccionado) {
    return (
      <ScrollView
        style={estilos.pantalla}
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={estilos.titulo}>Presupuesto</Text>

        <Text style={estilos.bienvenida}>
          {viajeSeleccionado.name}
        </Text>

        <Button
          title="Actualizar presupuesto"
          onPress={actualizarPresupuesto}
          disabled={cargando}
        />

        {estados()}

        {resumen && (
          <View style={estilos.tarjeta}>
            <Text style={estilos.nombre}>
              Resumen financiero
            </Text>

            <Text>
              Presupuesto: {dinero(resumen.budget)}
            </Text>

            <Text>
              Gastado realmente: {dinero(resumen.spent)}
            </Text>

            <Text style={estilos.destacado}>
              Disponible: {dinero(resumen.remaining)}
            </Text>

            <Text>
              Estimado de actividades: {dinero(
                resumen.estimatedActivitiesCost
              )}
            </Text>

            {resumen.overBudget && (
              <Text style={estilos.error}>
                Los gastos superan el presupuesto.
              </Text>
            )}
          </View>
        )}

        {propietario && (
          <View style={estilos.tarjeta}>
            <Text style={estilos.seccion}>
              Registrar gasto
            </Text>

            <Text style={estilos.etiqueta}>Descripción</Text>
            <TextInput
              style={estilos.campo}
              placeholder="Ej: Almuerzo en Puerto Natales"
              value={descripcion}
              onChangeText={setDescripcion}
              maxLength={150}
            />

            <Text style={estilos.etiqueta}>Categoría</Text>
            <TextInput
              style={estilos.campo}
              placeholder="Ej: Alimentación"
              value={categoria}
              onChangeText={setCategoria}
              maxLength={60}
            />

            <Text style={estilos.etiqueta}>
              Fecha del pago
            </Text>
            <TextInput
              style={estilos.campo}
              placeholder="AAAA-MM-DD"
              value={fecha}
              onChangeText={setFecha}
              maxLength={10}
            />

            <Text style={estilos.etiqueta}>
              Monto pagado (CLP)
            </Text>
            <TextInput
              style={estilos.campo}
              placeholder="Ej: 25000"
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
            />

            <Button
              title={cargando ? 'Guardando...' : 'Guardar gasto'}
              onPress={guardarGasto}
              disabled={cargando}
            />
          </View>
        )}

        <Text style={estilos.seccion}>
          Gastos registrados
        </Text>

        {gastos.length === 0 && !cargando && (
          <Text style={estilos.vacio}>
            Todavía no hay gastos registrados.
          </Text>
        )}

        {gastos.map((gasto) => (
          <View key={gasto.id} style={estilos.tarjeta}>
            <Text style={estilos.nombre}>
              {gasto.description}
            </Text>

            <Text>
              {gasto.category} · {gasto.date}
            </Text>

            <Text style={estilos.destacado}>
              {dinero(gasto.amount)}
            </Text>
          </View>
        ))}

        <View style={estilos.separacion}>
          <Button
            title="Volver al viaje"
            onPress={volverAlViaje}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={estilos.acceso}>
      <Text>No se encontró la pantalla.</Text>
      <Button title="Volver" onPress={volverAViajes} />
    </View>
  );
}

// ESTILOS
const estilos = StyleSheet.create({
  acceso: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#f5f7fb',
  },
  pantalla: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  contenido: {
    padding: 24,
    paddingTop: 65,
    paddingBottom: 45,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 16,
  },
  descripcion: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  bienvenida: {
    fontSize: 16,
    textAlign: 'center',
    color: '#475569',
    marginBottom: 25,
  },
  seccion: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#172a45',
    marginTop: 20,
    marginBottom: 14,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 10,
  },
  campo: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    marginBottom: 10,
    fontSize: 16,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actividad: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  nombre: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172a45',
    marginBottom: 8,
  },
  destacado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 10,
  },
  error: {
    color: '#dc2626',
    marginVertical: 12,
  },
  exito: {
    color: '#15803d',
    marginVertical: 12,
  },
  vacio: {
    color: '#64748b',
    marginTop: 18,
  },
  cargando: {
    marginTop: 20,
  },
  actividadBoton: {
    marginTop: 12,
  },
  espacio: {
    marginTop: 12,
  },
  separacion: {
    marginTop: 30,
  },
});
