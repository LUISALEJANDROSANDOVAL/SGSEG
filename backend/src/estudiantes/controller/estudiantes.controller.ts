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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  BulkEstudiantesInputDto,
  CreateEstudianteDto,
  FilterEstudiantesDto,
  UpdateEstudianteDto,
} from '../dto/estudiante.dto';
import { EstudiantesService } from '../services/estudiantes.service';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  /**
   * Obtiene la lista de carreras disponibles con sus planes para filtrado.
   */
  @Public()
  @Get('carreras')
  async getCarreras() {
    return this.estudiantesService.getCarreras();
  }

  /**
   * Endpoint para carga masiva transaccional e idempotente de estudiantes.
   */
  @Post('bulk-upsert')
  @Roles('COORDINACION', 'SECRETARIADO')
  @HttpCode(HttpStatus.OK)
  async bulkUpsert(@Body() dto: BulkEstudiantesInputDto) {
    return this.estudiantesService.bulkUpsertEstudiantes(dto);
  }

  /**
   * Creación individual o upsert de un estudiante.
   */
  @Post()
  @Roles('COORDINACION', 'SECRETARIADO')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEstudianteDto) {
    return this.estudiantesService.create(dto);
  }

  /**
   * Consulta paginada de estudiantes con soporte de filtros por carrera, plan y búsqueda.
   */
  @Public()
  @Get()
  async findAll(@Query() query: FilterEstudiantesDto) {
    return this.estudiantesService.findAll(query);
  }

  /**
   * Búsqueda de estudiante por carnet institucional.
   */
  @Public()
  @Get('carnet/:carnet')
  async findByCarnet(@Param('carnet') carnet: string) {
    return this.estudiantesService.findByCarnet(carnet);
  }

  /**
   * Búsqueda de estudiante por ID.
   */
  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.estudiantesService.findById(id);
  }

  /**
   * Actualización de datos de un estudiante.
   */
  @Put(':id')
  @Roles('COORDINACION', 'SECRETARIADO')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEstudianteDto,
  ) {
    return this.estudiantesService.update(id, dto);
  }

  /**
   * Soft-delete de un estudiante para preservar su historial y procesos académicos.
   */
  @Delete(':id')
  @Roles('COORDINACION')
  async softDelete(@Param('id') id: string) {
    return this.estudiantesService.softDelete(id);
  }

  /**
   * Restauración de un estudiante eliminado lógicamente.
   */
  @Patch(':id/restore')
  @Roles('COORDINACION')
  async restore(@Param('id') id: string) {
    return this.estudiantesService.restore(id);
  }
}
