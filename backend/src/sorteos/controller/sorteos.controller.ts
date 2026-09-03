import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  FilterSorteosDto,
  SortearAreaDto,
  SortearCasoDto,
  SorteoConjuntoDto,
} from '../dto/sorteos.dto';
import { SorteosService } from '../services/sorteos.service';

@Controller('sorteos')
export class SorteosController {
  constructor(private readonly sorteosService: SorteosService) {}

  /**
   * Ejecuta el sorteo digital de Área Temática mediante CSPRNG.
   */
  @Post('area')
  @Roles(
    'SECRETARIADO',
    'JEFE_CARRERA',
    'COORDINACION',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  @HttpCode(HttpStatus.CREATED)
  async sortearArea(
    @Body() dto: SortearAreaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sortearArea(dto, user);
  }

  /**
   * Ejecuta el sorteo digital de Caso de Estudio dentro del área asignada.
   */
  @Post('caso')
  @Roles(
    'SECRETARIADO',
    'JEFE_CARRERA',
    'COORDINACION',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  @HttpCode(HttpStatus.CREATED)
  async sortearCaso(
    @Body() dto: SortearCasoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sortearCaso(dto, user);
  }

  /**
   * Ejecuta el sorteo conjunto anticipado de Área y Caso (FCT y Psicología).
   */
  @Post('conjunto')
  @Roles(
    'SECRETARIADO',
    'JEFE_CARRERA',
    'COORDINACION',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  @HttpCode(HttpStatus.CREATED)
  async sorteoConjunto(
    @Body() dto: SorteoConjuntoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sorteoConjunto(dto, user);
  }

  /**
   * Consulta el historial general de sorteos ejecutados.
   */
  @Get()
  @Roles(
    'SECRETARIADO',
    'JEFE_CARRERA',
    'COORDINACION',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async findHistorial(
    @Query() query: FilterSorteosDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.findHistorial(query, user);
  }

  /**
   * Obtiene el detalle y acta formal de un sorteo por ID.
   */
  @Get(':id')
  @Roles(
    'SECRETARIADO',
    'JEFE_CARRERA',
    'COORDINACION',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.findSorteoById(id, user);
  }
}
