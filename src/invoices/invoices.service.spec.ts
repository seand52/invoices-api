import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { ClientsRepository } from '../clients/clients.repository';
import { InvoicesRepository } from './invoices.repository';
import { ProductsRepository } from '../products/products.repository';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';
import { UnauthorizedException } from '@nestjs/common';
import { PaymentType } from './invoices.entity';

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

const mockInvoiceToProductsRepository = () => ({});
describe('InvoicesService', () => {
  let invoiceService: InvoicesService;
  let clientsRepository;
  let invoicesRepository;
  let productsRepository;
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
      price: 29.99,
      userId: 14,
      createdAt: '2019-11-18T16:38:59.073Z',
      updatedAt: '2019-11-18T16:38:59.073Z',
      quantity: 3,
    },
    {
      id: 2,
      description: 'test2',
      price: 39.99,
      userId: 14,
      createdAt: '2019-11-18T16:38:59.073Z',
      updatedAt: '2019-11-18T16:38:59.073Z',
      quantity: 4,
    },
    {
      id: 3,
      description: 'test2',
      price: 19.99,
      userId: 14,
      createdAt: '2019-11-18T16:38:59.073Z',
      updatedAt: '2019-11-18T16:38:59.073Z',
      quantity: 2,
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
        },
        {
          id: 2,
          quantity: 4,
        },
        {
          id: 3,
          quantity: 2,
        },
      ],

      settings: {
        clientId: '2',
        date: '12/12/2019',
        re: 5.2,
        transportPrice: 12.15,
        paymentType: 'Transferencia',
        tax: true,
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
      const result = await invoiceService.retrieveRelevantData(
        invoiceData,
        clientId,
      );
      expect(result).toEqual({
        client: {
          id: 2,
          name: 'pepito',
        },
        products: formattedProducts,
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
      expect(result).toEqual(375.87);
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
      expect(result).toEqual(350.79);
    });
  });
});
