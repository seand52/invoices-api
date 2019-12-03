import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  const options = new DocumentBuilder()
    .setTitle('Invoice Program API')
    .setDescription('The invoice program API for Valmiki')
    .setVersion('1.0')
    .setBasePath('api')
    .addBearerAuth('Authorization', 'header', 'bearer')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  await app.listen(3000);
}
bootstrap();
