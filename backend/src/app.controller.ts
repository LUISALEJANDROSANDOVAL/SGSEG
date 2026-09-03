import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA')
  @Get('admin/dashboard')
  getAdminDashboard() {
    return {
      success: true,
      message: 'Dashboard administrativo disponible',
      rolesPermitidos: ['COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA'],
    };
  }
}
