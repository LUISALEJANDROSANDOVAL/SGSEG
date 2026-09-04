import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CalificarDefensaDto,
  FilterDefensasDto,
  ProgramarDefensaDto,
  UpdateDefensaDto,
} from '../dto/defensas.dto';
import { DefensasService } from '../services/defensas.service';

@Controller('defensas')
export class DefensasController {
  constructor(private readonly defensasService: DefensasService) {}

  /**
   * Consulta el embudo de estados (Pipeline de postulantes).
   */
  @Get('embudo')
  @Roles(
    'COORDINACION',
    'VICERRECTORADO',
    'JEFE_CARRERA',
    'SECRETARIADO',
    'SUPER_ADMIN',
  )
  async getEmbudo(@CurrentUser() user: AuthenticatedUser) {
    return this.defensasService.getEmbudo(user);
  }

  /**
   * Consulta alertas operativas de postulantes próximos a defender sin sorteo.
   */
  @Get('alertas')
  @Roles(
    'COORDINACION',
    'VICERRECTORADO',
    'JEFE_CARRERA',
    'SECRETARIADO',
    'SUPER_ADMIN',
  )
  async getAlertas(
    @Query('dias') dias: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const diasNum = dias ? Number(dias) : 15;
    return this.defensasService.getAlertas(diasNum, user);
  }

  /**
   * Consulta el listado general / cronograma de defensas con filtros.
   */
  @Get()
  @Roles(
    'COORDINACION',
    'VICERRECTORADO',
    'JEFE_CARRERA',
    'SECRETARIADO',
    'SUPER_ADMIN',
  )
  async findAll(
    @Query() query: FilterDefensasDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.defensasService.findAll(query, user);
  }

  /**
   * Obtiene el detalle de una defensa con su historial de sorteos y plazos reglamentarios.
   */
  @Get(':id')
  @Roles(
    'COORDINACION',
    'VICERRECTORADO',
    'JEFE_CARRERA',
    'SECRETARIADO',
    'SUPER_ADMIN',
  )
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.defensasService.findById(id, user);
  }

  /**
   * Programa una nueva fecha de defensa para un estudiante.
   */
  @Post('programar')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async programar(
    @Body() dto: ProgramarDefensaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.defensasService.programarDefensa(dto, user);
  }

  /**
   * Actualiza los datos de una defensa.
   */
  @Put(':id')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDefensaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.defensasService.update(id, dto, user);
  }

  /**
   * Registra la calificación formal y dictamen del tribunal para una defensa.
   */
  @Put(':id/calificar')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  async calificar(
    @Param('id') id: string,
    @Body() dto: CalificarDefensaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.defensasService.calificarDefensa(id, dto, user);
  }
}
