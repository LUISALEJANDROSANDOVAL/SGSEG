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

  async updateProfile(
    idUsuario: number,
    data: {
      primerNombre?: string;
      segundoNombre?: string | null;
      primerApellido?: string;
      segundoApellido?: string | null;
      correoInstitucional?: string;
    },
  ) {
    return this.prisma.usuario.update({
      where: { idUsuario },
      data,
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

  async updatePassword(idUsuario: number, passwordHash: string) {
    return this.prisma.usuario.update({
      where: { idUsuario },
      data: { passwordHash },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      include: {
        rol: true,
        carreras: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: { idUsuario: 'asc' },
    });
  }
}

