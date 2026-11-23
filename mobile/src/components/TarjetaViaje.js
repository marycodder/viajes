
import React from 'react';
import { View, Text, Button } from 'react-native';
import estilos from '../styles/estilos';

export function formatoDinero(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CL');
}

export default function TarjetaViaje({
  viaje,
  abrirViaje,
  cargando,
}) {
  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.nombre}>
        {viaje.name}
      </Text>

      <Text style={estilos.detalle}>
        Inicio: {viaje.startDate}
      </Text>

      <Text style={estilos.detalle}>
        Término: {viaje.endDate}
      </Text>

      <Text style={estilos.destacado}>
        Presupuesto: {formatoDinero(viaje.budget)}
      </Text>

      <View style={estilos.espacio}>
        <Button
          title="Abrir viaje"
          onPress={() => abrirViaje(viaje)}
          disabled={cargando}
        />
      </View>
    </View>
  );
}
