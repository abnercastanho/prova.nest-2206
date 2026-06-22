import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // criacao do app com o modulo principal
  const app = await NestFactory.create(AppModule);

  // liberação do cors
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ativa a validacao de dados de entrada (DTOs) para todos os end-points
  app.useGlobalPipes(new ValidationPipe());

  // documentação do Swagger e endpoints de teste da API
  const config = new DocumentBuilder()
    .setTitle('Prova NestJS - API Gateway')
    .setDescription('Endpoints de Login, Criação e Consulta de Usuários')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);


  await app.listen(3000);
  console.log('API Gateway rodando em: http://localhost:3000');
  console.log('Documentação Swagger em: http://localhost:3000/api/docs');
}
bootstrap();