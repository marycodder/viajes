
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import estilos from '../styles/estilos';
import { formatoDinero } from '../components/TarjetaViaje';

export default function DetalleViaje({
  viaje,
  destinos,
  abrirItinerario,
  abrirPresupuesto,
  volverAViajes,
  cargando,
  error,
}) {
  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
    >
      <Text style={estilos.titulo}>
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

      <Text style={estilos.seccion}>
        Destinos del viaje
      </Text>

      {cargando && (
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />
      )}

      {error ? (
        <Text style={estilos.error}>{error}</Text>
      ) : null}

      {!cargando && destinos.length === 0 && (
        <Text style={estilos.vacio}>
          Este viaje no tiene destinos asociados.
        </Text>
      )}

      {destinos.map((destino) => (
        <View
          key={destino.id}
          style={estilos.tarjeta}
        >
          <Text style={estilos.nombre}>
            {destino.name}
          </Text>

          <Text style={estilos.detalle}>
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
          disabled={cargando}
        />
      </View>
    </ScrollView>
  );
}
