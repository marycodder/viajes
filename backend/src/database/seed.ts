import 'reflect-metadata';
import { hash } from 'bcryptjs';
import { createConnection, Connection } from 'mongoose';
import dataSource from './data-source';
import { Activity, Destination, Expense, ItineraryDay, Traveler, Trip, TripDestination, User } from './entities';
import { enqueueEvent } from '../audit/enqueue';
import { TripNote, TripNoteSchema, TripRecommendation, TripRecommendationSchema } from '../documents/schemas';

async function seed() {
  const password = process.env.SEED_PASSWORD || '';
  if (password.length < 10 || Buffer.byteLength(password) > 72 || password.includes('REPLACE_WITH')) {
    throw new Error('Configura SEED_PASSWORD antes de cargar datos de ejemplo.');
  }
  let mongo: Connection | undefined;
  try {
    await dataSource.initialize();
    mongo = await createConnection(process.env.MONGODB_URI || '', { serverSelectionTimeoutMS: 5000 }).asPromise();
    const trip = await dataSource.transaction(async manager => {
      let user = await manager.findOneBy(User, { email: 'demo@tripplan.local' });
      if (!user) user = await manager.save(User, manager.create(User, { name: 'Viajero de demostración', email: 'demo@tripplan.local', passwordHash: await hash(password, 12) }));
      const existing = await manager.findOneBy(Trip, { ownerId: user.id, name: 'Semana en Santiago (demo)' });
      if (existing) return existing;
      const date = (offset: number) => { const value = new Date(); value.setUTCDate(value.getUTCDate() + offset); return value.toISOString().slice(0, 10); };
      const destination = await manager.save(Destination, manager.create(Destination, {
        createdBy: user.id, name: 'Santiago', country: 'Chile', region: 'Metropolitana',
        latitude: -33.4489, longitude: -70.6693, description: 'Destino ficticio de demostración de TripPlan.',
      }));
      const created = await manager.save(Trip, manager.create(Trip, { ownerId: user.id, name: 'Semana en Santiago (demo)', startDate: date(1), endDate: date(7), budget: 350000, currency: 'CLP' }));
      await manager.insert(Traveler, { tripId: created.id, userId: user.id });
      await manager.insert(TripDestination, { tripId: created.id, destinationId: destination.id });
      const day = await manager.save(ItineraryDay, manager.create(ItineraryDay, { tripId: created.id, destinationId: destination.id, date: date(2), title: 'Cultura y turismo' }));
      const activity = await manager.save(Activity, manager.create(Activity, { tripId: created.id, dayId: day.id, name: 'Cerro San Cristóbal', category: 'Turismo', time: '09:00', estimatedCost: 5000 }));
      await manager.save(Activity, manager.create(Activity, { tripId: created.id, dayId: day.id, name: 'Museo de la Memoria', category: 'Cultura', time: '12:00', estimatedCost: 8000 }));
      await manager.save(Expense, manager.create(Expense, { tripId: created.id, activityId: activity.id, paidBy: user.id, description: 'Entrada y transporte (ejemplo)', category: 'Turismo', date: date(2), amount: 8000 }));
      await enqueueEvent(manager, created.id, user.id, 'trip.seeded');
      return created;
    });
    const notes = mongo.model(TripNote.name, TripNoteSchema);
    const recommendations = mongo.model(TripRecommendation.name, TripRecommendationSchema);
    await notes.updateOne({ tripId: trip.id, title: 'Qué llevar' }, { $setOnInsert: { tripId: trip.id, authorId: trip.ownerId, title: 'Qué llevar', content: 'Agua, protector solar y calzado cómodo.', tags: ['equipaje'] } }, { upsert: true });
    await recommendations.updateOne({ tripId: trip.id, title: 'Planificar paseos' }, { $setOnInsert: { tripId: trip.id, authorId: trip.ownerId, title: 'Planificar paseos', content: 'Revisar el pronóstico antes de salir.', category: 'Turismo', tags: ['clima'] } }, { upsert: true });
    console.log('Datos de ejemplo disponibles. Correo: demo@tripplan.local. Contraseña: el valor local SEED_PASSWORD.');
    console.log('El seed no sobrescribe cuentas ni viajes de demostración existentes.');
  } finally {
    if (mongo) await mongo.close();
    if (dataSource.isInitialized) await dataSource.destroy();
  }
}
void seed().catch(error => { console.error(`No se pudo completar el seed (${error instanceof Error ? error.name : 'Error'}). Revisa variables y bases de datos.`); process.exitCode = 1; });
