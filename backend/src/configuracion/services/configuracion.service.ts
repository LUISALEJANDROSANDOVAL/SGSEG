import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import {
  GuardarConfiguracionDto,
  CreateFacultadDto,
  CreateCarreraDto,
  CreateAreaAcademiaDto,
  CreatePensumDto,
} from '../dto/configuracion.dto';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ConfiguracionService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfiguracionByCarrera(carreraId: string) {
    const cId = BigInt(carreraId);

    const [casosConfig, areasConfig] = await Promise.all([
      this.prisma.configuracionSorteoCaso.findMany({
        where: { idCarrera: cId },
        include: { tipoDefensa: true },
      }),
      this.prisma.configuracionSorteoArea.findMany({
        where: { idCarrera: cId },
        include: { tipoDefensa: true },
      }),
    ]);

    const tipos = ['INTERNA', 'EXTERNA'];

    return tipos.map((tipo) => {
      const caso = casosConfig.find((c) => c.tipoDefensa.nombre === tipo);
      const area = areasConfig.find((a) => a.tipoDefensa.nombre === tipo);

      let unidadTiempo: 'HORAS' | 'DIAS_CALENDARIO' | 'DIAS_HABILES' = 'HORAS';
      if (caso?.unidadPlazo === 'DIAS') unidadTiempo = 'DIAS_CALENDARIO';
      else if (caso?.unidadPlazo === 'DIAS_HABILES') unidadTiempo = 'DIAS_HABILES';

      return {
        idCarrera: carreraId,
        carreraId: carreraId,
        tipoDefensa: tipo,
        mismoMomento: caso ? caso.anticipacion === 0 : true,
        anticipacionDefensa: caso?.anticipacion ?? (tipo === 'INTERNA' ? 24 : 168),
        plazoResolucion: caso?.plazoResolucion ?? (tipo === 'INTERNA' ? 48 : 168),
        unidadTiempo,
      };
    });
  }

  async guardarConfiguracion(dto: GuardarConfiguracionDto, user?: AuthenticatedUser) {
    const cId = BigInt(dto.carreraId);

    const tipoDefensa = await this.prisma.tipoDefensa.findFirst({
      where: { nombre: dto.tipoDefensa },
    });

    if (!tipoDefensa) {
      throw new NotFoundException(`Tipo de defensa ${dto.tipoDefensa} no encontrado`);
    }

    const unidad =
      dto.unidadTiempo === 'DIAS_CALENDARIO' || dto.unidadTiempo === 'DIAS_HABILES'
        ? 'DIAS'
        : 'HORAS';

    const anticipacion = dto.mismoMomento ? 0 : (dto.anticipacionDefensa ?? 24);
    const plazo = dto.plazoResolucion ?? 48;

    // Actualizar o crear configuración de caso
    const existingCaso = await this.prisma.configuracionSorteoCaso.findFirst({
      where: { idCarrera: cId, idTipoDefensa: tipoDefensa.idTipoDefensa },
    });

    if (existingCaso) {
      await this.prisma.configuracionSorteoCaso.update({
        where: { idConfigSorteoCaso: existingCaso.idConfigSorteoCaso },
        data: {
          anticipacion,
          unidadAnticipacion: unidad,
          plazoResolucion: plazo,
          unidadPlazo: unidad,
        },
      });
    } else {
      await this.prisma.configuracionSorteoCaso.create({
        data: {
          idCarrera: cId,
          idTipoDefensa: tipoDefensa.idTipoDefensa,
          orden: 2,
          anticipacion,
          unidadAnticipacion: unidad,
          plazoResolucion: plazo,
          unidadPlazo: unidad,
        },
      });
    }

    // Registrar en auditoría
    await this.prisma.registroAuditoria.create({
      data: {
        idUsuario: user ? BigInt(user.idUsuario) : null,
        tipoOperacion: 'CONFIGURACION_ACTUALIZADA',
        descripcion: `Actualización de reglas de sorteo para carrera ID ${dto.carreraId} y tipo ${dto.tipoDefensa}.`,
        valorNuevo: dto as any,
      },
    });

    return {
      success: true,
      message: 'Configuración guardada exitosamente.',
    };
  }

  async getCarrerasConFacultad() {
    const carreras = await this.prisma.carrera.findMany({
      include: {
        facultad: true,
        planesEstudio: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return carreras.map((c) => ({
      id: String(c.idCarrera),
      idCarrera: String(c.idCarrera),
      nombre: c.nombre,
      idFacultad: String(c.idFacultad),
      facultadId: String(c.idFacultad),
      facultad: {
        id: String(c.facultad.idFacultad),
        idFacultad: String(c.facultad.idFacultad),
        nombre: c.facultad.nombre,
      },
      planesEstudio: c.planesEstudio.map((p) => ({
        id: String(p.idPlanEstudio),
        idPlanEstudio: String(p.idPlanEstudio),
        nombre: p.nombre,
        estadoVigencia: p.estadoVigencia,
      })),
    }));
  }

  async createFacultad(dto: CreateFacultadDto) {
    const facultad = await this.prisma.facultad.create({
      data: { nombre: dto.nombre },
    });
    return {
      id: String(facultad.idFacultad),
      nombre: facultad.nombre,
    };
  }

  async updateFacultad(id: string, dto: CreateFacultadDto) {
    const facultad = await this.prisma.facultad.update({
      where: { idFacultad: BigInt(id) },
      data: { nombre: dto.nombre },
    });
    return {
      id: String(facultad.idFacultad),
      nombre: facultad.nombre,
    };
  }

  async createCarrera(dto: CreateCarreraDto) {
    const carrera = await this.prisma.carrera.create({
      data: {
        nombre: dto.nombre,
        idFacultad: BigInt(dto.facultadId),
      },
    });
    return {
      id: String(carrera.idCarrera),
      nombre: carrera.nombre,
    };
  }

  async updateCarrera(id: string, dto: CreateCarreraDto) {
    const carrera = await this.prisma.carrera.update({
      where: { idCarrera: BigInt(id) },
      data: {
        nombre: dto.nombre,
        idFacultad: BigInt(dto.facultadId),
      },
    });
    return {
      id: String(carrera.idCarrera),
      nombre: carrera.nombre,
    };
  }

  async createArea(dto: CreateAreaAcademiaDto) {
    const area = await this.prisma.areaAcademica.create({
      data: {
        nombre: dto.nombre,
        idCarrera: BigInt(dto.carreraId),
      },
    });

    if (dto.pensumIds && dto.pensumIds.length > 0) {
      await this.prisma.planArea.createMany({
        data: dto.pensumIds.map((pId) => ({
          idArea: area.idArea,
          idPlanEstudio: BigInt(pId),
        })),
      });
    }

    return {
      id: String(area.idArea),
      nombre: area.nombre,
    };
  }

  async updateArea(id: string, dto: CreateAreaAcademiaDto) {
    const aId = BigInt(id);
    const area = await this.prisma.areaAcademica.update({
      where: { idArea: aId },
      data: {
        nombre: dto.nombre,
        idCarrera: BigInt(dto.carreraId),
      },
    });

    if (dto.pensumIds) {
      await this.prisma.planArea.deleteMany({ where: { idArea: aId } });
      if (dto.pensumIds.length > 0) {
        await this.prisma.planArea.createMany({
          data: dto.pensumIds.map((pId) => ({
            idArea: aId,
            idPlanEstudio: BigInt(pId),
          })),
        });
      }
    }

    return {
      id: String(area.idArea),
      nombre: area.nombre,
    };
  }

  async createPensum(dto: CreatePensumDto) {
    const pensum = await this.prisma.planEstudio.create({
      data: {
        nombre: dto.nombre,
        idCarrera: BigInt(dto.carreraId),
      },
    });
    return {
      id: String(pensum.idPlanEstudio),
      nombre: pensum.nombre,
    };
  }

  async updatePensum(id: string, dto: CreatePensumDto) {
    const pensum = await this.prisma.planEstudio.update({
      where: { idPlanEstudio: BigInt(id) },
      data: {
        nombre: dto.nombre,
        idCarrera: BigInt(dto.carreraId),
      },
    });
    return {
      id: String(pensum.idPlanEstudio),
      nombre: pensum.nombre,
    };
  }
}
