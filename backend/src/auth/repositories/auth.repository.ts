import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCorreoInstitucional(correoInstitucional: string) {
    return this.prisma.usuario.findUnique({
      where: { correoInstitucional },
      include: {
        rol: true,
        carreras: {
          include: {
            carrera: true,
          },
        },
      },
    });
  }

  async findById(idUsuario: number) {
    return this.prisma.usuario.findUnique({
      where: { idUsuario },
      include: {
        rol: true,
        carreras: {
          include: {
            carrera: true,
          },
        },
      },
    });
  }
}
