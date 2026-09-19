import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SorteosController } from './controller/sorteos.controller';
import { SorteosRepository } from './repositories/sorteos.repository';
import { SorteosService } from './services/sorteos.service';
import { SorteosLiveService } from './services/sorteos-live.service';

import { ActasPdfService } from './services/actas-pdf.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [SorteosController],
  providers: [SorteosService, SorteosRepository, SorteosLiveService, ActasPdfService],
  exports: [SorteosService, SorteosRepository, SorteosLiveService, ActasPdfService],
})
export class SorteosModule {}
