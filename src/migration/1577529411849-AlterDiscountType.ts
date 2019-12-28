import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDiscountType1577529411849 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE invoice_to_products CHANGE discount discount decimal(10,4) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE sales_order_to_products CHANGE discount discount decimal(10,4) NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE invoice_to_products CHANGE discount discount decimal(10,3) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE sales_order_to_products CHANGE discount discount decimal(10,3) NOT NULL DEFAULT 0`,
    );
  }
}
