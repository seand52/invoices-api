import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameNumNif1580037663084 implements MigrationInterface {
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
