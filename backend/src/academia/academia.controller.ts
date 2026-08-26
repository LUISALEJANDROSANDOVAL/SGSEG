import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AcademiaService } from './academia.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academia')
export class AcademiaController {
  constructor(private academiaService: AcademiaService) {}

  // --- FACULTADES ---
  @Get('facultades')
  getFacultades() {
    return this.academiaService.getFacultades();
  }

  @Post('facultades')
  @Roles('Coordinador General', 'Secretario de Facultad')
  createFacultad(@Body() body: any) {
    return this.academiaService.createFacultad(body);
  }

  @Put('facultades/:id')
  @Roles('Coordinador General', 'Secretario de Facultad')
  updateFacultad(@Param('id') id: string, @Body() body: any) {
    return this.academiaService.updateFacultad(id, body);
  }

  // --- CARRERAS ---
  @Get('carreras')
  getCarreras(@Request() req) {
    const user = req.user;
    const scope = user.rol === 'Jefe de Carrera' ? user.carreraId : undefined;
    return this.academiaService.getCarreras(scope);
  }

  @Post('carreras')
  @Roles('Coordinador General', 'Secretario de Facultad')
  createCarrera(@Body() body: any) {
    return this.academiaService.createCarrera(body);
  }

  @Put('carreras/:id')
  @Roles('Coordinador General', 'Secretario de Facultad')
  updateCarrera(@Param('id') id: string, @Body() body: any) {
    return this.academiaService.updateCarrera(id, body);
  }

  // --- AREAS ACADEMICAS ---
  @Get('areas')
  getAreas(@Request() req) {
    const user = req.user;
    const scope = user.rol === 'Jefe de Carrera' ? user.carreraId : undefined;
    return this.academiaService.getAreas(scope);
  }

  @Post('areas')
  @Roles('Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera')
  createArea(@Request() req, @Body() body: any) {
    const user = req.user;
    if (user.rol === 'Jefe de Carrera' && body.carreraId !== user.carreraId) {
      throw new ForbiddenException('No tiene permisos para agregar áreas a otra carrera');
    }
    return this.academiaService.createArea(body);
  }

  @Put('areas/:id')
  @Roles('Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera')
  updateArea(@Request() req, @Param('id') id: string, @Body() body: any) {
    const user = req.user;
    if (user.rol === 'Jefe de Carrera' && body.carreraId !== user.carreraId) {
      throw new ForbiddenException('No tiene permisos para modificar áreas en otra carrera');
    }
    return this.academiaService.updateArea(id, body);
  }

  // --- PENSUMS ---
  @Get('pensums')
  getPensums(@Request() req) {
    const user = req.user;
    const scope = user.rol === 'Jefe de Carrera' ? user.carreraId : undefined;
    return this.academiaService.getPensums(scope);
  }

  @Post('pensums')
  @Roles('Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera')
  createPensum(@Request() req, @Body() body: any) {
    const user = req.user;
    if (user.rol === 'Jefe de Carrera' && body.carreraId !== user.carreraId) {
      throw new ForbiddenException('No tiene permisos para agregar planes a otra carrera');
    }
    return this.academiaService.createPensum(body);
  }

  @Put('pensums/:id')
  @Roles('Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera')
  updatePensum(@Request() req, @Param('id') id: string, @Body() body: any) {
    const user = req.user;
    if (user.rol === 'Jefe de Carrera' && body.carreraId !== user.carreraId) {
      throw new ForbiddenException('No tiene permisos para modificar planes en otra carrera');
    }
    return this.academiaService.updatePensum(id, body);
  }
}
