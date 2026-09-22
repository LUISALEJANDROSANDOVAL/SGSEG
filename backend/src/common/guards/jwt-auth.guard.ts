import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/services/prisma.service';

interface JwtPayload {
  sub: string;
  correoInstitucional: string;
  rol: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    idUsuario: string;
    correoInstitucional: string;
    rol: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      const authHeader = request.headers.authorization;
      if (authHeader && typeof authHeader === 'string') {
        const [type, token] = authHeader.split(' ');
        if (type === 'Bearer' && token) {
          try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
              token,
              {
                secret: process.env.JWT_SECRET ?? 'sgseg-dev-secret',
              },
            );
            request.user = {
              idUsuario: payload.sub,
              correoInstitucional: payload.correoInstitucional,
              rol: payload.rol,
            };
          } catch {
            // Ruta pública: token opcional no bloqueante
          }
        }
      }
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'sgseg-dev-secret',
      });

      const userDb = await this.prisma.usuario.findUnique({
        where: { idUsuario: Number(payload.sub) },
        select: { estado: true },
      });

      if (!userDb || userDb.estado !== 'ACTIVO') {
        throw new UnauthorizedException(
          'Su cuenta ha sido desactivada o no está habilitada. Comuníquese con la administración.',
        );
      }

      request.user = {
        idUsuario: payload.sub,
        correoInstitucional: payload.correoInstitucional,
        rol: payload.rol,
      };

      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
