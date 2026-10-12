export async function obtenerClima(
  latitud,
  longitud,
  fechaInicio,
  fechaFin
) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitud}` +
    `&longitude=${longitud}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=auto` +
    `&start_date=${fechaInicio}` +
    `&end_date=${fechaFin}`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener el clima');
  }

  const datos = await respuesta.json();

  return datos;
}