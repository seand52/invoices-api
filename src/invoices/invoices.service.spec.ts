import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { ClientsRepository } from '../clients/clients.repository';
import { InvoicesRepository } from './invoices.repository';
import { ProductsRepository } from '../products/products.repository';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PaymentType } from './invoices.entity';
import { SalesOrdersRepository } from '../sales-orders/sales-orders.repository';
import { BusinessInfoRepository } from '../business-info/business-info.repository';
import { SalesOrderToProducts } from '../salesOrder-products/salesOrder-products.entity';
import { SalesOrdersToProductsRepository } from '../salesOrder-products/salesOrder-products.repository';

const mockClientsRepository = () => ({
  findOne: jest.fn(),
});

const mockInvoicesRepository = () => ({
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockProductsRepository = () => ({
  retrieveProductDetails: jest.fn(),
});

const mockSalesOrdersRepository = () => ({
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockBusinessInfoRepository = () => ({
  findOne: jest.fn(),
});

const mockSalesOrderToProductsRepository = () => ({
  retrieveSalesOrderProducts: jest.fn(),
});

const creteInvoiceData = {
  products: [
    {
      id: 1,
      quantity: 3,
      discount: 0,
    },
    {
      id: 2,
      quantity: 4,
      discount: 0,
    },
    {
      id: 7,
      quantity: 2,
      discount: 0,
    },
    {
      id: 4,
      quantity: 5,
      discount: 0,
    },
    {
      id: 5,
      quantity: 9,
      discount: 0,
    },
  ],

  settings: {
    clientId: 2,
    date: '12/12/2019',
    re: 5.2,
    transportPrice: 12.15,
    paymentType: PaymentType.CASH,
    tax: 0.21,
  },
};

const mockInvoiceToProductsRepository = () => ({});
describe('InvoicesService', () => {
  let invoiceService: InvoicesService;
  let clientsRepository;
  let invoicesRepository;
  let productsRepository;
  let salesOrderRepository;
  let businessInfoRepository;
  let salesOrderToProductsRepository;
  const invoiceResult = {
    id: 1,
    totalPrice: '29.99',
    re: '5.20',
    transportPrice: '10.00',
    userId: 15,
    clientId: 2,
    createdAt: '2019-11-20T15:47:08.361Z',
    updatedAt: '2019-11-20T15:47:08.361Z',
    client: {
      name: 'string',
      telephone1: 'string',
      email: 'seand52@gmail.com',
    },
  };
  const formattedProducts = [
    {
      id: 1,
      description: 'test2',
      price: 10,
      userId: 14,
      createdAt: '2019-11-18T16:38:59.073Z',
      updatedAt: '2019-11-18T16:38:59.073Z',
      quantity: 3,
      discount: 0,
      finalPrice: 89.97,
    },
    {
      id: 2,
      description: 'test2',
      price: 10,
      userId: 14,
      createdAt: '2019-11-18T16:38:59.073Z',
      updatedAt: '2019-11-18T16:38:59.073Z',
      quantity: 4,
      discount: 0,
      finalPrice: 159.96,
    },
    {
      id: 3,
      description: 'test2',
      price: 10,
      userId: 14,
      createdAt: '2019-11-18T16:38:59.073Z',
      updatedAt: '2019-11-18T16:38:59.073Z',
      quantity: 2,
      discount: 0,
      finalPrice: 39.98,
    },
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: ClientsRepository, useFactory: mockClientsRepository },
        { provide: InvoicesRepository, useFactory: mockInvoicesRepository },
        { provide: ProductsRepository, useFactory: mockProductsRepository },
        {
          provide: InvoiceToProductsRepository,
          useFactory: mockInvoiceToProductsRepository,
        },
        {
          provide: SalesOrdersRepository,
          useFactory: mockSalesOrdersRepository,
        },
        {
          provide: BusinessInfoRepository,
          useFactory: mockBusinessInfoRepository,
        },
        {
          provide: SalesOrdersToProductsRepository,
          useFactory: mockSalesOrderToProductsRepository,
        },
      ],
    }).compile();

    invoiceService = await module.get<InvoicesService>(InvoicesService);
    clientsRepository = await module.get<ClientsRepository>(ClientsRepository);
    invoicesRepository = await module.get<InvoicesRepository>(
      InvoicesRepository,
    );
    productsRepository = await module.get<ProductsRepository>(
      ProductsRepository,
    );
    salesOrderRepository = await module.get<SalesOrdersRepository>(
      SalesOrdersRepository,
    );
    businessInfoRepository = await module.get<BusinessInfoRepository>(
      BusinessInfoRepository,
    );
    salesOrderToProductsRepository = await module.get<
      SalesOrdersToProductsRepository
    >(SalesOrdersToProductsRepository);
  });

  describe('delete invoice', () => {
    it('Should delete an invoice successfully', async () => {
      invoicesRepository.findOne.mockResolvedValue(invoiceResult);
      expect(invoicesRepository.delete).not.toHaveBeenCalled();
      const result = await invoiceService.deleteInvoiceById(1, 15);
      expect(result).toEqual({ message: 'OK' });
      expect(invoicesRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should fail if invoice does not belong to user', () => {
      invoicesRepository.findOne.mockResolvedValue(invoiceResult);
      expect(invoicesRepository.delete).not.toHaveBeenCalled();
      expect(invoiceService.deleteInvoiceById(1, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Retrieve relevant data for invoices', () => {
    const invoiceData = {
      products: [
        {
          id: 1,
          quantity: 3,
          discount: 0,
          price: 10,
        },
        {
          id: 2,
          quantity: 4,
          discount: 0,
          price: 10,
        },
        {
          id: 3,
          quantity: 2,
          discount: 0,
          price: 10,
        },
      ],

      settings: {
        clientId: '2',
        date: '12/12/2019',
        re: 5.2,
        transportPrice: 12.15,
        paymentType: 'Transferencia',
        tax: 0.21,
      },
    };
    const clientId = 2;
    it('Should return products with the correct format', async () => {
      clientsRepository.findOne.mockResolvedValue({
        id: 2,
        name: 'pepito',
      });
      productsRepository.retrieveProductDetails.mockResolvedValue([
        {
          id: 1,
          description: 'test2',
          price: 29.99,
          userId: 14,
          createdAt: '2019-11-18T16:38:59.073Z',
          updatedAt: '2019-11-18T16:38:59.073Z',
        },
        {
          id: 2,
          description: 'test2',
          price: 39.99,
          userId: 14,
          createdAt: '2019-11-18T16:38:59.073Z',
          updatedAt: '2019-11-18T16:38:59.073Z',
        },
        {
          id: 3,
          description: 'test2',
          price: 19.99,
          userId: 14,
          createdAt: '2019-11-18T16:38:59.073Z',
          updatedAt: '2019-11-18T16:38:59.073Z',
        },
      ]);
      businessInfoRepository.findOne.mockResolvedValue(true);
      const result = await invoiceService.retrieveRelevantData(
        invoiceData,
        clientId,
        14,
      );
      expect(result).toEqual({
        client: {
          id: 2,
          name: 'pepito',
        },
        products: formattedProducts,
        businessInfo: true,
      });
    });
  });

  describe('calculate price', () => {
    it('should correctly calculate the price when re, tax, and transport are selected', () => {
      const settings = {
        re: 0.052,
        tax: 0.21,
        transportPrice: 10,
        clientId: 2,
        paymentType: PaymentType.CASH,
        date: '12/12/2019',
      };
      const result = invoiceService.calculateTotalprice(
        formattedProducts,
        settings,
      );
      expect(result.invoiceTotal).toEqual(123.58);
    });
    it('should correctly calculate the price when only tax selected', () => {
      const settings = {
        re: 0,
        tax: 0.21,
        transportPrice: 0,
        clientId: 2,
        paymentType: PaymentType.CASH,
        date: '12/12/2019',
      };
      const result = invoiceService.calculateTotalprice(
        formattedProducts,
        settings,
      );
      expect(result.invoiceTotal).toEqual(108.9);
    });
  });

  describe('transform invoice from albaran', () => {
    it('should correctly save the invoice', async () => {
      const salesOrderId = 5;
      salesOrderRepository.findOne.mockResolvedValue(true);
      const spy: any = jest.spyOn(invoiceService, 'saveInvoice');
      spy.mockResolvedValue(true);
      salesOrderRepository.findOne.mockResolvedValue(true);
      invoicesRepository.delete.mockResolvedValue(true);
      const result = await invoiceService.transformToInvoice(1, salesOrderId);
      expect(salesOrderRepository.delete).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual('OK');
    });
    it('should throw an error with not found sales order id', async () => {
      salesOrderRepository.findOne.mockResolvedValue(null);
      await expect(invoiceService.transformToInvoice(1, 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
