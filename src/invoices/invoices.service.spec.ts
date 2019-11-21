import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { ClientsRepository } from '../clients/clients.repository';
import { InvoicesRepository } from './invoices.repository';
import { ProductsRepository } from '../products/products.repository';

const mockClientsRepository = () => ({});

const mockInvoicesRepository = () => ({});

const mockProductsRepository = () => ({});
describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: ClientsRepository, useFactory: mockClientsRepository },
        { provide: InvoicesRepository, useFactory: mockInvoicesRepository },
        { provide: ProductsRepository, useFactory: mockProductsRepository },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
