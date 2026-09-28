import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';

import { PrismaService } from './prisma/services/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('diagnostics')
  async getDiagnostics() {
    try {
      const start = Date.now();
      const userCount = await this.prisma.usuario.count();
      const elapsed = Date.now() - start;
      return {
        status: 'ok',
        databaseConnected: true,
        userCount,
        pingMs: elapsed,
        envVarsDetected: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          DATABASE_URL_DATABASE_URL: !!process.env.DATABASE_URL_DATABASE_URL,
          STORAGE_URL: !!process.env.STORAGE_URL,
          POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
        },
      };
    } catch (err: any) {
      return {
        status: 'error',
        databaseConnected: false,
        error: err.message,
        code: err.code,
      };
    }
  }

  @Public()
  @Get()
  getHello() {
    return {
      status: 'online',
      version: '1.0.2',
      databaseConfigured: !!(
        process.env.DATABASE_URL ||
        process.env.DATABASE_URL_DATABASE_URL ||
        process.env.DATABASE_URL_POSTGRES_URL ||
        process.env.STORAGE_URL ||
        process.env.POSTGRES_PRISMA_URL
      ),
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
