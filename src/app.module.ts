import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { BusinessInfoModule } from './business-info/business-info.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'pwho',
      password: '123456789',
      database: 'invoices_v2',
      entities: [__dirname + '/**/*.entity{.ts,.js}' ],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    ClientsModule,
    ProductsModule,
    BusinessInfoModule,
  ],
})
export class AppModule {}
