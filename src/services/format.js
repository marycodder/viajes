export const money = (value) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const categories = [
  'Turismo',
  'Cultura',
  'Gastronomía',
  'Paseo',
  'Entretenimiento',
  'Transporte',
  'Alojamiento',
  'Otros',
];
export const activityStatus = {
  planned: 'Planificada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};
export const reservationStatus = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};
export const reservationTypes = {
  accommodation: 'Alojamiento',
  transport: 'Transporte',
  activity: 'Actividad',
  other: 'Otro',
};
export const options = (mapping) =>
  Object.entries(mapping).map(([value, label]) => ({ value, label }));
