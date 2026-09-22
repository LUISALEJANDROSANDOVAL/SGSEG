import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ConfiguracionService } from '../services/configuracion.service';
import {
  CreateFacultadDto,
  CreateCarreraDto,
  CreateAreaAcademiaDto,
  CreatePensumDto,
} from '../dto/configuracion.dto';

@Controller('academia')
export class AcademiaController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get('carreras')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION', 'JEFE_CARRERA', 'SECRETARIADO')
  async getCarreras() {
    return this.configuracionService.getCarrerasConFacultad();
  }

  @Post('facultades')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO')
  async createFacultad(@Body() dto: CreateFacultadDto) {
    return this.configuracionService.createFacultad(dto);
  }

  @Put('facultades/:id')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO')
  async updateFacultad(
    @Param('id') id: string,
    @Body() dto: CreateFacultadDto,
  ) {
    return this.configuracionService.updateFacultad(id, dto);
  }

  @Post('carreras')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION')
  async createCarrera(@Body() dto: CreateCarreraDto) {
    return this.configuracionService.createCarrera(dto);
  }

  @Put('carreras/:id')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION')
  async updateCarrera(
    @Param('id') id: string,
    @Body() dto: CreateCarreraDto,
  ) {
    return this.configuracionService.updateCarrera(id, dto);
  }

  @Post('areas')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION', 'JEFE_CARRERA')
  async createArea(@Body() dto: CreateAreaAcademiaDto) {
    return this.configuracionService.createArea(dto);
  }

  @Put('areas/:id')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION', 'JEFE_CARRERA')
  async updateArea(
    @Param('id') id: string,
    @Body() dto: CreateAreaAcademiaDto,
  ) {
    return this.configuracionService.updateArea(id, dto);
  }

  @Post('pensums')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION', 'JEFE_CARRERA')
  async createPensum(@Body() dto: CreatePensumDto) {
    return this.configuracionService.createPensum(dto);
  }

  @Put('pensums/:id')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION', 'JEFE_CARRERA')
  async updatePensum(
    @Param('id') id: string,
    @Body() dto: CreatePensumDto,
  ) {
    return this.configuracionService.updatePensum(id, dto);
  }
}
