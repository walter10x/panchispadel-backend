import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database';

/**
 * Promueve a admin el email definido en ADMIN_EMAIL (si existe el usuario).
 * Si ADMIN_PASSWORD está definido, también resetea la contraseña.
 * Asegura la columna role por si la BD de prod quedó sin ella.
 */
export async function seedAdmin(): Promise<void> {
  await AppDataSource.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'player'
  `);

  const email = process.env['ADMIN_EMAIL'];
  if (!email) {
    console.log('[seed] ADMIN_EMAIL no definido — omitiendo promo a admin');
    return;
  }

  const rows: Array<{ email: string; role: string }> = await AppDataSource.query(
    'SELECT email, role FROM users WHERE email = $1',
    [email],
  );

  if (rows.length === 0) {
    console.warn(`[seed] Usuario ${email} no encontrado — registra primero y vuelve a seed`);
    return;
  }

  const password = process.env['ADMIN_PASSWORD'];
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await AppDataSource.query(
      'UPDATE users SET role = $1, password_hash = $2 WHERE email = $3',
      ['admin', hash, email],
    );
    console.log(`[seed] Contraseña reseteada y ${email} promovido a admin`);
  } else {
    await AppDataSource.query('UPDATE users SET role = $1 WHERE email = $2', [
      'admin',
      email,
    ]);
    console.log(`[seed] Usuario ${email} promovido a admin (antes: ${rows[0]!.role})`);
  }

  const after: Array<{ email: string; role: string }> = await AppDataSource.query(
    'SELECT email, role FROM users WHERE email = $1',
    [email],
  );
  console.log(`[seed] Verificación: ${JSON.stringify(after)}`);
}
