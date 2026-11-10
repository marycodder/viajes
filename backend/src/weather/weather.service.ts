import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Destination, TripDestination } from '../database/entities';
import { TripAccessService } from '../trips/trip-access.service';

type DailyWeather = { time: string[]; weather_code: (number | null)[]; temperature_2m_max: (number | null)[]; temperature_2m_min: (number | null)[]; precipitation_probability_max: (number | null)[] };
type ForecastResult = { available: boolean; source: string; reason?: string; attribution?: string; timezone?: string;
  daily: { date: string; weatherCode: number | null; maxTemperature: number | null; minTemperature: number | null; precipitationProbability: number | null }[] };

@Injectable()
export class WeatherService {
  private readonly cache = new Map<string, { expires: number; result: ForecastResult }>();
  constructor(private readonly db: DataSource, private readonly access: TripAccessService) {}
  async forecast(tripId: string, userId: string, destinationId: string): Promise<ForecastResult> {
    const trip = await this.access.read(tripId, userId);
    if (!await this.db.manager.existsBy(TripDestination, { tripId, destinationId })) throw new BadRequestException('El destino no pertenece a este viaje.');
    const destination = await this.db.manager.findOneByOrFail(Destination, { id: destinationId });
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const horizonDate = new Date(`${today}T12:00:00Z`);
    horizonDate.setUTCDate(horizonDate.getUTCDate() + 15);
    const horizon = horizonDate.toISOString().slice(0, 10);
    const start = trip.startDate > today ? trip.startDate : today;
    const end = trip.endDate < horizon ? trip.endDate : horizon;
    if (start > end) return { available: false, reason: 'El viaje está fuera del horizonte de pronóstico de 16 días.', daily: [], source: 'Open-Meteo' };
    const key = `${destination.latitude}:${destination.longitude}:${start}:${end}`;
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.result;
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({ latitude: String(destination.latitude), longitude: String(destination.longitude),
      start_date: start, end_date: end, timezone: 'auto',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' }).toString();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Upstream unavailable');
      const data = await response.json() as { daily?: DailyWeather; timezone?: string };
      const daily = data.daily;
      if (!daily || !['time', 'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max']
        .every(field => Array.isArray(daily[field as keyof DailyWeather]) && daily[field as keyof DailyWeather].length === daily.time?.length)) {
        throw new Error('Invalid upstream response');
      }
      const result: ForecastResult = { available: true, source: 'Open-Meteo', attribution: 'Weather data by Open-Meteo.com', timezone: data.timezone,
        daily: daily.time.map((date, i) => ({ date, weatherCode: daily.weather_code[i], maxTemperature: daily.temperature_2m_max[i],
          minTemperature: daily.temperature_2m_min[i], precipitationProbability: daily.precipitation_probability_max[i] })) };
      if (this.cache.size >= 200) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(key, { result, expires: Date.now() + 600000 });
      return result;
    } catch {
      throw new ServiceUnavailableException('No fue posible obtener el clima de Open-Meteo. Intenta nuevamente más tarde.');
    }
  }
}
