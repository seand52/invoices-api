import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bycript from 'bcrypt';
import { Users } from 'src/users/users.entity';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { BusinessInfoRepository } from '../src/business-info/business-info.repository';
import { UserRespository } from '../src/users/users.repository';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRespository;
  let businessInfoRepository: BusinessInfoRepository;
  let user: Users;
  let jwt: string;
  const businessInfo = {
    name: 'Company name',
    cif: '47182818G',
    address: 'calle test',
    postcode: '08001',
    city: 'Barcelona',
    country: 'Spain',
    telephone: '933281828',
    email: 'companyemail@gmail.com',
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    businessInfoRepository = await module.get<BusinessInfoRepository>(
      BusinessInfoRepository,
    );
    userRepository = await module.get<UserRespository>(UserRespository);
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
    await businessInfoRepository.query('DELETE FROM business_info;');
  });

  it('/ GET business info successfully', async () => {
    const company = await businessInfoRepository.save({
      ...businessInfo,
      userId: user.id,
    });

    return request(app.getHttpServer())
      .get(`/business-info`)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .then(res => {
        expect(res.body instanceof Object).toBe(true);
        expect(res.body.name).toEqual(company.name);
        expect(res.body.cif).toEqual(company.cif);
        expect(res.body.address).toEqual(company.address);
        expect(res.body.postcode).toEqual(company.postcode);
        expect(res.body.city).toEqual(company.city);
        expect(res.body.country).toEqual(company.country);
        expect(res.body.telephone).toEqual(company.telephone);
        expect(res.body.telephone).toEqual(company.telephone);
        expect(res.body.email).toEqual(company.email);
      });
  });

  it('/ POST should create business info successfully', async () => {
    return request(app.getHttpServer())
      .post(`/business-info`)
      .send(businessInfo)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(201)
      .then(res => {
        expect(res.body instanceof Object).toBe(true);
        expect(res.body.name).toEqual(businessInfo.name);
        expect(res.body.cif).toEqual(businessInfo.cif);
        expect(res.body.address).toEqual(businessInfo.address);
        expect(res.body.postcode).toEqual(businessInfo.postcode);
        expect(res.body.city).toEqual(businessInfo.city);
        expect(res.body.country).toEqual(businessInfo.country);
        expect(res.body.telephone).toEqual(businessInfo.telephone);
        expect(res.body.telephone).toEqual(businessInfo.telephone);
        expect(res.body.email).toEqual(businessInfo.email);
      });
  });

  it('/ PATCH should modify business info successfully', async () => {
    const company = await businessInfoRepository.save({
      ...businessInfo,
      userId: user.id,
    });
    const newInfo = {
      address: 'new address',
      country: 'new country',
    };

    return request(app.getHttpServer())
      .patch(`/business-info`)
      .send(newInfo)
      .set('Authorization', 'Bearer ' + jwt)
      .expect(200)
      .then(res => {
        expect(res.body instanceof Object).toBe(true);
        expect(res.body.name).toEqual(businessInfo.name);
        expect(res.body.cif).toEqual(businessInfo.cif);
        expect(res.body.address).toEqual(newInfo.address);
        expect(res.body.postcode).toEqual(businessInfo.postcode);
        expect(res.body.city).toEqual(businessInfo.city);
        expect(res.body.country).toEqual(newInfo.country);
        expect(res.body.telephone).toEqual(businessInfo.telephone);
        expect(res.body.telephone).toEqual(businessInfo.telephone);
        expect(res.body.email).toEqual(businessInfo.email);
      });
  });

  afterEach(async () => {
    await userRepository.query(`DELETE FROM users WHERE id=${user.id}`);
  });

  afterAll(async () => {
    await businessInfoRepository.query('DELETE FROM business_info;');
    await app.close();
  });
});
