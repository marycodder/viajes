import { Module } from '@nestjs/common';
import { TripsModule } from '../trips/trips.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
@Module({ imports: [TripsModule], controllers: [WeatherController], providers: [WeatherService] })
export class WeatherModule {}
