import { Test, TestingModule } from '@nestjs/testing';
import { BusinessInfoService } from './business-info.service';
import {BusinessInfoRepository} from './business-info.repository';
import { ConflictException } from '@nestjs/common';

const mockBusinessInfoRepository = () => ({
  find: jest.fn(),
  insert: jest.fn(),
});

describe('BusinessInfoService', () => {
  let businessInfoService: BusinessInfoService;
  let businessInfoRepository;

  const mockData = {
    name: 'asdf',
    cif: '49192919',
    address: 'asdf',
    postcode: '08015',
    city: 'Barcelona',
    country: 'Spain',
    telephone: '93328919',
    email: 'newbu22siness@gaymail.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessInfoService,
        {provide: BusinessInfoRepository, useFactory: mockBusinessInfoRepository}],
    }).compile();

    businessInfoService = await module.get<BusinessInfoService>(BusinessInfoService);
    businessInfoRepository = await module.get<BusinessInfoRepository>(BusinessInfoRepository);
  });

  it('correctly get the business information for a client', async () => {
    const mockResponse = [{
      name: 'asdf',
      cif: '49192919',
      address: 'asdf',
      postcode: '08015',
      city: 'Barcelona',
      country: 'Spain',
      telephone: '93328919',
      email: 'newbu22siness@gaymail.com',
      userId: 5,
    }];

    businessInfoRepository.find.mockResolvedValue(mockResponse);
    const result = await businessInfoService.getBusinessInfo(5);
    expect (result).toEqual(mockResponse[0]);
    expect(businessInfoRepository.find).toHaveBeenCalledWith({userId: 5});
  });

  it ('should return empty object on not found info', async () => {
    businessInfoRepository.find.mockResolvedValue([null]);
    const result = await businessInfoService.getBusinessInfo(5);
    expect (result).toEqual({});

  });

  it ('should successfully create new business info data', async () => {
    businessInfoRepository.insert.mockResolvedValue({});

    await expect(businessInfoService.createBusinessInfo(mockData, 5)).resolves.not.toThrow();
  });

  it('should return an error if trying to create with same email', async () => {
    businessInfoRepository.insert.mockRejectedValue({code: 'ER_DUP_ENTRY'});
    expect(businessInfoService.createBusinessInfo(mockData, 5)).rejects.toThrow(ConflictException);
  });
});
