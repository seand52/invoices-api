import {Test} from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';

const mockProductsRepository = () => ({
  findOne: jest.fn(),
  insert: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});
describe('ProductsServices', () => {
  let productsService;
  let productsRepository;
  const mockProduct = {
    id: 5,
    description: 'test description',
    price: 29.99,
    userId: 5,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {provide: ProductsRepository, useFactory: mockProductsRepository},
      ],
    }).compile();

    productsService = await module.get<ProductsService>(ProductsService);
    productsRepository = await module.get<ProductsRepository>(ProductsRepository);
  });

  describe('getProductById', () => {
    it('calls productsRepository.findOne() and successfully retrieves the product', async () => {
      productsRepository.findOne.mockResolvedValue(mockProduct);
      const result = await productsService.getProductById(1);
      expect(result).toEqual(mockProduct);

      expect(productsRepository.findOne).toHaveBeenCalledWith(1);
    });

    it ('throws an error if the product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);
      expect(productsService.getProductById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Create products', () => {
    it('should successfully creates a product', async () => {
      productsRepository.insert.mockResolvedValue({
        identifiers: [
          mockProduct,
        ],
      });

      const result = await productsService.createProduct(mockProduct, 1);
      expect(result).toEqual(mockProduct.id);
      expect(productsRepository.insert).toHaveBeenCalledWith({...mockProduct, userId: 1});
    });

    it('should not duplicate a product', async () => {
      productsRepository.insert.mockRejectedValue({code: 'ER_DUP_ENTRY'});
      expect(productsService.createProduct(mockProduct, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('Delete product', () => {
    it('should successfully delete a product if the product belongs to that user', async () => {
      productsRepository.findOne.mockResolvedValue(mockProduct);
      expect(productsRepository.delete).not.toHaveBeenCalled();
      const result = await productsService.deleteProductById(mockProduct.id, 5);
      expect(result).toEqual('OK');
      expect(productsRepository.delete).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw error if no product is found with that id', async () => {
      productsRepository.findOne.mockResolvedValue(null);
      expect(productsService.deleteProductById(mockProduct.id, 5)).rejects.toThrow(NotFoundException);
    });

    it('should throw error if trying to delete a product of another user', async () => {
      productsRepository.findOne.mockResolvedValue(mockProduct);
      expect(productsService.deleteProductById(mockProduct.id, 1)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Update product', () => {
    const productData = {
      description: 'test updated description',
    };
    it('should successfully update a product if the product belongs to that user', async () => {
      productsRepository.findOne.mockResolvedValue(mockProduct);
      expect(productsRepository.update).not.toHaveBeenCalled();
      const result = await productsService.updateProductById(productData, mockProduct.id, 5);
      expect(result).toEqual('OK');
      expect(productsRepository.update).toHaveBeenCalledWith(mockProduct.id, productData);
    });

    it('should throw error if no product is found with that id', async () => {
      productsRepository.findOne.mockResolvedValue(null);
      expect(productsService.updateProductById(mockProduct.id, 5)).rejects.toThrow(NotFoundException);
      expect(productsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if trying to delete a product of another user', async () => {
      productsRepository.findOne.mockResolvedValue(mockProduct);
      expect(productsService.updateProductById(mockProduct.id, 1)).rejects.toThrow(UnauthorizedException);
      expect(productsRepository.update).not.toHaveBeenCalled();
    });
  });
});
