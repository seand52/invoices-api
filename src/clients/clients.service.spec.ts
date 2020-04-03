import { Test } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InvoicesRepository } from '../invoices/invoices.repository';
import { SalesOrdersRepository } from '../sales-orders/sales-orders.repository';
import { ProductsRepository } from '../products/products.repository';

const mockClientsRepository = () => ({
  findOne: jest.fn(),
  insert: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});

const mockProductsRepository = () => ({
  getPopularProducts: jest.fn(),
});

const mockInvoicesRepository = () => ({
  findClientInvoices: jest.fn(),
});

const mockSalesOrderRepository = () => ({
  findClientSalesOrders: jest.fn(),
});

describe('ClientsServices', () => {
  let clientsService;
  let clientsRepository;
  let invoicesRepository;
  let salesOrdersRepository;
  let productsRepository;
  const mockClient = {
    id: 5,
    name: 'string',
    shopName: 'string',
    address: 'string',
    city: 'string',
    province: 'string',
    postcode: 'string',
    numNif: 'string',
    numCif: 'string',
    telephone1: 'string',
    telephone2: 'string',
    email: 'email2@gmail.com',
    userId: 5,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsRepository, useFactory: mockClientsRepository },
        { provide: InvoicesRepository, useFactory: mockInvoicesRepository },
        { provide: ProductsRepository, useFactory: mockProductsRepository },
        {
          provide: SalesOrdersRepository,
          useFactory: mockSalesOrderRepository,
        },
      ],
    }).compile();

    clientsService = await module.get<ClientsService>(ClientsService);
    clientsRepository = await module.get<ClientsRepository>(ClientsRepository);
    productsRepository = await module.get<ProductsRepository>(
      ProductsRepository,
    );
    invoicesRepository = await module.get<InvoicesRepository>(
      InvoicesRepository,
    );
    salesOrdersRepository = await module.get<SalesOrdersRepository>(
      SalesOrdersRepository,
    );
  });

  describe('getClientById', () => {
    it('calls clientsRepository.findOne() and successfully retrieves the client', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      const result = await clientsService.getClientById(1);
      expect(result).toEqual(mockClient);

      expect(clientsRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('throws an error if the client does not exist', async () => {
      clientsRepository.findOne.mockResolvedValue(null);
      expect(clientsService.getClientById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Create clients', () => {
    it('should successfully creates a client', async () => {
      clientsRepository.insert.mockResolvedValue({
        identifiers: [mockClient],
      });

      const result = await clientsService.createClient(mockClient, 1);
      expect(result).toEqual(mockClient.id);
      expect(clientsRepository.insert).toHaveBeenCalledWith({
        ...mockClient,
        userId: 1,
      });
    });

    it('should not duplicate a client', async () => {
      clientsRepository.insert.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
      expect(clientsService.createClient(mockClient, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Delete client', () => {
    it('should successfully delete a client if the client belongs to that user', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      expect(clientsRepository.delete).not.toHaveBeenCalled();
      const result = await clientsService.deleteClientById(mockClient.id, 5);
      expect(result).toEqual({ message: 'OK' });
      expect(clientsRepository.delete).toHaveBeenCalledWith(mockClient.id);
    });

    it('should throw error if no client is found with that id', async () => {
      clientsRepository.findOne.mockResolvedValue(null);
      expect(clientsService.deleteClientById(mockClient.id, 5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if trying to delete a client of another user', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      expect(clientsService.deleteClientById(mockClient.id, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Update client', () => {
    const clientData = {
      name: 'test updated name',
      numNif: '58182818G',
    };
    it('should successfully update a client if the client belongs to that user', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      expect(clientsRepository.update).not.toHaveBeenCalled();
      const result = await clientsService.updateClientById(
        clientData,
        mockClient.id,
        5,
      );
      expect(result).toEqual(mockClient);
      expect(clientsRepository.update).toHaveBeenCalledWith(
        mockClient.id,
        clientData,
      );
    });

    it('should throw error if no client is found with that id', async () => {
      clientsRepository.findOne.mockResolvedValue(null);
      expect(clientsService.updateClientById(mockClient.id, 5)).rejects.toThrow(
        NotFoundException,
      );
      expect(clientsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if trying to delete a client of another user', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      expect(clientsService.updateClientById(mockClient.id, 1)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(clientsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('get client invoices', () => {
    it('should retrieve the invoices for a specific client', async () => {
      const mockResult = [
        {
          id: 1,
          totalPrice: 29.99,
          re: 5.2,
          transportPrice: 10.0,
          paymentType: 'Transferencia',
          userId: 15,
          clientId: 2,
          date: '2019-11-20T20:26:15.000Z',
          createdAt: '2019-11-20T15:47:08.361Z',
          updatedAt: '2019-11-20T15:47:08.361Z',
        },
      ];
      expect(invoicesRepository.findClientInvoices).not.toHaveBeenCalled();
      invoicesRepository.findClientInvoices.mockResolvedValue(mockResult);
      const result = await clientsService.getClientInvoices(15);
      expect(result).toEqual(mockResult);
      expect(invoicesRepository.findClientInvoices).toHaveBeenCalledWith(15);
    });

    it('should correctly format the invoices response into data usable for the bar chart', () => {
      const invoices = [
        {
          id: 1,
          totalPrice: 20,
          re: 5.2,
          transportPrice: 10.0,
          paymentType: 'Transferencia',
          userId: 15,
          clientId: 2,
          date: '2019-11-20T20:26:15.000Z',
          createdAt: '2019-11-20T15:47:08.361Z',
          updatedAt: '2019-11-20T15:47:08.361Z',
        },
        {
          id: 2,
          totalPrice: 30,
          re: 5.2,
          transportPrice: 10.0,
          paymentType: 'Transferencia',
          userId: 15,
          clientId: 2,
          date: '2019-11-20T20:26:15.000Z',
          createdAt: '2019-11-20T15:47:08.361Z',
          updatedAt: '2019-11-20T15:47:08.361Z',
        },
        {
          id: 3,
          totalPrice: 120,
          re: 5.2,
          transportPrice: 10.0,
          paymentType: 'Transferencia',
          userId: 15,
          clientId: 2,
          date: '2019-12-20T20:26:15.000Z',
          createdAt: '2019-11-20T15:47:08.361Z',
          updatedAt: '2019-11-20T15:47:08.361Z',
        },
        {
          id: 4,
          totalPrice: 200,
          re: 5.2,
          transportPrice: 10.0,
          paymentType: 'Transferencia',
          userId: 15,
          clientId: 2,
          date: '2020-01-20T20:26:15.000Z',
          createdAt: '2019-11-20T15:47:08.361Z',
          updatedAt: '2019-11-20T15:47:08.361Z',
        },
      ];
      const result = clientsService.makeBarChartData(invoices);
      expect(result).toEqual({
        2019: [
          {
            name: 'January',
            spend: 0,
          },

          {
            name: 'February',
            spend: 0,
          },
          {
            name: 'March',
            spend: 0,
          },
          {
            name: 'April',
            spend: 0,
          },
          {
            name: 'May',
            spend: 0,
          },
          {
            name: 'June',
            spend: 0,
          },
          {
            name: 'July',
            spend: 0,
          },
          {
            name: 'August',
            spend: 0,
          },
          {
            name: 'September',
            spend: 0,
          },
          {
            name: 'October',
            spend: 0,
          },
          {
            name: 'November',
            spend: 50,
          },
          {
            name: 'December',
            spend: 120,
          },
        ],
        2020: [
          {
            name: 'January',
            spend: 200,
          },

          {
            name: 'February',
            spend: 0,
          },
          {
            name: 'March',
            spend: 0,
          },
          {
            name: 'April',
            spend: 0,
          },
          {
            name: 'May',
            spend: 0,
          },
          {
            name: 'June',
            spend: 0,
          },
          {
            name: 'July',
            spend: 0,
          },
          {
            name: 'August',
            spend: 0,
          },
          {
            name: 'September',
            spend: 0,
          },
          {
            name: 'October',
            spend: 0,
          },
          {
            name: 'November',
            spend: 0,
          },
          {
            name: 'December',
            spend: 0,
          },
        ],
      });
    });
    it('should correctly return popular products for client', async () => {
      const mockProductsResult = [
        {
          count: 14,
          reference: 'REF1',
        },
        {
          count: 10,
          reference: 'REF2',
        },
        {
          count: 8,
          reference: 'REF3',
        },
      ];
      productsRepository.getPopularProducts.mockResolvedValue(
        mockProductsResult,
      );
      expect(productsRepository.getPopularProducts).not.toHaveBeenCalled();
      const result = await clientsService.getPopularProducts(15);
      expect(productsRepository.getPopularProducts).toHaveBeenCalledWith(15);
      expect(result).toEqual([
        {
          '# of items sold': 14,
          fullMark: 14,
          reference: 'REF1',
        },
        {
          '# of items sold': 10,
          fullMark: 14,
          reference: 'REF2',
        },
        {
          '# of items sold': 8,
          fullMark: 14,
          reference: 'REF3',
        },
      ]);
    });
  });
  describe('get client sales orders', () => {
    it('should retrieve the sales orders for a specific client', async () => {
      const mockResult = [
        {
          id: 1,
          totalPrice: 29.99,
          re: 5.2,
          transportPrice: 10.0,
          paymentType: 'Transferencia',
          userId: 15,
          clientId: 2,
          date: '2019-11-20T20:26:15.000Z',
          createdAt: '2019-11-20T15:47:08.361Z',
          updatedAt: '2019-11-20T15:47:08.361Z',
        },
      ];
      expect(
        salesOrdersRepository.findClientSalesOrders,
      ).not.toHaveBeenCalled();
      salesOrdersRepository.findClientSalesOrders.mockResolvedValue(mockResult);
      const result = await clientsService.getClientSalesOrders(15);
      expect(result).toEqual(mockResult);
      expect(salesOrdersRepository.findClientSalesOrders).toHaveBeenCalledTimes(
        1,
      );
      expect(salesOrdersRepository.findClientSalesOrders).toHaveBeenCalledWith(
        15,
      );
    });
  });
});
