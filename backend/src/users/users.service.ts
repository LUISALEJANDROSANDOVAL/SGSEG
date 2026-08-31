import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      include: {
        carrera: {
          include: {
            facultad: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: { carrera: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { password, ...result } = user;
    return result;
  }

  async create(data: any) {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.usuario.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nombre: data.nombre,
        rol: data.rol,
        carreraId: data.carreraId || null,
        activo: data.activo !== undefined ? data.activo : true,
      },
    });
  }

  async update(id: string, data: any) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updateData: any = {
      nombre: data.nombre,
      rol: data.rol,
      carreraId: data.carreraId || null,
      activo: data.activo,
    };

    if (data.email) {
      const existing = await this.prisma.usuario.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('El correo ya está en uso');
      }
      updateData.email = data.email;
    }

    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
    });
  }

  async deactivate(id: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }
}
