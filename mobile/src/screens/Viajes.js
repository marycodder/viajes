
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import TarjetaViaje from '../components/TarjetaViaje';
import estilos from '../styles/estilos';

export default function Viajes({
  sesion,
  viajes,
  cargarViajes,
  abrirViaje,
  salir,
  cargando,
  error,
}) {
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
          No tienes viajes registrados.
        </Text>
      )}

      {viajes.map((viaje) => (
        <TarjetaViaje
          key={viaje.id}
          viaje={viaje}
          abrirViaje={abrirViaje}
          cargando={cargando}
        />
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
