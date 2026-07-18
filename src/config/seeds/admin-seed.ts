import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database';
import { UserOrmEntity } from '../../modules/users/infrastructure/user-orm.entity';

/**
 * Promueve a admin el email definido en ADMIN_EMAIL (si existe el usuario).
 * Si ADMIN_PASSWORD está definido, también resetea la contraseña.
 * Uso: ADMIN_EMAIL=tu@email.com npm run seed
 *      ADMIN_EMAIL=tu@email.com ADMIN_PASSWORD=secret npm run seed
 */
export async function seedAdmin(): Promise<void> {
  const email = process.env['ADMIN_EMAIL'];
  if (!email) {
    console.log('[seed] ADMIN_EMAIL no definido — omitiendo promo a admin');
    return;
  }

  const repo = AppDataSource.getRepository(UserOrmEntity);
  const user = await repo.findOne({ where: { email } });
  if (!user) {
    console.warn(`[seed] Usuario ${email} no encontrado — registra primero y vuelve a seed`);
    return;
  }

  user.role = 'admin';

  const password = process.env['ADMIN_PASSWORD'];
  if (password) {
    user.passwordHash = await bcrypt.hash(password, 10);
    console.log(`[seed] Contraseña reseteada para ${email}`);
  }

  await repo.save(user);
  console.log(`[seed] Usuario ${email} promovido a admin`);
}
