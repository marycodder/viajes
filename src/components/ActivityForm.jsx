import EntityForm from './EntityForm';
import { activityStatus, categories, options } from '../services/format';

export default function ActivityForm({ days, activity, onSave, onCancel }) {
  const fields = [
    { name: 'name', label: 'Nombre de la actividad', required: true },
    {
      name: 'dayId',
      label: 'Día del itinerario',
      required: true,
      options: [
        { value: '', label: 'Selecciona un día' },
        ...days.map((day) => ({
          value: day.id,
          label: `${day.date}${day.title ? ` · ${day.title}` : ''}`,
        })),
      ],
    },
    { name: 'time', label: 'Hora', type: 'time', required: true },
    {
      name: 'category',
      label: 'Categoría',
      required: true,
      options: categories.map((value) => ({ value, label: value })),
      defaultValue: categories[0],
    },
    {
      name: 'estimatedCost',
      label: 'Costo estimado (CLP)',
      type: 'number',
      min: 0,
      max: 1000000000000,
      defaultValue: 0,
      required: true,
    },
    {
      name: 'status',
      label: 'Estado de la actividad',
      options: options(activityStatus),
      defaultValue: 'planned',
      required: true,
    },
    { name: 'description', label: 'Descripción', type: 'textarea' },
  ];
  return (
    <EntityForm
      title={activity ? 'Editar actividad' : 'Agregar actividad'}
      fields={fields}
      initial={activity ? { ...activity, time: activity.time.slice(0, 5) } : {}}
      submitLabel={activity ? 'Guardar actividad' : 'Agregar actividad'}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
