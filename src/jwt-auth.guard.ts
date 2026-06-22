import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido ou inválido.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload; // Salva os dados do usuário na requisição
      return true;
    } catch {
      throw new UnauthorizedException('Token expirado ou inválido.');
    }
  }
}