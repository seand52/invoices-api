import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterClientTypes1577535386936 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE clients CHANGE numNif documentNum VARCHAR(100) NOT NULL DEFAULT ""`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE clients CHANGE documentNum numNif VARCHAR(100) NOT NULL DEFAULT ""`,
    );
  }
}
