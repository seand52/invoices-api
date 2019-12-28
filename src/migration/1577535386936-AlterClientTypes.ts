import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterClientTypes1577535386936 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE clients
    DROP INDEX IDX_b48860677afe62cd96e1265948;`);
    await queryRunner.query(
      `ALTER TABLE clients CHANGE numNif numNif VARCHAR(100) NOT NULL DEFAULT ""`,
    );
    await queryRunner.query(
      `ALTER TABLE clients CHANGE numCif numCif VARCHAR(100) NOT NULL DEFAULT ""`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE clients
    ADD CONSTRAINT clients_unique UNIQUE (email);`);
    await queryRunner.query(
      `ALTER TABLE clients CHANGE numNif numNif VARCHAR(12) NOT NULL DEFAULT ""`,
    );
    await queryRunner.query(
      `ALTER TABLE clients CHANGE numCif numCif VARCHAR(12) NOT NULL DEFAULT ""`,
    );
  }
}
