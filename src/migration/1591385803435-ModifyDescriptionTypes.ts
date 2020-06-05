import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDescriptionTypes1591385803435 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE invoice_to_products MODIFY COLUMN description VARCHAR(255) DEFAULT ""`,
        );
        await queryRunner.query(
            `ALTER TABLE products MODIFY COLUMN description VARCHAR(255) DEFAULT ""`,
        );
        await queryRunner.query(
            `ALTER TABLE sales_order_to_products MODIFY COLUMN description VARCHAR(255) DEFAULT ""`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE invoice_to_products MODIFY COLUMN description VARCHAR(55) DEFAULT ""`,
        );
        await queryRunner.query(
            `ALTER TABLE products MODIFY COLUMN description VARCHAR(55) DEFAULT ""`,
        );
        await queryRunner.query(
            `ALTER TABLE sales_order_to_products MODIFY COLUMN description VARCHAR(55) DEFAULT ""`,
        );

    }
}
