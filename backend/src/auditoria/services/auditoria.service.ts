import { Injectable } from '@nestjs/common';
import { AuditoriaRepository } from '../repositories/auditoria.repository';
import { CreateAuditoriaDto } from '../dto/create-auditoria.dto';
import { QueryAuditoriaDto } from '../dto/query-auditoria.dto';

@Injectable()
export class AuditoriaService {
  constructor(private readonly repository: AuditoriaRepository) {}

  async registrarEvento(dto: CreateAuditoriaDto) {
    return this.repository.create(dto);
  }

  async getAuditoriaLogs(query: QueryAuditoriaDto) {
    const { total, page, limit, items } =
      await this.repository.findManyWithFilters(query);

    const serializedItems = items.map((log) => {
      const usuarioNombre = log.usuario
        ? [log.usuario.primerNombre, log.usuario.primerApellido]
            .filter(Boolean)
            .join(' ')
        : 'Sistema / Proceso Automático';

      return {
        id: String(log.idRegistroAuditoria),
        idRegistroAuditoria: String(log.idRegistroAuditoria),
        fecha: log.fechaHora.toISOString(),
        fechaHora: log.fechaHora.toISOString(),
        tipoOperacion: log.tipoOperacion,
        accion: log.tipoOperacion,
        descripcion: log.descripcion,
        detalles: log.descripcion,
        motivo: log.motivo,
        idUsuario: log.idUsuario ? String(log.idUsuario) : null,
        usuario: usuarioNombre,
        correoUsuario: log.usuario?.correoInstitucional || null,
        rol: log.usuario?.rol?.nombre || 'Sistema',
        idCasoEstudio: log.idCasoEstudio ? String(log.idCasoEstudio) : null,
        casoTitulo: log.casoEstudio?.titulo || null,
        idDefensa: log.idDefensa ? String(log.idDefensa) : null,
        idSorteo: log.idSorteo ? String(log.idSorteo) : null,
        valorAnterior: log.valorAnterior,
        valorNuevo: log.valorNuevo,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / (limit || 50)),
      data: serializedItems,
    };
  }
}
