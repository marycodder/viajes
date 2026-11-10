import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const money = { type: 'numeric' as const, precision: 14, scale: 0, transformer: { to: (value: number) => value, from: (value: string) => Number(value) } };

export abstract class RecordEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}

@Entity('app_users')
export class User extends RecordEntity {
  @Column({ length: 100 }) name: string;
  @Index({ unique: true }) @Column({ length: 254 }) email: string;
  @Column({ name: 'password_hash', select: false }) passwordHash: string;
}

@Entity('trips')
export class Trip extends RecordEntity {
  @Column({ name: 'owner_id', type: 'uuid' }) ownerId: string;
  @Column({ length: 150 }) name: string;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ name: 'start_date', type: 'date' }) startDate: string;
  @Column({ name: 'end_date', type: 'date' }) endDate: string;
  @Column({ ...money, default: 0 }) budget: number;
  @Column({ length: 3, default: 'CLP' }) currency: string;
}

@Entity('trip_travelers')
export class Traveler {
  @PrimaryColumn({ name: 'trip_id', type: 'uuid' }) tripId: string;
  @PrimaryColumn({ name: 'user_id', type: 'uuid' }) userId: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}

@Entity('destinations')
export class Destination extends RecordEntity {
  @Column({ name: 'created_by', type: 'uuid' }) createdBy: string;
  @Column({ length: 120 }) name: string;
  @Column({ length: 100 }) country: string;
  @Column({ length: 100, default: '' }) region: string;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ type: 'double precision' }) latitude: number;
  @Column({ type: 'double precision' }) longitude: number;
}

@Entity('trip_destinations')
export class TripDestination {
  @PrimaryColumn({ name: 'trip_id', type: 'uuid' }) tripId: string;
  @PrimaryColumn({ name: 'destination_id', type: 'uuid' }) destinationId: string;
}

@Entity('itinerary_days')
@Index(['tripId', 'date'], { unique: true })
export class ItineraryDay extends RecordEntity {
  @Column({ name: 'trip_id', type: 'uuid' }) tripId: string;
  @Column({ name: 'destination_id', type: 'uuid' }) destinationId: string;
  @Column({ type: 'date' }) date: string;
  @Column({ length: 150, default: '' }) title: string;
}

@Entity('activities')
export class Activity extends RecordEntity {
  @Column({ name: 'trip_id', type: 'uuid' }) tripId: string;
  @Column({ name: 'day_id', type: 'uuid' }) dayId: string;
  @Column({ length: 150 }) name: string;
  @Column({ length: 60 }) category: string;
  @Column({ type: 'time' }) time: string;
  @Column({ name: 'estimated_cost', ...money, default: 0 }) estimatedCost: number;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ length: 20, default: 'planned' }) status: 'planned' | 'completed' | 'cancelled';
}

@Entity('favorites')
export class Favorite {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' }) userId: string;
  @PrimaryColumn({ name: 'activity_id', type: 'uuid' }) activityId: string;
}

@Entity('reservations')
export class Reservation extends RecordEntity {
  @Column({ name: 'trip_id', type: 'uuid' }) tripId: string;
  @Column({ name: 'activity_id', type: 'uuid', nullable: true }) activityId: string | null;
  @Column({ length: 30 }) type: 'accommodation' | 'transport' | 'activity' | 'other';
  @Column({ length: 150 }) provider: string;
  @Column({ length: 100, default: '' }) reference: string;
  @Column({ name: 'start_date', type: 'date' }) startDate: string;
  @Column({ name: 'end_date', type: 'date' }) endDate: string;
  @Column({ name: 'estimated_cost', ...money, default: 0 }) estimatedCost: number;
  @Column({ length: 20, default: 'pending' }) status: 'pending' | 'confirmed' | 'cancelled';
}

@Entity('expenses')
export class Expense extends RecordEntity {
  @Column({ name: 'trip_id', type: 'uuid' }) tripId: string;
  @Column({ name: 'activity_id', type: 'uuid', nullable: true }) activityId: string | null;
  @Column({ name: 'paid_by', type: 'uuid' }) paidBy: string;
  @Column({ length: 150 }) description: string;
  @Column({ length: 60 }) category: string;
  @Column({ type: 'date' }) date: string;
  @Column(money) amount: number;
}

@Entity('audit_outbox')
export class AuditOutbox {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'trip_id', type: 'uuid' }) tripId: string;
  @Column({ name: 'actor_id', type: 'uuid' }) actorId: string;
  @Column({ length: 80 }) action: string;
  @Column({ type: 'jsonb', default: {} }) metadata: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true }) deliveredAt: Date | null;
}

export const ENTITIES = [User, Trip, Traveler, Destination, TripDestination, ItineraryDay, Activity, Favorite, Reservation, Expense, AuditOutbox];
