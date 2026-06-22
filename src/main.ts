import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Criação do app (que funcionará como nosso API Gateway)
  const app = await NestFactory.create(AppModule);

  // Requisito 2: Realizar a liberação do CORS
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Ativa validação global para os DTOs do Swagger
  app.useGlobalPipes(new ValidationPipe());

  // Requisito 3: Ter a documentação de todos os end-points (Swagger)
  const config = new DocumentBuilder()
    .setTitle('Prova NestJS - API Gateway')
    .setDescription('Endpoints de Login, Criação e Consulta de Usuários')
    .setVersion('1.0')
    .addBearerAuth() // Ativa o campo de Token JWT no Swagger
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // O Gateway vai rodar na porta 3000
  await app.listen(3000);
  console.log('🚀 API Gateway rodando em: http://localhost:3000');
  console.log('📖 Documentação Swagger em: http://localhost:3000/api/docs');
}
bootstrap();