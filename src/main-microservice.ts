import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module'; // Apenas um ponto ( . ) antes da barra
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001, // Porta onde o microsserviço vai escutar o Gateway
      },
    },
  );
  
  await app.listen();
  console.log('🤖 Microsserviço de Autenticação/Usuários rodando via TCP na porta 3001');
}
bootstrap();