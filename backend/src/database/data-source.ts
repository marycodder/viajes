import 'reflect-metadata';
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ENTITIES } from './entities';
import { InitialSchema1794180000000 } from './migrations/1794180000000-InitialSchema';

export function databaseOptions(env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
  return {
    type: 'postgres', host: env.POSTGRES_HOST, port: Number(env.POSTGRES_PORT || 5432),
    username: env.POSTGRES_USER, password: env.POSTGRES_PASSWORD, database: env.POSTGRES_DB,
    entities: ENTITIES, migrations: [InitialSchema1794180000000],
    synchronize: false, migrationsRun: true, logging: false,
  };
}

export default new DataSource(databaseOptions());
