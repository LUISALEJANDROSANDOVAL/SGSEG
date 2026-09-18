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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  BulkEstudiantesInputDto,
  CreateEstudianteDto,
  FilterEstudiantesDto,
  UpdateEstudianteDto,
} from '../dto/estudiante.dto';
import { EstudiantesService } from '../services/estudiantes.service';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  /**
   * Obtiene la lista de carreras disponibles con sus planes para filtrado.
   */
  @Get('carreras')
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'REGISTRO',
    'DEFENSA',
    'SUPER_ADMIN',
  )
  async getCarreras(@CurrentUser() user?: AuthenticatedUser) {
    return this.estudiantesService.getCarreras(user);
  }

  /**
   * Endpoint para carga masiva de estudiantes mediante archivo Excel/CSV.
   */
  @Post('importar')
  @Roles('COORDINACION', 'SECRETARIADO', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importarDesdeArchivo(@UploadedFile() file: any) {
    return this.estudiantesService.importarEstudiantesDesdeArchivo(file);
  }

  /**
   * Endpoint para carga masiva transaccional e idempotente de estudiantes.
   * Vicerrectorado bloqueado.
   */
  @Post('bulk-upsert')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async bulkUpsert(
    @Body() dto: BulkEstudiantesInputDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.bulkUpsertEstudiantes(dto, user);
  }

  /**
   * Creación individual o upsert de un estudiante.
   * Vicerrectorado bloqueado.
   */
  @Post()
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateEstudianteDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.create(dto, user);
  }

  /**
   * Consulta paginada de estudiantes con soporte de filtros por carrera, plan y búsqueda.
   */
  @Get()
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'REGISTRO',
    'DEFENSA',
    'SUPER_ADMIN',
  )
  async findAll(
    @Query() query: FilterEstudiantesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.findAll(query, user);
  }

  /**
   * Búsqueda de estudiante por carnet institucional (Protegido por JWT y roles).
   */
  @Get('carnet/:carnet')
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async findByCarnet(
    @Param('carnet') carnet: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.findByCarnet(carnet, user);
  }

  /**
   * Búsqueda de estudiante por ID (Protegido por JWT y roles).
   */
  @Get(':id')
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async findById(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.findById(id, user);
  }

  /**
   * Actualización de datos de un estudiante.
   * Vicerrectorado bloqueado.
   */
  @Put(':id')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEstudianteDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.update(id, dto, user);
  }

  /**
   * Soft-delete de un estudiante para preservar su historial y procesos académicos.
   * Vicerrectorado bloqueado.
   */
  @Delete(':id')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.softDelete(id, user);
  }

  /**
   * Restauración de un estudiante eliminado lógicamente.
   * Vicerrectorado bloqueado.
   */
  @Patch(':id/restore')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.estudiantesService.restore(id, user);
  }
}
