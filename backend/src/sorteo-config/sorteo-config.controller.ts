import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SorteoConfigService } from './sorteo-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sorteo-config')
export class SorteoConfigController {
  constructor(private sorteoConfigService: SorteoConfigService) {}

  @Get()
  findAll(@Request() req) {
    const user = req.user;
    if (user.rol === 'Jefe de Carrera') {
      return this.sorteoConfigService.findByCarrera(user.carreraId);
    }
    return this.sorteoConfigService.findAll();
  }

  @Get('carrera/:carreraId')
  findByCarrera(@Request() req, @Param('carreraId') carreraId: string) {
    const user = req.user;
    if (user.rol === 'Jefe de Carrera' && user.carreraId !== carreraId) {
      throw new ForbiddenException('No tiene acceso a la configuración de otra carrera');
    }
    return this.sorteoConfigService.findByCarrera(carreraId);
  }

  @Post()
  @Roles('Coordinador General')
  upsertConfig(@Body() body: any) {
    return this.sorteoConfigService.upsertConfig(body);
  }
}
