import { PaymentType } from 'src/invoices/invoices.entity';

export interface ClientInvoices {
  id: number;
  totalPrice: number;
  re: number;
  transportPrice: number;
  paymentType: PaymentType;
  userId: number;
  clientId: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}
