export interface FullSalesOrdersDetails {
  id: number;
  totalPrice: number;
  re: number;
  transportPrice: number;
  tax: number;
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
  salesOrderToProducts: SalesOrderProducts[];
}

interface SalesOrderProducts {
  id: number;
  salesOrderId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    description: string;
    price: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
  };
}
