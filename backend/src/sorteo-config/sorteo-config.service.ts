import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SorteoConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.configSorteo.findMany({
      include: { carrera: true },
    });
  }

  async findByCarrera(carreraId: string) {
    return this.prisma.configSorteo.findMany({
      where: { carreraId },
      include: { carrera: true },
    });
  }

  async upsertConfig(data: any) {
    // Buscar si ya existe la configuración para esta carrera y tipo de defensa
    const existing = await this.prisma.configSorteo.findFirst({
      where: {
        carreraId: data.carreraId,
        tipoDefensa: data.tipoDefensa,
      },
    });

    if (existing) {
      return this.prisma.configSorteo.update({
        where: { id: existing.id },
        data: {
          mismoMomento: data.mismoMomento,
          anticipacionDefensa: Number(data.anticipacionDefensa),
          plazoResolucion: Number(data.plazoResolucion),
          unidadTiempo: data.unidadTiempo,
        },
      });
    } else {
      return this.prisma.configSorteo.create({
        data: {
          carreraId: data.carreraId,
          tipoDefensa: data.tipoDefensa,
          mismoMomento: data.mismoMomento,
          anticipacionDefensa: Number(data.anticipacionDefensa),
          plazoResolucion: Number(data.plazoResolucion),
          unidadTiempo: data.unidadTiempo,
        },
      });
    }
  }
}
