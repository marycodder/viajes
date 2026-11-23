
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import estilos from '../styles/estilos';
import { formatoDinero } from '../components/TarjetaViaje';

export default function Presupuesto({
  viaje,
  resumen,
  gastos,
  propietario,
  descripcion,
  setDescripcion,
  categoria,
  setCategoria,
  fecha,
  setFecha,
  monto,
  setMonto,
  guardarGasto,
  actualizarPresupuesto,
  volverAlViaje,
  cargando,
  error,
  mensaje,
}) {
  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={estilos.titulo}>Presupuesto</Text>

      <Text style={estilos.bienvenida}>
        {viaje.name}
      </Text>

      <Button
        title="Actualizar presupuesto"
        onPress={actualizarPresupuesto}
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

      {resumen && (
        <View style={estilos.tarjeta}>
          <Text style={estilos.nombre}>
            Resumen financiero
          </Text>

          <Text style={estilos.detalle}>
            Presupuesto: {formatoDinero(resumen.budget)}
          </Text>

          <Text style={estilos.detalle}>
            Gastado realmente: {formatoDinero(resumen.spent)}
          </Text>

          <Text style={estilos.destacado}>
            Disponible: {formatoDinero(resumen.remaining)}
          </Text>

          <Text style={estilos.detalle}>
            Estimado de actividades: {formatoDinero(
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

          <Text style={estilos.etiqueta}>
            Descripción
          </Text>
          <TextInput
            style={estilos.campo}
            placeholder="Ej: Almuerzo en Puerto Natales"
            value={descripcion}
            onChangeText={setDescripcion}
            maxLength={150}
          />

          <Text style={estilos.etiqueta}>
            Categoría
          </Text>
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

          <Text style={estilos.detalle}>
            {gasto.category} · {gasto.date}
          </Text>

          <Text style={estilos.destacado}>
            {formatoDinero(gasto.amount)}
          </Text>
        </View>
      ))}

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
