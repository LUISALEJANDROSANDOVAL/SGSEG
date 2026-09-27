import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCorreoInstitucional(correoInstitucional: string) {
    const emailNorm = correoInstitucional.trim().toLowerCase();
    let user = await this.prisma.usuario.findUnique({
      where: { correoInstitucional: emailNorm },
      include: {
        rol: true,
        carreras: {
          include: {
            carrera: true,
          },
        },
      },
    });

    if (user) return user;

    // Fallback para variantes y dominios @utepsa.edu.bo / @uni.edu.bo
    const aliases: Record<string, string> = {
      'coordinador@utepsa.edu.bo': 'coord@uni.edu.bo',
      'coordinacion@utepsa.edu.bo': 'coord@uni.edu.bo',
      'coord@utepsa.edu.bo': 'coord@uni.edu.bo',
      'coordinador@uni.edu.bo': 'coord@uni.edu.bo',
      'secretaria@utepsa.edu.bo': 'secretaria@uni.edu.bo',
      'secretario@utepsa.edu.bo': 'secretaria@uni.edu.bo',
      'secretariado@utepsa.edu.bo': 'secretaria@uni.edu.bo',
      'admin@utepsa.edu.bo': 'admin@uni.edu.bo',
      'vicerrector@utepsa.edu.bo': 'vicerrector@uni.edu.bo',
    };

    const targetEmail =
      aliases[emailNorm] ||
      (emailNorm.endsWith('@utepsa.edu.bo')
        ? emailNorm.replace('@utepsa.edu.bo', '@uni.edu.bo')
        : emailNorm.endsWith('@uni.edu.bo')
        ? emailNorm.replace('@uni.edu.bo', '@utepsa.edu.bo')
        : null);

    if (targetEmail && targetEmail !== emailNorm) {
      user = await this.prisma.usuario.findUnique({
        where: { correoInstitucional: targetEmail },
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

    return user;
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


