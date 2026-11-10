import { MigrationInterface, QueryRunner } from 'typeorm';

// SQL explícito y versionado: synchronize permanece desactivado.
export const INITIAL_SQL = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `CREATE TABLE app_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(100) NOT NULL,
    email varchar(254) NOT NULL UNIQUE, password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (email = lower(email)))`,
  `CREATE TABLE trips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES app_users(id),
    name varchar(150) NOT NULL, description text NOT NULL DEFAULT '',
    start_date date NOT NULL, end_date date NOT NULL, budget numeric(14,0) NOT NULL DEFAULT 0,
    currency varchar(3) NOT NULL DEFAULT 'CLP',
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date), CHECK (budget >= 0 AND budget <= 1000000000000), CHECK (currency = 'CLP'))`,
  `CREATE TABLE trip_travelers (
    trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (trip_id, user_id))`,
  `CREATE TABLE destinations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_by uuid NOT NULL REFERENCES app_users(id),
    name varchar(120) NOT NULL, country varchar(100) NOT NULL, region varchar(100) NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '', latitude double precision NOT NULL, longitude double precision NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (latitude BETWEEN -90 AND 90), CHECK (longitude BETWEEN -180 AND 180))`,
  `CREATE TABLE trip_destinations (
    trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    destination_id uuid NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
    PRIMARY KEY (trip_id, destination_id))`,
  `CREATE TABLE itinerary_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    destination_id uuid NOT NULL, date date NOT NULL, title varchar(150) NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (trip_id, date), UNIQUE (id, trip_id),
    FOREIGN KEY (trip_id, destination_id) REFERENCES trip_destinations(trip_id, destination_id) ON DELETE RESTRICT)`,
  `CREATE TABLE activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_id uuid NOT NULL, name varchar(150) NOT NULL, category varchar(60) NOT NULL,
    time time NOT NULL, estimated_cost numeric(14,0) NOT NULL DEFAULT 0,
    description text NOT NULL DEFAULT '', status varchar(20) NOT NULL DEFAULT 'planned',
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, trip_id), FOREIGN KEY (day_id, trip_id) REFERENCES itinerary_days(id, trip_id) ON DELETE CASCADE,
    CHECK (estimated_cost >= 0 AND estimated_cost <= 1000000000000),
    CHECK (status IN ('planned','completed','cancelled')))`,
  `CREATE TABLE favorites (
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, activity_id))`,
  `CREATE TABLE reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    activity_id uuid, type varchar(30) NOT NULL, provider varchar(150) NOT NULL,
    reference varchar(100) NOT NULL DEFAULT '', start_date date NOT NULL, end_date date NOT NULL,
    estimated_cost numeric(14,0) NOT NULL DEFAULT 0, status varchar(20) NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (activity_id, trip_id) REFERENCES activities(id, trip_id) ON DELETE RESTRICT,
    CHECK (end_date >= start_date), CHECK (estimated_cost >= 0 AND estimated_cost <= 1000000000000),
    CHECK (type IN ('accommodation','transport','activity','other')),
    CHECK (status IN ('pending','confirmed','cancelled')))`,
  `CREATE TABLE expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    activity_id uuid, paid_by uuid NOT NULL REFERENCES app_users(id),
    description varchar(150) NOT NULL, category varchar(60) NOT NULL, date date NOT NULL,
    amount numeric(14,0) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (activity_id, trip_id) REFERENCES activities(id, trip_id) ON DELETE RESTRICT,
    CHECK (amount > 0 AND amount <= 1000000000000))`,
  `CREATE TABLE audit_outbox (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), trip_id uuid NOT NULL, actor_id uuid NOT NULL,
    action varchar(80) NOT NULL, metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz)`,
  `CREATE INDEX trips_owner_idx ON trips(owner_id)`,
  `CREATE INDEX travelers_user_idx ON trip_travelers(user_id)`,
  `CREATE INDEX activities_trip_idx ON activities(trip_id, day_id, time)`,
  `CREATE INDEX expenses_trip_date_idx ON expenses(trip_id, date)`,
  `CREATE INDEX reservations_trip_idx ON reservations(trip_id)`,
  `CREATE INDEX outbox_pending_idx ON audit_outbox(created_at) WHERE delivered_at IS NULL`,
];

export class InitialSchema1794180000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> { for (const sql of INITIAL_SQL) await runner.query(sql); }
  async down(runner: QueryRunner): Promise<void> {
    for (const table of ['audit_outbox', 'expenses', 'reservations', 'favorites', 'activities', 'itinerary_days', 'trip_destinations', 'destinations', 'trip_travelers', 'trips', 'app_users']) {
      await runner.query(`DROP TABLE "${table}"`);
    }
  }
}
