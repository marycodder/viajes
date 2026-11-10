import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PageQuery, assertDateRange, assertWithinTrip } from '../common/validation';
import { Activity, Expense, Favorite, ItineraryDay, Reservation, Traveler, Trip, TripDestination } from '../database/entities';
import { TripAccessService } from '../trips/trip-access.service';
import { ActivityQuery, CreateActivityDto, CreateDayDto, CreateExpenseDto, CreateReservationDto, UpdateActivityDto, UpdateDayDto, UpdateExpenseDto, UpdateReservationDto } from './planning.dto';

@Injectable()
export class PlanningService {
  constructor(private readonly db: DataSource, private readonly access: TripAccessService) {}

  async days(tripId: string, userId: string, page: PageQuery) {
    await this.access.read(tripId, userId);
    return this.db.getRepository(ItineraryDay).find({ where: { tripId }, order: { date: 'ASC', id: 'ASC' }, take: page.limit, skip: page.offset });
  }
  createDay(tripId: string, userId: string, dto: CreateDayDto) {
    return this.access.write(tripId, userId, 'itinerary.created', async (manager, trip) => {
      await this.validateDay(manager, trip, dto);
      return manager.save(ItineraryDay, manager.create(ItineraryDay, { ...dto, tripId }));
    });
  }
  updateDay(tripId: string, userId: string, id: string, dto: UpdateDayDto) {
    return this.access.write(tripId, userId, 'itinerary.updated', async (manager, trip) => {
      const day = await this.day(manager, tripId, id);
      Object.assign(day, dto);
      await this.validateDay(manager, trip, day);
      return manager.save(day);
    });
  }
  removeDay(tripId: string, userId: string, id: string) {
    return this.access.write(tripId, userId, 'itinerary.deleted', async manager => {
      await this.day(manager, tripId, id);
      if (await manager.existsBy(Activity, { dayId: id })) throw new ConflictException('Elimina o mueve las actividades del día antes de quitarlo.');
      await manager.delete(ItineraryDay, { id, tripId });
      return { deleted: true };
    });
  }

  async activities(tripId: string, userId: string, query: ActivityQuery, favoritesOnly = false) {
    await this.access.read(tripId, userId);
    const builder = this.db.getRepository(Activity).createQueryBuilder('activity')
      .innerJoin(ItineraryDay, 'day', 'day.id = activity.dayId')
      .leftJoin(Favorite, 'favorite', 'favorite.activityId = activity.id AND favorite.userId = :userId', { userId })
      .addSelect('day.date', 'activityDate').addSelect('favorite.userId IS NOT NULL', 'isFavorite')
      .where('activity.tripId = :tripId', { tripId });
    if (query.dayId) builder.andWhere('activity.dayId = :dayId', { dayId: query.dayId });
    if (query.category) builder.andWhere('activity.category = :category', { category: query.category });
    if (query.status) builder.andWhere('activity.status = :status', { status: query.status });
    if (query.search) builder.andWhere('activity.name ILIKE :search', { search: `%${query.search.replace(/[\\%_]/g, '\\$&')}%` });
    if (favoritesOnly) builder.andWhere('favorite.userId IS NOT NULL');
    // limit/offset, sin take/skip, ya que las uniones son uno a uno y añadimos columnas calculadas.
    const { entities, raw } = await builder.orderBy('day.date', 'ASC').addOrderBy('activity.time', 'ASC').addOrderBy('activity.id', 'ASC')
      .limit(query.limit).offset(query.offset).getRawAndEntities();
    return entities.map((activity, i) => ({ ...activity, date: raw[i].activityDate, favorite: raw[i].isFavorite }));
  }
  async getActivity(tripId: string, userId: string, id: string) {
    await this.access.read(tripId, userId);
    const activity = await this.activity(this.db.manager, tripId, id);
    const day = await this.day(this.db.manager, tripId, activity.dayId);
    return { ...activity, date: day.date, favorite: await this.db.manager.existsBy(Favorite, { activityId: id, userId }) };
  }
  createActivity(tripId: string, userId: string, dto: CreateActivityDto) {
    return this.access.write(tripId, userId, 'activity.created', async manager => {
      await this.day(manager, tripId, dto.dayId);
      return manager.save(Activity, manager.create(Activity, { ...dto, tripId }));
    });
  }
  updateActivity(tripId: string, userId: string, id: string, dto: UpdateActivityDto) {
    return this.access.write(tripId, userId, 'activity.updated', async manager => {
      const activity = await this.activity(manager, tripId, id);
      if (dto.dayId) await this.day(manager, tripId, dto.dayId);
      return manager.save(Activity, Object.assign(activity, dto));
    });
  }
  removeActivity(tripId: string, userId: string, id: string) {
    return this.access.write(tripId, userId, 'activity.deleted', async manager => {
      await this.activity(manager, tripId, id);
      if (await manager.existsBy(Expense, { activityId: id }) || await manager.existsBy(Reservation, { activityId: id })) {
        throw new ConflictException('La actividad tiene gastos o reservas. Desvincúlalos antes de eliminarla.');
      }
      await manager.delete(Activity, { id, tripId });
      return { deleted: true };
    });
  }
  favorite(tripId: string, userId: string, id: string, enabled: boolean) {
    return this.access.write(tripId, userId, enabled ? 'favorite.added' : 'favorite.removed', async manager => {
      await this.activity(manager, tripId, id);
      if (enabled) await manager.getRepository(Favorite).upsert({ userId, activityId: id }, ['userId', 'activityId']);
      else await manager.delete(Favorite, { userId, activityId: id });
      return { activityId: id, favorite: enabled };
    }, false);
  }

