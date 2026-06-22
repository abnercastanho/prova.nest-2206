import { Controller, Post, Get, Body, Inject, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@ApiTags('Autenticação & Usuários') // Grupo no Swagger
@Controller('auth')
export class AppController {
  constructor(
    @Inject('AUTH_MICROSERVICE') private readonly client: ClientProxy,
    private readonly appService: AppService,
  ) {}


  @Post('register')
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  async register(@Body() createUserDto: CreateUserDto) {
    // Envia o comando HTTP para ser processado no microsserviço via TCP
    const result = await firstValueFrom(this.client.send({ cmd: 'create_user' }, createUserDto));
    if (result.error) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Realizar autenticação (Login)' })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso, retorna o JWT.' })
  async login(@Body() loginDto: LoginDto) {
    // Requisito 1: Contém o método de autenticação
    const result = await firstValueFrom(this.client.send({ cmd: 'login_user' }, loginDto));
    if (result.error) {
      throw new HttpException(result.error, HttpStatus.UNAUTHORIZED);
    }
    return result;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // Exige o botão de cadeado do JWT no Swagger
  @ApiOperation({ summary: 'Consultar todos os usuários existentes (Requer Token JWT)' })
  async findAll() {
    const result = await firstValueFrom(this.client.send({ cmd: 'find_all_users' }, {}));
    return result;
  }

  @MessagePattern({ cmd: 'create_user' })
  handleCreateUser(@Payload() data: CreateUserDto) {
    return this.appService.createUser(data);
  }

  @MessagePattern({ cmd: 'login_user' })
  handleLogin(@Payload() data: LoginDto) {
    return this.appService.login(data);
  }

  @MessagePattern({ cmd: 'find_all_users' })
  handleFindAllUsers() {
    return this.appService.findAllUsers();
  }
}