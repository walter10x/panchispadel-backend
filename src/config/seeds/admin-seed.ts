import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database';

/**
 * Promueve a admin el email definido en ADMIN_EMAIL (si existe el usuario).
 * Si ADMIN_PASSWORD está definido, también resetea la contraseña.
 * "role" va entre comillas: en PostgreSQL ROLE es palabra reservada.
 */
export async function seedAdmin(): Promise<void> {
  console.log(
    `[seed] ADMIN_EMAIL=${process.env['ADMIN_EMAIL'] ?? '(undefined)'} ADMIN_PASSWORD=${process.env['ADMIN_PASSWORD'] ? '(set)' : '(unset)'}`,
  );

  try {
    await AppDataSource.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS "role" varchar(20) NOT NULL DEFAULT 'player'
    `);
    console.log('[seed] columna "role" OK');
  } catch (err) {
    console.error('[seed] ALTER "role":', err);
  }

  const email = process.env['ADMIN_EMAIL']?.trim();
  if (!email) {
    console.log('[seed] ADMIN_EMAIL no definido — omitiendo promo a admin');
    return;
  }

  const password = process.env['ADMIN_PASSWORD'];
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    const result = await AppDataSource.query(
      'UPDATE users SET "role" = $1, password_hash = $2 WHERE lower(email) = lower($3) RETURNING email, "role"',
      ['admin', hash, email],
    );
    console.log(`[seed] UPDATE con password: ${JSON.stringify(result)}`);
  } else {
    const result = await AppDataSource.query(
      'UPDATE users SET "role" = $1 WHERE lower(email) = lower($2) RETURNING email, "role"',
      ['admin', email],
    );
    console.log(`[seed] UPDATE role: ${JSON.stringify(result)}`);
  }
}
