import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { env } from './env';

const options: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  synchronize: env.DB_SYNCHRONIZE, // Controlado explícitamente por variable de entorno
  logging: env.NODE_ENV === 'development',
  entities: [__dirname + '/../**/*-orm.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
};

export const AppDataSource = new DataSource(options);

export async function initializeDatabase(): Promise<DataSource> {
  try {
    const dataSource = await AppDataSource.initialize();
    console.log('Database connected successfully');
    return dataSource;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
