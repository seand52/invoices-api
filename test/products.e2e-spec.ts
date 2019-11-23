import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bycript from 'bcrypt';
import { Users } from 'src/users/users.entity';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ProductsRepository } from '../src/products/products.repository';
import { UserRespository } from '../src/users/users.repository';
import { mockProducts } from './mockResponses/clientResponses';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRespository;
  let productsRepository: ProductsRepository;
  let user: Users;
  let jwt: string;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    userRepository = await module.get<UserRespository>(UserRespository);
    productsRepository = await module.get<ProductsRepository>(
      ProductsRepository,
    );
  });

  beforeEach(async () => {
    const salt = await bycript.genSalt();
    const password = await bycript.hash('1234567', salt);
    const username = `seand52-${Math.random()}`;
    user = await userRepository.save({
      username,
      password,
      salt,
    });
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username, password: '1234567' })
      .expect(201);
    jwt = loginResponse.body.access_token;
  });

  it('/ GET products', async () => {
    const _products = mockProducts.map(item => ({
      ...item,
      userId: user.id,
    }));
    await productsRepository.save(_products);
    return request(app.getHttpServer())
      .get('/products?page=1&limit=3')
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .then(res => {
        expect(res.body.items.length).toEqual(3);
        expect(res.body.itemCount).toEqual(3);
        expect(res.body.totalItems).toEqual(4);
        expect(res.body.items[0].description).toEqual('product description 1');
        expect(res.body.items[0].price).toEqual('29.99');
      });
  });

  it('/ GET product info by id', async () => {
    const _products = mockProducts.map(item => ({
      ...item,
      userId: user.id,
    }));
    await productsRepository.save(_products);
    const [product] = await productsRepository.find({ userId: user.id });
    return request(app.getHttpServer())
      .get(`/products/${product.id}`)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .then(res => {
        expect(res.body instanceof Object).toBe(true);
        expect(res.body.id).toEqual(product.id);
        expect(res.body.description).toEqual(product.description);
        expect(res.body.price).toEqual(product.price);
      });
  });

  it('/ POST create product successfully ', async () => {
    const _product = {
      description: 'product description',
      userId: user.id,
      price: 29.99,
    };
    return request(app.getHttpServer())
      .post('/products')
      .send(_product)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(201)
      .then(res => {
        expect(res.body instanceof Object).toBe(true);
        expect(res.body.description).toEqual(_product.description);
        expect(res.body.price.toString()).toEqual(_product.price.toString());
        expect(res.body.userId).toEqual(_product.userId);
      });
  });

  it(' / DELETE product successfully', async () => {
    await productsRepository.save({
      description: 'product description',
      price: 29.99,
      userId: user.id,
    });

    const [product] = await productsRepository.find({ userId: user.id });
    return request(app.getHttpServer())
      .delete(`/products/${product.id}`)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200);
  });

  it('/ PATCH products successfully', async () => {
    await productsRepository.save({
      description: 'product description',
      price: 1.52,
      userId: user.id,
    });

    const [product] = await productsRepository.find({ userId: user.id });

    const updatedProductData = {
      price: 100.52,
    };
    return request(app.getHttpServer())
      .patch(`/products/${product.id}`)
      .send(updatedProductData)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .then(res => {
        expect(res.body instanceof Object).toBe(true);
        expect(res.body.price.toString()).toEqual(
          updatedProductData.price.toString(),
        );
      });
  });

  afterEach(async () => {
    await userRepository.query(`DELETE FROM USERS WHERE id =${user.id}`);
  });
  afterAll(async () => {
    await productsRepository.query('DELETE FROM products;');
    await app.close();
  });
});
