import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AppService {
  // Simulando tabela de usuários no banco de dados
  private usersTable: any[] = [];

  constructor(private readonly jwtService: JwtService) {}

  //  Criação de Usuário
  async createUser(data: CreateUserDto) {
    const userExists = this.usersTable.find((u) => u.email === data.email);
    if (userExists) {
      return { error: 'E-mail já cadastrado no sistema.' };
    }

    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = {
      id: this.usersTable.length + 1,
      name: data.name,
      email: data.email,
      password: hashedPassword,
    };

    this.usersTable.push(newUser);

   
    const { password, ...result } = newUser;
    return result;
  }

  
  async login(data: LoginDto) {
    const user = this.usersTable.find((u) => u.email === data.email);
    if (!user) {
      return { error: 'Credenciais inválidas.' };
    }

    
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return { error: 'Credenciais inválidas.' };
    }

    
    const payload = { email: user.email, sub: user.id, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  //  Consulta de Usuários
  findAllUsers() {
    // Retorna a listagem omitindo as senhas criptografadas
    return this.usersTable.map(({ password, ...user }) => user);
  }
}