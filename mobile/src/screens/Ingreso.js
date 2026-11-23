
import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import estilos from '../styles/estilos';

export default function Ingreso({
  correo,
  setCorreo,
  contrasena,
  setContrasena,
  ingresar,
  cargando,
  error,
}) {
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

      {cargando && (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={estilos.cargando}
        />
      )}

      <Button
        title="Ingresar"
        onPress={ingresar}
        disabled={cargando}
      />
    </View>
  );
}
