import { PaymentType } from 'src/invoices/invoices.entity';

export interface ClientInvoices {
  id: number;
  totalPrice: number;
  re: number;
  transportPrice: number;
  paymentType: PaymentType;
  userId: 15;
  clientId: 2;
  date: string;
  createdAt: string;
  updatedAt: string;
}
