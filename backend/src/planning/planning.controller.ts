import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/auth.guard';
import { Id } from '../common/id.decorator';
import { PageQuery } from '../common/validation';
import { ActivityQuery, CreateActivityDto, CreateDayDto, CreateExpenseDto, CreateReservationDto, UpdateActivityDto, UpdateDayDto, UpdateExpenseDto, UpdateReservationDto } from './planning.dto';
import { PlanningService } from './planning.service';

@ApiTags('Itinerarios, actividades, favoritos, gastos y reservas') @ApiBearerAuth() @Controller('trips/:tripId')
export class PlanningController {
  constructor(private readonly planning: PlanningService) {}
  @Get('days') @ApiOperation({ summary: 'Consultar itinerario por días' })
  days(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() page: PageQuery) { return this.planning.days(trip, user, page); }
  @Post('days') @ApiOperation({ summary: 'Crear un día dentro del período del viaje' })
  createDay(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: CreateDayDto) { return this.planning.createDay(trip, user, dto); }
  @Patch('days/:id') @ApiOperation({ summary: 'Modificar fecha, destino o título de un día' })
  updateDay(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string, @Body() dto: UpdateDayDto) { return this.planning.updateDay(trip, user, id, dto); }
  @Delete('days/:id') @ApiOperation({ summary: 'Eliminar un día vacío' })
  removeDay(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.planning.removeDay(trip, user, id); }
  @Get('activities') @ApiOperation({ summary: 'Listar actividades por fecha/hora con filtros y favoritos personales' })
  activities(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() query: ActivityQuery) { return this.planning.activities(trip, user, query); }
  @Get('activities/:id') @ApiOperation({ summary: 'Consultar una actividad del viaje' })
  activity(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.planning.getActivity(trip, user, id); }
  @Post('activities') @ApiOperation({ summary: 'Crear una actividad con costo estimado' })
  createActivity(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: CreateActivityDto) { return this.planning.createActivity(trip, user, dto); }
  @Patch('activities/:id') @ApiOperation({ summary: 'Modificar o marcar actividad como completada/cancelada' })
  updateActivity(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string, @Body() dto: UpdateActivityDto) { return this.planning.updateActivity(trip, user, id, dto); }
  @Delete('activities/:id') @ApiOperation({ summary: 'Eliminar una actividad sin gastos ni reservas vinculadas' })
  removeActivity(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.planning.removeActivity(trip, user, id); }
  @Get('favorites') @ApiOperation({ summary: 'Listar mis actividades favoritas de este viaje' })
  favorites(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() query: ActivityQuery) { return this.planning.activities(trip, user, query, true); }
  @Put('activities/:id/favorite') @HttpCode(200) @ApiOperation({ summary: 'Marcar favorito personal de forma idempotente' })
  favorite(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.planning.favorite(trip, user, id, true); }
  @Delete('activities/:id/favorite') @ApiOperation({ summary: 'Desmarcar favorito personal' })
  unfavorite(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.planning.favorite(trip, user, id, false); }
  @Get('expenses') @ApiOperation({ summary: 'Listar gastos efectivamente pagados' })
  expenses(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() page: PageQuery) { return this.planning.expenses(trip, user, page); }
  @Post('expenses') @ApiOperation({ summary: 'Registrar gasto real, incluso un pago anterior al viaje' })
  createExpense(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: CreateExpenseDto) { return this.planning.createExpense(trip, user, dto); }
  @Patch('expenses/:id') @ApiOperation({ summary: 'Modificar un gasto real' })
  updateExpense(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string, @Body() dto: UpdateExpenseDto) { return this.planning.updateExpense(trip, user, id, dto); }
  @Delete('expenses/:id') @ApiOperation({ summary: 'Eliminar un gasto' })
  removeExpense(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.planning.removeExpense(trip, user, id); }
  @Get('reservations') @ApiOperation({ summary: 'Listar reservas simuladas' })
  reservations(@Id('tripId') trip: string, @CurrentUser() user: string, @Query() page: PageQuery) { return this.planning.reservations(trip, user, page); }
  @Post('reservations') @ApiOperation({ summary: 'Crear reserva simulada dentro del viaje; no procesa pagos reales' })
  createReservation(@Id('tripId') trip: string, @CurrentUser() user: string, @Body() dto: CreateReservationDto) { return this.planning.createReservation(trip, user, dto); }
  @Patch('reservations/:id') @ApiOperation({ summary: 'Modificar, confirmar o cancelar una reserva' })
  updateReservation(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string, @Body() dto: UpdateReservationDto) { return this.planning.updateReservation(trip, user, id, dto); }
  @Delete('reservations/:id') @ApiOperation({ summary: 'Eliminar una reserva simulada' })
  removeReservation(@Id('tripId') trip: string, @CurrentUser() user: string, @Id() id: string) { return this.planning.removeReservation(trip, user, id); }
}
