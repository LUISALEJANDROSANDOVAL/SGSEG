import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello() {
    return {
      status: 'online',
      sistema: 'SGSEG - Sistema de Gestión de Graduación UTEPSA',
      apiPrefix: '/api',
      endpoints: {
        auth: '/api/auth/login',
        usuarios: '/api/usuarios',
        sorteos: '/api/sorteos',
        casos: '/api/casos',
        estudiantes: '/api/estudiantes',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'REGISTRO',
    'DEFENSA',
    'SUPER_ADMIN',
  )
  @Get('admin/dashboard')
  getAdminDashboard() {
    return {
      success: true,
      message: 'Dashboard administrativo disponible',
      rolesPermitidos: [
        'COORDINACION',
        'SECRETARIADO',
        'JEFE_CARRERA',
        'VICERRECTORADO',
        'REGISTRO',
        'DEFENSA',
        'SUPER_ADMIN',
      ],
    };
  }
}
