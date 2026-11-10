import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { enqueueEvent } from '../audit/enqueue';
import { PageQuery, assertDateRange } from '../common/validation';
import { Activity, Destination, Expense, ItineraryDay, Reservation, Traveler, Trip, TripDestination, User } from '../database/entities';
import { TripAccessService } from './trip-access.service';
import { AddTravelerDto, CreateTripDto, UpdateTripDto } from './trips.dto';

@Injectable()
export class TripsService {
  constructor(private readonly db: DataSource, private readonly access: TripAccessService) {}

  list(userId: string, page: PageQuery) {
    return this.db.getRepository(Trip).createQueryBuilder('trip')
      .where('trip.ownerId = :userId', { userId })
      .orWhere('trip.id IN (SELECT trip_id FROM trip_travelers WHERE user_id = :userId)', { userId })
      .orderBy('trip.startDate', 'DESC').addOrderBy('trip.id', 'ASC').take(page.limit).skip(page.offset).getMany();
  }

  async create(userId: string, dto: CreateTripDto) {
    assertDateRange(dto.startDate, dto.endDate);
    return this.db.transaction(async manager => {
      const trip = await manager.save(Trip, manager.create(Trip, { ...dto, ownerId: userId, currency: 'CLP', budget: dto.budget ?? 0 }));
      await manager.insert(Traveler, { tripId: trip.id, userId });
      await enqueueEvent(manager, trip.id, userId, 'trip.created');
      return trip;
    });
  }

  get(tripId: string, userId: string) { return this.access.read(tripId, userId); }

  update(tripId: string, userId: string, dto: UpdateTripDto) {
    return this.access.write(tripId, userId, 'trip.updated', async (manager, trip) => {
      const start = dto.startDate ?? trip.startDate;
      const end = dto.endDate ?? trip.endDate;
      assertDateRange(start, end);
      for (const [entity, fields] of [[ItineraryDay, ['date']], [Reservation, ['startDate', 'endDate']]] as const) {
        for (const field of fields) {
          const count = await manager.getRepository(entity).createQueryBuilder('record')
            .where('record.tripId = :tripId', { tripId })
            .andWhere(`(record.${field} < :start OR record.${field} > :end)`, { start, end }).getCount();
          if (count) throw new BadRequestException('El nuevo período deja itinerarios o reservas fuera del viaje. Ajusta esos registros primero.');
        }
      }
      return manager.save(Trip, Object.assign(trip, dto));
    });
  }

  remove(tripId: string, userId: string) {
    return this.access.write(tripId, userId, 'trip.deleted', async manager => {
      // Respeta las restricciones de referencias a actividades y destinos.
      for (const entity of [Expense, Reservation, Activity, ItineraryDay, TripDestination, Traveler]) await manager.delete(entity, { tripId });
      await manager.delete(Trip, { id: tripId });
      return { deleted: true };
    });
  }

  async travelers(tripId: string, userId: string) {
    const trip = await this.access.read(tripId, userId);
    const users = await this.db.getRepository(User).createQueryBuilder('user')
      .innerJoin(Traveler, 'traveler', 'traveler.userId = user.id').where('traveler.tripId = :tripId', { tripId }).orderBy('user.name', 'ASC').getMany();
    return users.map(user => ({ id: user.id, name: user.name, email: user.email, role: user.id === trip.ownerId ? 'owner' : 'traveler' }));
  }

  addTraveler(tripId: string, userId: string, dto: AddTravelerDto) {
    return this.access.write(tripId, userId, 'traveler.added', async manager => {
      const user = await manager.findOneBy(User, { email: dto.email });
      if (!user) throw new NotFoundException('El viajero debe registrar una cuenta antes de ser agregado.');
      if (await manager.existsBy(Traveler, { tripId, userId: user.id })) throw new ConflictException('El usuario ya pertenece al viaje.');
      await manager.insert(Traveler, { tripId, userId: user.id });
      return { id: user.id, name: user.name, email: user.email, role: 'traveler' };
    });
  }

  removeTraveler(tripId: string, userId: string, travelerId: string) {
    return this.access.write(tripId, userId, 'traveler.removed', async (manager, trip) => {
      if (travelerId === trip.ownerId) throw new BadRequestException('No se puede quitar al propietario.');
      if (!(await manager.delete(Traveler, { tripId, userId: travelerId })).affected) throw new NotFoundException('Viajero no encontrado.');
      return { deleted: true };
    });
  }

  async destinations(tripId: string, userId: string) {
    await this.access.read(tripId, userId);
    return this.db.getRepository(Destination).createQueryBuilder('destination')
      .innerJoin(TripDestination, 'link', 'link.destinationId = destination.id').where('link.tripId = :tripId', { tripId }).orderBy('destination.name', 'ASC').getMany();
  }

  addDestination(tripId: string, userId: string, destinationId: string) {
    return this.access.write(tripId, userId, 'destination.linked', async manager => {
      if (!await manager.existsBy(Destination, { id: destinationId })) throw new NotFoundException('Destino no encontrado.');
      await manager.getRepository(TripDestination).upsert({ tripId, destinationId }, ['tripId', 'destinationId']);
      return { tripId, destinationId };
    });
  }

  removeDestination(tripId: string, userId: string, destinationId: string) {
    return this.access.write(tripId, userId, 'destination.unlinked', async manager => {
      if (await manager.existsBy(ItineraryDay, { tripId, destinationId })) throw new ConflictException('El destino está siendo utilizado en el itinerario.');
      if (!(await manager.delete(TripDestination, { tripId, destinationId })).affected) throw new NotFoundException('Destino no asociado al viaje.');
      return { deleted: true };
    });
  }

  async summary(tripId: string, userId: string) {
    const trip = await this.access.read(tripId, userId);
    const [activity, expense, reservations, travelers] = await Promise.all([
      this.db.getRepository(Activity).createQueryBuilder('a').select('COALESCE(SUM(a.estimatedCost), 0)', 'total')
        .addSelect('COUNT(*)', 'count').where('a.tripId = :tripId AND a.status <> :status', { tripId, status: 'cancelled' }).getRawOne(),
      this.db.getRepository(Expense).createQueryBuilder('e').select('COALESCE(SUM(e.amount), 0)', 'total').where('e.tripId = :tripId', { tripId }).getRawOne(),
      this.db.manager.countBy(Reservation, { tripId, status: 'confirmed' }), this.db.manager.countBy(Traveler, { tripId }),
    ]);
    const spent = Number(expense.total);
    return { tripId, currency: 'CLP', budget: trip.budget, estimatedActivitiesCost: Number(activity.total),
      spent, remaining: trip.budget - spent, overBudget: spent > trip.budget,
      budgetUsedPercent: trip.budget > 0 ? Math.round(spent / trip.budget * 10000) / 100 : null,
      activeActivities: Number(activity.count), confirmedReservations: reservations, travelers };
  }
}
