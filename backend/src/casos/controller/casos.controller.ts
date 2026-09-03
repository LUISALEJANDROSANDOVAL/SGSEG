import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateAreaDto,
  CreateCasoDto,
  FilterCasosDto,
  UpdateCasoDto,
} from '../dto/casos.dto';
import { CasosService } from '../services/casos.service';

@Controller('casos')
export class CasosController {
  constructor(private readonly casosService: CasosService) {}

  /**
   * Obtiene las métricas generales de inventario y alertas de stock crítico.
   */
  @Get('metricas')
  @Roles(
    'JEFE_CARRERA',
    'COORDINACION',
    'SECRETARIADO',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async getMetricas(
    @Query('idCarrera') idCarrera: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.getMetricas(idCarrera, user);
  }

  /**
   * Obtiene la lista de áreas académicas vigentes filtradas para el usuario.
   */
  @Get('areas')
  @Roles(
    'JEFE_CARRERA',
    'COORDINACION',
    'SECRETARIADO',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async getAreas(
    @Query('idCarrera') idCarrera: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.getAreas(idCarrera, user);
  }

  /**
   * Registra una nueva área académica para la carrera.
   */
  @Post('areas')
  @Roles('JEFE_CARRERA', 'COORDINACION')
  @HttpCode(HttpStatus.CREATED)
  async createArea(
    @Body() dto: CreateAreaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.createArea(dto, user);
  }

  /**
   * Consulta el inventario paginado de casos de estudio con filtros.
   */
  @Get()
  @Roles(
    'JEFE_CARRERA',
    'COORDINACION',
    'SECRETARIADO',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async findAll(
    @Query() query: FilterCasosDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.findAll(query, user);
  }

  /**
   * Obtiene el detalle de un caso específico.
   */
  @Get(':id')
  @Roles(
    'JEFE_CARRERA',
    'COORDINACION',
    'SECRETARIADO',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.findById(id, user);
  }

  /**
   * Registra un nuevo caso de estudio.
   */
  @Post()
  @Roles('JEFE_CARRERA', 'COORDINACION', 'SECRETARIADO')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCasoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.create(dto, user);
  }

  /**
   * Actualiza el planteamiento, título o área de un caso.
   */
  @Put(':id')
  @Roles('JEFE_CARRERA', 'COORDINACION')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCasoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.update(id, dto, user);
  }

  /**
   * Alterna el estado del caso (DISPONIBLE / INACTIVO).
   */
  @Patch(':id/estado')
  @Roles('JEFE_CARRERA', 'COORDINACION')
  async toggleEstado(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.toggleEstado(id, user);
  }

  /**
   * Soft-delete / inactivación de un caso de estudio.
   */
  @Delete(':id')
  @Roles('JEFE_CARRERA', 'COORDINACION')
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casosService.toggleEstado(id, user);
  }
}
