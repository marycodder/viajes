
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
} from './src/services/api';

export default function App() {
  // INICIO DE SESIÓN
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  // DATOS DEL USUARIO Y TOKEN
  const [sesion, setSesion] = useState(null);

  // VIAJES OBTENIDOS DESDE LA API
  const [viajes, setViajes] = useState([]);

  // ESTADOS DE LA INTERFAZ
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

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
        throw new Error('El servidor no entregó un token.');
      }

      setSesion(datos);

      await cargarViajes(datos.accessToken);
    } catch (e) {
      setError(e.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  // CONSULTAR VIAJES
  async function cargarViajes(token = sesion?.accessToken) {
    if (!token) {
      setError('No hay una sesión activa.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerViajes(token);

      const lista = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
          ? respuesta.data
          : Array.isArray(respuesta?.items)
            ? respuesta.items
            : null;

      if (!lista) {
        throw new Error(
          'El servidor devolvió un formato de viajes inesperado.'
        );
      }

      setViajes(lista);
    } catch (e) {
      setError(
        e.message || 'No se pudieron cargar los viajes.'
      );
    } finally {
      setCargando(false);
    }
  }

  // CERRAR SESIÓN
  function salir() {
    setSesion(null);
    setViajes([]);
    setContrasena('');
    setError('');
  }

  // PANTALLA DE INICIO DE SESIÓN
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

        {error ? (
          <Text style={estilos.error}>{error}</Text>
        ) : null}

        {cargando ? (
          <ActivityIndicator
            size="large"
            color="#2563eb"
          />
        ) : (
          <Button
            title="Ingresar"
            onPress={ingresar}
          />
        )}
      </View>
    );
  }

  // PANTALLA PRINCIPAL: MIS VIAJES
  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
    >
      <Text style={estilos.titulo}>TripPlan</Text>

      <Text style={estilos.bienvenida}>
        Bienvenido, {sesion.user?.name || 'viajero'}
      </Text>

      <Text style={estilos.seccion}>
        Mis viajes
      </Text>

      <Button
        title="Actualizar viajes"
        onPress={() => cargarViajes()}
        disabled={cargando}
      />

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

      {!cargando && viajes.length === 0 && !error && (
        <Text style={estilos.vacio}>
          Todavía no tienes viajes registrados.
        </Text>
      )}

      {viajes.map((viaje) => (
        <View
          key={viaje.id}
          style={estilos.tarjeta}
        >
          <Text style={estilos.nombreViaje}>
            {viaje.name}
          </Text>

          <Text style={estilos.detalle}>
            Inicio: {viaje.startDate}
          </Text>

          <Text style={estilos.detalle}>
            Término: {viaje.endDate}
          </Text>

          <Text style={estilos.presupuesto}>
            Presupuesto: $
            {Number(viaje.budget || 0).toLocaleString('es-CL')}
          </Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#334155',
  },
  bienvenida: {
    fontSize: 16,
    textAlign: 'center',
    color: '#475569',
    marginBottom: 28,
  },
  seccion: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#172a45',
    marginBottom: 16,
  },
  campo: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nombreViaje: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#172a45',
    marginBottom: 10,
  },
  detalle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 5,
  },
  presupuesto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 8,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginVertical: 14,
  },
  vacio: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 30,
  },
  cargando: {
    marginTop: 25,
  },
  separacion: {
    marginTop: 35,
  },
});
