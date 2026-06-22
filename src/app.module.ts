import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // Configuração do JWT (Método de Autenticação)
    JwtModule.register({
      secret: 'PROVA_NEST_SECRET_KEY_2026', // Chave secreta para assinar o token
      signOptions: { expiresIn: '1h' },    // Tempo de expiração do token
    }),

    //  Registro do cliente do Microsserviço via TCP
    ClientsModule.register([
      {
        name: 'AUTH_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}