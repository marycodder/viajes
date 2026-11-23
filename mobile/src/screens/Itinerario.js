
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

export default function Itinerario({
  viaje,
  destinos,
  dias,
  actividades,
  propietario,
  actualizarItinerario,
  marcarRealizada,
  volverAlViaje,
  cargando,
  error,
  mensaje,
}) {
  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
    >
      <Text style={estilos.titulo}>Itinerario</Text>

      <Text style={estilos.bienvenida}>
        {viaje.name}
      </Text>

      <Button
        title="Actualizar itinerario"
        onPress={actualizarItinerario}
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

      {mensaje ? (
        <Text style={estilos.exito}>{mensaje}</Text>
      ) : null}

      {!cargando && dias.length === 0 && (
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
              <Text style={estilos.detalle}>
                Destino: {destino.name}
              </Text>
            ) : null}

            {dia.title ? (
              <Text style={estilos.detalle}>
                {dia.title}
              </Text>
            ) : null}

            {actividadesDia.length === 0 && (
              <Text style={estilos.vacio}>
                Sin actividades planificadas.
              </Text>
            )}

            {actividadesDia.map((actividad) => (
              <View
                key={actividad.id}
                style={estilos.actividad}
              >
                <Text style={estilos.nombre}>
                  {actividad.name}
                </Text>

                <Text style={estilos.detalle}>
                  Hora: {actividad.time?.slice(0, 5) || 'Sin hora'}
                </Text>

                <Text style={estilos.detalle}>
                  Categoría: {actividad.category}
                </Text>

                <Text style={estilos.detalle}>
                  Costo estimado: {formatoDinero(
                    actividad.estimatedCost
                  )}
                </Text>

                <Text style={estilos.detalle}>
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
          disabled={cargando}
        />
      </View>
    </ScrollView>
  );
}
