import { PaymentType } from '../../src/invoices/invoices.entity';

export const mockProducts = [
  {
    description: 'product description 1',
    price: 29.99,
    userId: 1,
  },
  {
    description: 'product description 2',
    price: 19.99,
    userId: 1,
  },
  {
    description: 'product description 3',
    price: 39.99,
    userId: 1,
  },
  {
    description: 'product description 4',
    price: 49.99,
    userId: 1,
  },
];

export const invoicesData = {
  totalPrice: 99.99,
  re: 5.2,
  transportPrice: 10,
  userId: 1,
  clientId: 1,
  date: '12/12/2019',
  paymentType: PaymentType.CASH,
};

export const invoiceProductsData = [
  {
    invoiceId: 1,
    productId: 1,
    quantity: 3,
  },
  {
    invoiceId: 1,
    productId: 1,
    quantity: 2,
  },
  {
    invoiceId: 1,
    productId: 1,
    quantity: 4,
  },
  {
    invoiceId: 1,
    productId: 1,
    quantity: 2,
  },
];
