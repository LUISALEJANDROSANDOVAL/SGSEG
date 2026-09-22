import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditoriaService } from '../services/auditoria.service';
import { QueryAuditoriaDto } from '../dto/query-auditoria.dto';

@Controller('auditoria')
@Roles('VICERRECTORADO', 'SUPER_ADMIN')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  async getAuditoria(@Query() query: QueryAuditoriaDto) {
    return this.auditoriaService.getAuditoriaLogs(query);
  }
}
