import { AppDataSource } from '../database';
import { seedClubs } from './clubs-seed';
import { seedAdmin } from './admin-seed';

async function runSeeds(): Promise<void> {
  await AppDataSource.initialize();
  await seedClubs();
  await seedAdmin();
  await AppDataSource.destroy();
  console.log('Seeds completed');
}

runSeeds().catch(console.error);
