import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1710000000000 implements MigrationInterface {
  name = 'AddUserRole1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" character varying(20) NOT NULL DEFAULT 'player'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
  }
}
