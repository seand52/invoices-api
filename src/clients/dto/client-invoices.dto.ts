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

type Months =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

interface SpendData {
  name: Months;
  spend: number;
}

export interface SpendDataResponse {
  [key: number]: SpendData[];
}
