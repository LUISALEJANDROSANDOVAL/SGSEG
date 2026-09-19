import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { FilterDashboardEjecutivoDto } from '../dto/reportes-dashboard.dto';
import { ReportesService } from '../services/reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Endpoint de analítica y métricas ejecutivas para Vicerrectorado, Coordinación y Jefaturas.
   * Provee contadores consolidados de casos disponibles, stock crítico, defensas concluidas
   * y postulantes en pipeline con filtros por facultad, carrera o período.
   */
  @Get('dashboard-ejecutivo')
  @Roles(
    'VICERRECTORADO',
    'SUPER_ADMIN',
    'COORDINACION',
    'JEFE_CARRERA',
    'SECRETARIADO',
    'REGISTRO',
    'DEFENSA',
  )
  async getDashboardEjecutivo(
    @Query() dto: FilterDashboardEjecutivoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportesService.getDashboardEjecutivo(dto, user);
  }
}
