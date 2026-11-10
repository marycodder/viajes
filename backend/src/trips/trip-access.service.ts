import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { enqueueEvent } from '../audit/enqueue';
import { Traveler, Trip } from '../database/entities';

@Injectable()
export class TripAccessService {
  constructor(private readonly db: DataSource) {}

  async read(tripId: string, userId: string, manager = this.db.manager) {
    const trip = await manager.findOneBy(Trip, { id: tripId });
    if (!trip) throw new NotFoundException('Viaje no encontrado.');
    if (trip.ownerId !== userId && !await manager.existsBy(Traveler, { tripId, userId })) {
      throw new ForbiddenException('No perteneces a este viaje.');
    }
    return trip;
  }

  async owner(tripId: string, userId: string) {
    const trip = await this.read(tripId, userId);
    if (trip.ownerId !== userId) throw new ForbiddenException('Solo el propietario puede modificar el viaje.');
    return trip;
  }

  async write<T>(tripId: string, userId: string, action: string, work: (manager: EntityManager, trip: Trip) => Promise<T>, ownerOnly = true) {
    return this.db.transaction(async manager => {
      // Serializa cambios sobre un viaje para validar fechas y dependencias de forma consistente.
      const trip = await manager.findOne(Trip, { where: { id: tripId }, lock: { mode: 'pessimistic_write' } });
      if (!trip) throw new NotFoundException('Viaje no encontrado.');
      await this.read(tripId, userId, manager);
      if (ownerOnly && trip.ownerId !== userId) throw new ForbiddenException('Solo el propietario puede modificar el viaje.');
      const result = await work(manager, trip);
      await enqueueEvent(manager, tripId, userId, action);
      return result;
    });
  }
}
