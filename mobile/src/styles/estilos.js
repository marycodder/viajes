
import { StyleSheet } from 'react-native';

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
    color: '#334155',
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
  detalle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
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
  espacio: {
    marginTop: 12,
  },
  separacion: {
    marginTop: 30,
  },
});

export default estilos;
