import {Test} from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';

const mockClientsRepository = () => ({
  findOne: jest.fn(),
  insert: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});
describe('ClientsServices', () => {
  let clientsService;
  let clientsRepository;
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
        {provide: ClientsRepository, useFactory: mockClientsRepository},
      ],
    }).compile();

    clientsService = await module.get<ClientsService>(ClientsService);
    clientsRepository = await module.get<ClientsRepository>(ClientsRepository);
  });

  describe('getClientById', () => {
    it('calls clientsRepository.findOne() and successfully retrieves the client', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      const result = await clientsService.getClientById(1);
      expect(result).toEqual(mockClient);

      expect(clientsRepository.findOne).toHaveBeenCalledWith(1);
    });

    it ('throws an error if the client does not exist', async () => {
      clientsRepository.findOne.mockResolvedValue(null);
      expect(clientsService.getClientById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Create clients', () => {
    it('should successfully creates a client', async () => {
      clientsRepository.insert.mockResolvedValue({
        identifiers: [
          mockClient,
        ],
      });

      const result = await clientsService.createClient(mockClient, 1);
      expect(result).toEqual(mockClient.id);
      expect(clientsRepository.insert).toHaveBeenCalledWith({...mockClient, userId: 1});
    });

    it('should not duplicate a client', async () => {
      clientsRepository.insert.mockRejectedValue({code: 'ER_DUP_ENTRY'});
      expect(clientsService.createClient(mockClient, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('Delete client', () => {
    it('should successfully delete a client if the client belongs to that user', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      expect(clientsRepository.delete).not.toHaveBeenCalled();
      const result = await clientsService.deleteClientById(mockClient.id, 5);
      expect(result).toEqual('OK');
      expect(clientsRepository.delete).toHaveBeenCalledWith(mockClient.id);
    });

    it('should throw error if no client is found with that id', async () => {
      clientsRepository.findOne.mockResolvedValue(null);
      expect(clientsService.deleteClientById(mockClient.id, 5)).rejects.toThrow(NotFoundException);
    });

    it('should throw error if trying to delete a client of another user', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      expect(clientsService.deleteClientById(mockClient.id, 1)).rejects.toThrow(UnauthorizedException);
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
      const result = await clientsService.updateClientById(clientData, mockClient.id, 5);
      expect(result).toEqual('OK');
      expect(clientsRepository.update).toHaveBeenCalledWith(mockClient.id, clientData);
    });

    it('should throw error if no client is found with that id', async () => {
      clientsRepository.findOne.mockResolvedValue(null);
      expect(clientsService.updateClientById(mockClient.id, 5)).rejects.toThrow(NotFoundException);
      expect(clientsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if trying to delete a client of another user', async () => {
      clientsRepository.findOne.mockResolvedValue(mockClient);
      expect(clientsService.updateClientById(mockClient.id, 1)).rejects.toThrow(UnauthorizedException);
      expect(clientsRepository.update).not.toHaveBeenCalled();
    });
  });
});
