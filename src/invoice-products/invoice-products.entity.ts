import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoices } from '../invoices/invoices.entity';
import { Products } from '../products/products.entity';

@Entity()
export class InvoiceToProducts {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column('int', {nullable: false})
    public invoiceId!: number;

    @Column('int', {nullable: false})
    public productId!: number;

    @Column('int', {nullable: false})
    public quantity!: number;

    @ManyToOne(type => Invoices, invoice => invoice.invoiceToProducts)
    public invoice!: Invoices;

    @ManyToOne(type => Products, product => product.invoiceToProducts)
    public product!: Products;

}
