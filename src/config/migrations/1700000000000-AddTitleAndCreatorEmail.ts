import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitleAndCreatorEmail1700000000000 implements MigrationInterface {
  name = 'AddTitleAndCreatorEmail1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" ADD "title" character varying(100) NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "match" ADD "creatorEmail" character varying(255) NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "creatorEmail"`);
  }
}
