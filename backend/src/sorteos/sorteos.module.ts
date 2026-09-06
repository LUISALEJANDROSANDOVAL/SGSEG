import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SorteosController } from './controller/sorteos.controller';
import { SorteosRepository } from './repositories/sorteos.repository';
import { SorteosService } from './services/sorteos.service';
import { SorteosLiveService } from './services/sorteos-live.service';

@Module({
  imports: [PrismaModule],
  controllers: [SorteosController],
  providers: [SorteosService, SorteosRepository, SorteosLiveService],
  exports: [SorteosService, SorteosRepository, SorteosLiveService],
})
export class SorteosModule {}
