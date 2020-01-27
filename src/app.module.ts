import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { BusinessInfoModule } from './business-info/business-info.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        type: configService.get('DATABASE_TYPE') as 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migration/*.ts'],
        cli: {
          migrationsDir: 'migration',
        },
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ClientsModule,
    ProductsModule,
    BusinessInfoModule,
    InvoicesModule,
    SalesOrdersModule,
  ],
})
export class AppModule { }
