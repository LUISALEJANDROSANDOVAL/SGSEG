import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { CreateAuditoriaDto } from '../dto/create-auditoria.dto';
import { QueryAuditoriaDto } from '../dto/query-auditoria.dto';

@Injectable()
export class AuditoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditoriaDto) {
    return this.prisma.registroAuditoria.create({
      data: {
        idUsuario: dto.idUsuario ? BigInt(dto.idUsuario) : null,
        idCasoEstudio: dto.idCasoEstudio ? BigInt(dto.idCasoEstudio) : null,
        idSorteo: dto.idSorteo ? BigInt(dto.idSorteo) : null,
        idProceso: dto.idProceso ? BigInt(dto.idProceso) : null,
        idInstancia: dto.idInstancia ? BigInt(dto.idInstancia) : null,
        idDefensa: dto.idDefensa ? BigInt(dto.idDefensa) : null,
        idEnvio: dto.idEnvio ? BigInt(dto.idEnvio) : null,
        tipoOperacion: dto.tipoOperacion,
        descripcion: dto.descripcion,
        motivo: dto.motivo ?? null,
        valorAnterior: dto.valorAnterior as any,
        valorNuevo: dto.valorNuevo as any,
      },
    });
  }

  async findManyWithFilters(query: QueryAuditoriaDto) {
    const where: any = {};

    if (query.tipoOperacion && query.tipoOperacion !== 'TODAS') {
      where.tipoOperacion = query.tipoOperacion;
    }

    if (query.idUsuario) {
      const numId = Number(query.idUsuario);
      if (!isNaN(numId)) {
        where.idUsuario = BigInt(numId);
      }
    }

    if (query.fechaInicio || query.fechaFin) {
      where.fechaHora = {};
      if (query.fechaInicio) {
        where.fechaHora.gte = new Date(query.fechaInicio);
      }
      if (query.fechaFin) {
        const fin = new Date(query.fechaFin);
        fin.setHours(23, 59, 59, 999);
        where.fechaHora.lte = fin;
      }
    }

    if (query.search) {
      where.OR = [
        { descripcion: { contains: query.search, mode: 'insensitive' } },
        { tipoOperacion: { contains: query.search, mode: 'insensitive' } },
        { motivo: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 50;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.registroAuditoria.count({ where }),
      this.prisma.registroAuditoria.findMany({
        where,
        take: limit,
        skip,
        orderBy: { fechaHora: 'desc' },
        include: {
          usuario: {
            select: {
              idUsuario: true,
              primerNombre: true,
              primerApellido: true,
              correoInstitucional: true,
              rol: {
                select: {
                  nombre: true,
                },
              },
            },
          },
          casoEstudio: {
            select: {
              idCasoEstudio: true,
              titulo: true,
            },
          },
        },
      }),
    ]);

    return { total, page, limit, items };
  }
}
