import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyDocumentType1582831343739 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE clients MODIFY COLUMN documentType ENUM ("CIF", "NIF", "INTRA", "PASSPORT", "") DEFAULT ""`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE clients MODIFY COLUMN documentType ENUM ("CIF", "NIF", "INTRA", "") DEFAULT ""`,
    );
  }
}
