import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademiaService {
  constructor(private prisma: PrismaService) {}

  // --- FACULTADES ---
  async getFacultades() {
    return this.prisma.facultad.findMany({
      include: { carreras: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createFacultad(data: any) {
    return this.prisma.facultad.create({
      data: { nombre: data.nombre },
    });
  }

  async updateFacultad(id: string, data: any) {
    return this.prisma.facultad.update({
      where: { id },
      data: { nombre: data.nombre },
    });
  }

  // --- CARRERAS ---
  async getCarreras(carreraIdScope?: string) {
    if (carreraIdScope) {
      return this.prisma.carrera.findMany({
        where: { id: carreraIdScope },
        include: { facultad: true },
      });
    }
    return this.prisma.carrera.findMany({
      include: { facultad: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createCarrera(data: any) {
    return this.prisma.carrera.create({
      data: {
        nombre: data.nombre,
        facultadId: data.facultadId,
      },
    });
  }

  async updateCarrera(id: string, data: any) {
    return this.prisma.carrera.update({
      where: { id },
      data: {
        nombre: data.nombre,
        facultadId: data.facultadId,
      },
    });
  }

  // --- AREAS ACADEMICAS ---
  async getAreas(carreraIdScope?: string) {
    return this.prisma.areaAcademica.findMany({
      where: carreraIdScope ? { carreraId: carreraIdScope } : undefined,
      include: {
        carrera: true,
        pensums: {
          include: { pensum: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async createArea(data: any) {
    const area = await this.prisma.areaAcademica.create({
      data: {
        nombre: data.nombre,
        carreraId: data.carreraId,
      },
    });

    if (data.pensumIds && Array.isArray(data.pensumIds)) {
      await this.prisma.areaPensum.createMany({
        data: data.pensumIds.map((pId: string) => ({
          areaId: area.id,
          pensumId: pId,
        })),
      });
    }

    return this.prisma.areaAcademica.findUnique({
      where: { id: area.id },
      include: { pensums: true },
    });
  }

  async updateArea(id: string, data: any) {
    const area = await this.prisma.areaAcademica.findUnique({ where: { id } });
    if (!area) {
      throw new NotFoundException('Área académica no encontrada');
    }

    // Actualizar nombre y carrera
    await this.prisma.areaAcademica.update({
      where: { id },
      data: {
        nombre: data.nombre,
        carreraId: data.carreraId,
      },
    });

    // Actualizar vinculaciones con pensums (borrar anteriores e insertar nuevas)
    if (data.pensumIds && Array.isArray(data.pensumIds)) {
      await this.prisma.areaPensum.deleteMany({ where: { areaId: id } });
      await this.prisma.areaPensum.createMany({
        data: data.pensumIds.map((pId: string) => ({
          areaId: id,
          pensumId: pId,
        })),
      });
    }

    return this.prisma.areaAcademica.findUnique({
      where: { id },
      include: { pensums: true },
    });
  }

  // --- PENSUMS / PLANES DE ESTUDIO ---
  async getPensums(carreraIdScope?: string) {
    return this.prisma.pensum.findMany({
      where: carreraIdScope ? { carreraId: carreraIdScope } : undefined,
      include: {
        carrera: true,
        areas: {
          include: { area: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async createPensum(data: any) {
    return this.prisma.pensum.create({
      data: {
        nombre: data.nombre,
        carreraId: data.carreraId,
      },
    });
  }

  async updatePensum(id: string, data: any) {
    return this.prisma.pensum.update({
      where: { id },
      data: {
        nombre: data.nombre,
        carreraId: data.carreraId,
      },
    });
  }
}