  async expenses(tripId: string, userId: string, page: PageQuery) {
    await this.access.read(tripId, userId);
    return this.db.getRepository(Expense).find({ where: { tripId }, order: { date: 'DESC', id: 'ASC' }, take: page.limit, skip: page.offset });
  }
  createExpense(tripId: string, userId: string, dto: CreateExpenseDto) {
    return this.access.write(tripId, userId, 'expense.created', async manager => {
      const paidBy = dto.paidBy ?? userId;
      await this.validateExpense(manager, tripId, paidBy, dto.activityId);
      return manager.save(Expense, manager.create(Expense, { ...dto, tripId, paidBy, activityId: dto.activityId ?? null }));
    });
  }
  updateExpense(tripId: string, userId: string, id: string, dto: UpdateExpenseDto) {
    return this.access.write(tripId, userId, 'expense.updated', async manager => {
      const expense = await manager.findOneBy(Expense, { id, tripId });
      if (!expense) throw new NotFoundException('Gasto no encontrado en este viaje.');
      if (dto.paidBy) await this.validateExpense(manager, tripId, dto.paidBy, dto.activityId);
      else if (dto.activityId) await this.activity(manager, tripId, dto.activityId);
      return manager.save(Expense, Object.assign(expense, dto));
    });
  }
  removeExpense(tripId: string, userId: string, id: string) {
    return this.access.write(tripId, userId, 'expense.deleted', async manager => {
      if (!(await manager.delete(Expense, { id, tripId })).affected) throw new NotFoundException('Gasto no encontrado.');
      return { deleted: true };
    });
  }

  async reservations(tripId: string, userId: string, page: PageQuery) {
    await this.access.read(tripId, userId);
    return this.db.getRepository(Reservation).find({ where: { tripId }, order: { startDate: 'ASC', id: 'ASC' }, take: page.limit, skip: page.offset });
  }
  createReservation(tripId: string, userId: string, dto: CreateReservationDto) {
    return this.access.write(tripId, userId, 'reservation.created', async (manager, trip) => {
      await this.validateReservation(manager, trip, dto);
      return manager.save(Reservation, manager.create(Reservation, { ...dto, tripId, activityId: dto.activityId ?? null }));
    });
  }
  updateReservation(tripId: string, userId: string, id: string, dto: UpdateReservationDto) {
    return this.access.write(tripId, userId, 'reservation.updated', async (manager, trip) => {
      const reservation = await manager.findOneBy(Reservation, { id, tripId });
      if (!reservation) throw new NotFoundException('Reserva no encontrada en este viaje.');
      if (reservation.status === 'cancelled' && dto.status && dto.status !== 'cancelled') throw new BadRequestException('Una reserva cancelada no se puede reactivar. Crea otra reserva.');
      Object.assign(reservation, dto);
      await this.validateReservation(manager, trip, reservation);
      return manager.save(reservation);
    });
  }
  removeReservation(tripId: string, userId: string, id: string) {
    return this.access.write(tripId, userId, 'reservation.deleted', async manager => {
      if (!(await manager.delete(Reservation, { id, tripId })).affected) throw new NotFoundException('Reserva no encontrada.');
      return { deleted: true };
    });
  }

  private async validateDay(manager: EntityManager, trip: Trip, day: { date: string; destinationId: string }) {
    assertWithinTrip(day.date, trip);
    if (!await manager.existsBy(TripDestination, { tripId: trip.id, destinationId: day.destinationId })) {
      throw new BadRequestException('Primero debes asociar el destino al viaje.');
    }
  }
  private async day(manager: EntityManager, tripId: string, id: string) {
    const day = await manager.findOneBy(ItineraryDay, { id, tripId });
    if (!day) throw new NotFoundException('Día no encontrado en este viaje.');
    return day;
  }
  private async activity(manager: EntityManager, tripId: string, id: string) {
    const activity = await manager.findOneBy(Activity, { id, tripId });
    if (!activity) throw new NotFoundException('Actividad no encontrada en este viaje.');
    return activity;
  }
  private async validateExpense(manager: EntityManager, tripId: string, paidBy: string, activityId?: string | null) {
    if (!await manager.existsBy(Traveler, { tripId, userId: paidBy })) throw new BadRequestException('Quien pagó debe pertenecer al viaje.');
    if (activityId) await this.activity(manager, tripId, activityId);
  }
  private async validateReservation(manager: EntityManager, trip: Trip, reservation: { startDate: string; endDate: string; activityId?: string | null }) {
    assertDateRange(reservation.startDate, reservation.endDate);
    assertWithinTrip(reservation.startDate, trip);
    assertWithinTrip(reservation.endDate, trip);
    if (reservation.activityId) await this.activity(manager, trip.id, reservation.activityId);
  }
}
