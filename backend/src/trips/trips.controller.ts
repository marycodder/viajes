import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/auth.guard';
import { Id } from '../common/id.decorator';
import { PageQuery } from '../common/validation';
import { AddDestinationDto, AddTravelerDto, CreateTripDto, UpdateTripDto } from './trips.dto';
import { TripsService } from './trips.service';

@ApiTags('Viajes y viajeros') @ApiBearerAuth() @Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}
  @Get() @ApiOperation({ summary: 'Listar mis viajes propios o compartidos' })
  list(@CurrentUser() user: string, @Query() page: PageQuery) { return this.trips.list(user, page); }
  @Post() @ApiOperation({ summary: 'Crear un viaje en CLP' })
  create(@CurrentUser() user: string, @Body() dto: CreateTripDto) { return this.trips.create(user, dto); }
  @Get(':tripId') @ApiOperation({ summary: 'Consultar un viaje al que pertenezco' })
  get(@Id('tripId') trip: string, @CurrentUser() user: string) { return this.trips.get(trip, user); }
  @Patch(':tripId') @ApiOperation({ summary: 'Modificar un viaje propio' })
  update(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: UpdateTripDto) { return this.trips.update(trip, user, dto); }
  @Delete(':tripId') @ApiOperation({ summary: 'Eliminar un viaje propio y sus registros SQL' })
  remove(@Id('tripId') trip: string, @CurrentUser() user: string) { return this.trips.remove(trip, user); }
  @Get(':tripId/summary') @ApiOperation({ summary: 'Consultar indicadores y presupuesto real, sin confundirlo con costos estimados' })
  summary(@Id('tripId') trip: string, @CurrentUser() user: string) { return this.trips.summary(trip, user); }
  @Get(':tripId/travelers') @ApiOperation({ summary: 'Listar viajeros y propietario' })
  travelers(@Id('tripId') trip: string, @CurrentUser() user: string) { return this.trips.travelers(trip, user); }
  @Post(':tripId/travelers') @ApiOperation({ summary: 'Agregar un usuario registrado como viajero con acceso de lectura' })
  addTraveler(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: AddTravelerDto) { return this.trips.addTraveler(trip, user, dto); }
  @Delete(':tripId/travelers/:id') @ApiOperation({ summary: 'Quitar un viajero; el propietario permanece' })
  removeTraveler(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.trips.removeTraveler(trip, user, id); }
  @Get(':tripId/destinations') @ApiOperation({ summary: 'Listar destinos del viaje' })
  destinations(@Id('tripId') trip: string, @CurrentUser() user: string) { return this.trips.destinations(trip, user); }
  @Post(':tripId/destinations') @ApiOperation({ summary: 'Asociar un destino existente al viaje' })
  addDestination(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: AddDestinationDto) { return this.trips.addDestination(trip, user, dto.destinationId); }
  @Delete(':tripId/destinations/:id') @ApiOperation({ summary: 'Desasociar un destino que no esté en uso' })
  removeDestination(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.trips.removeDestination(trip, user, id); }
}
