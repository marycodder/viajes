import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CurrentUser } from '../auth/auth.guard';
import { Id } from '../common/id.decorator';
import { WeatherService } from './weather.service';

export class WeatherQuery { @ApiProperty({ description: 'Destino previamente asociado al viaje' }) @IsUUID('4') destinationId: string; }

@ApiTags('Clima / API pública') @ApiBearerAuth() @Controller('trips/:tripId/weather')
export class WeatherController {
  constructor(private readonly weather: WeatherService) {}
  @Get() @ApiOperation({ summary: 'Consultar Open-Meteo desde el backend, con caché, timeout y horizonte válido' })
  forecast(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() query: WeatherQuery) { return this.weather.forecast(trip, user, query.destinationId); }
}
