import { EntityManager } from 'typeorm';
import { AuditOutbox } from '../database/entities';

export async function enqueueEvent(manager: EntityManager, tripId: string, actorId: string, action: string, metadata: Record<string, unknown> = {}) {
  await manager.save(AuditOutbox, manager.create(AuditOutbox, { tripId, actorId, action, metadata }));
}
