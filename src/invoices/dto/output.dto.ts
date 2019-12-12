import { PaymentType } from '../invoices.entity';

export interface FullInvoiceDetails {
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
  client: {
    name: string;
    telephone1: string;
    email: string;
  };
  invoiceToProducts: InvoiceProducts[];
}

interface InvoiceProducts {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
  description: string;
  price: number;
  discount: number;
}
