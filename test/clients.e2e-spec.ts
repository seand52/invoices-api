import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as bycript from 'bcrypt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsRepository } from '../src/clients/clients.repository';
import { UserRespository } from '../src/users/users.repository';
import { Users } from 'src/users/users.entity';
import { ProductsRepository } from '../src/products/products.repository';
import { InvoicesRepository } from '../src/invoices/invoices.repository';
import { InvoiceToProductsRepository } from '../src/invoice-products/invoice-products.repository';
import {
  mockProducts,
  invoicesData,
  invoiceProductsData,
} from './mockResponses/clientResponses';
import { Connection, EntityManager } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let clientsRepository: ClientsRepository;
  let userRepository: UserRespository;
  let productsRepository: ProductsRepository;
  let invoicesRepository: InvoicesRepository;
  let invoicesProductsRepository: InvoiceToProductsRepository;
  let user: Users;
  let jwt: string;
  let clients;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306,
          username: 'pwho',
          password: '123456789',
          database: 'invoice_v2_tests',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    clientsRepository = await module.get<ClientsRepository>(ClientsRepository);
    userRepository = await module.get<UserRespository>(UserRespository);
    productsRepository = await module.get<ProductsRepository>(
      ProductsRepository,
    );
    invoicesRepository = await module.get<InvoicesRepository>(
      InvoicesRepository,
    );
    invoicesProductsRepository = await module.get<InvoiceToProductsRepository>(
      InvoiceToProductsRepository,
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
    clients = [
      {
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
        email: 'clientemail1@gmail.com',
        userId: user.id,
      },
      {
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
        email: 'clientemail2@gmail.com',
        userId: user.id,
      },
    ];
  });

  it('/ GET CLIENTS', async () => {
    await clientsRepository.save(clients);

    return request(app.getHttpServer())
      .get('/invoices?page=1&limit=3')
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200);
  });

  it(' / GET client by id', async () => {
    const [_client] = await clientsRepository.save(clients);
    return request(app.getHttpServer())
      .get(`/clients/${_client.id}`)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .expect(res => {
        res.body.id = _client.id;
        res.body.name = _client.name;
        res.body.shopName = _client.shopName;
        res.body.address = _client.address;
        res.body.city = _client.city;
        res.body.province = _client.province;
        res.body.postcode = _client.postcode;
        res.body.numNif = _client.numNif;
        res.body.numCif = _client.numCif;
        res.body.telephone1 = _client.telephone1;
        res.body.telephone2 = _client.telephone2;
        res.body.email = _client.email;
      });
  });

  it(' / DELETE Client', async () => {
    const [_client] = await clientsRepository.save(clients);
    console.log('================================================', _client);
    return request(app.getHttpServer())
      .delete(`/clients/${_client.id}`)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200);
  });

  it(' / POST Client', async () => {
    return request(app.getHttpServer())
      .post(`/clients`)
      .send({
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
        email: 'clientemail1@gmail.com',
        userId: user.id,
      })
      .set('Authorization', 'Bearer ' + jwt)
      .expect(201)
      .expect(res => {
        res.body.name = 'string';
        res.body.shopName = 'string';
        res.body.address = 'string';
        res.body.city = 'string';
        res.body.province = 'string';
        res.body.postcode = 'string';
        res.body.numNif = 'string';
        res.body.numCif = 'string';
        res.body.telephone1 = 'string';
        res.body.telephone2 = 'string';
        res.body.email = 'clientemail1@gmail.com';
        res.body.userId = user.id;
      });
  });

  it(' / PATCH Client', async () => {
    const [_client] = await clientsRepository.save(clients);
    return request(app.getHttpServer())
      .patch(`/clients/${_client.id}`)
      .send({
        name: 'NEW name',
        shopName: 'NEW shopName',
        address: 'NEW address',
        city: 'NEW city',
      })
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .expect(res => {
        res.body.name = 'NEW string';
        res.body.shopName = 'NEW shopName';
        res.body.address = 'NEW address';
        res.body.city = 'NEW city';
      });
  });

  it(' / GET client invoices', async () => {
    await clientsRepository.save(clients);
    const [client] = await clientsRepository.find({ userId: user.id });
    await productsRepository.save(
      mockProducts.map(item => ({
        ...item,
        userId: user.id,
      })),
    );
    const _products = await productsRepository.find({ userId: user.id });

    await invoicesRepository.save({
      ...invoicesData,
      clientId: client.id,
      userId: user.id,
    });
    const [invoice] = await invoicesRepository.find({ clientId: client.id });

    await invoicesProductsRepository.save(
      invoiceProductsData.map((item, index) => ({
        ...item,
        invoiceId: invoice.id,
        productId: _products[index].id,
      })),
    );

    return request(app.getHttpServer())
      .get(`/clients/${client.id}/invoices`)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .then(res => {
        expect(res.body.length).toEqual(1);
        const [clientInvoice] = res.body;
        expect(clientInvoice.id).toEqual(invoice.id);
        expect(clientInvoice.totalPrice.toString()).toEqual(
          invoice.totalPrice.toString(),
        );
        expect(clientInvoice.userId).toEqual(user.id);
      });
  });
  afterEach(async () => {
    await userRepository.query(`DELETE FROM users WHERE id=${user.id}`);
  });
  afterAll(async () => {
    // await userRepository.query('DELETE FROM users;');
    await clientsRepository.query('DELETE FROM clients;');
    await productsRepository.query('DELETE FROM products;');
    await productsRepository.query('DELETE FROM invoices;');
    await app.close();
  });
});
