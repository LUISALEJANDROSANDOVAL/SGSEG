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

  async updateEstado(idUsuario: number, estado: string) {
    return this.prisma.usuario.update({
      where: { idUsuario },
      data: { estado },
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

  async findRolByNombre(nombre: string) {
    return this.prisma.rol.findUnique({
      where: { nombre },
    });
  }

  async createUser(data: {
    primerNombre: string;
    segundoNombre?: string | null;
    primerApellido: string;
    segundoApellido?: string | null;
    correoInstitucional: string;
    passwordHash: string;
    idRol: bigint;
    estado?: string;
  }) {
    return this.prisma.usuario.create({
      data: {
        primerNombre: data.primerNombre,
        segundoNombre: data.segundoNombre ?? null,
        primerApellido: data.primerApellido,
        segundoApellido: data.segundoApellido ?? null,
        correoInstitucional: data.correoInstitucional,
        passwordHash: data.passwordHash,
        idRol: data.idRol,
        estado: data.estado ?? 'ACTIVO',
      },
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

  async updateUserFull(
    idUsuario: number,
    data: {
      primerNombre?: string;
      segundoNombre?: string | null;
      primerApellido?: string;
      segundoApellido?: string | null;
      correoInstitucional?: string;
      passwordHash?: string;
      idRol?: bigint;
      estado?: string;
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

  async assignCarrera(idUsuario: number, idCarrera: number) {
    await this.prisma.usuarioCarrera.deleteMany({
      where: { idUsuario: BigInt(idUsuario) },
    });
    return this.prisma.usuarioCarrera.create({
      data: {
        idUsuario: BigInt(idUsuario),
        idCarrera: BigInt(idCarrera),
      },
      include: {
        carrera: true,
      },
    });
  }
}


