import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ConfiguracionService } from '../services/configuracion.service';
import { GuardarConfiguracionDto } from '../dto/configuracion.dto';

@Controller('sorteo-config')
export class SorteoConfigController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get('carrera/:idCarrera')
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION', 'JEFE_CARRERA', 'SECRETARIADO')
  async getConfiguracion(@Param('idCarrera') idCarrera: string) {
    return this.configuracionService.getConfiguracionByCarrera(idCarrera);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles('SUPER_ADMIN', 'VICERRECTORADO', 'COORDINACION')
  async guardarConfiguracion(
    @Body() dto: GuardarConfiguracionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.configuracionService.guardarConfiguracion(dto, user);
  }
}
