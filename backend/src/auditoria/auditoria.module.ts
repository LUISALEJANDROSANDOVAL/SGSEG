import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaController } from './controller/auditoria.controller';
import { AuditoriaService } from './services/auditoria.service';
import { AuditoriaRepository } from './repositories/auditoria.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditoriaRepository],
  exports: [AuditoriaService, AuditoriaRepository],
})
export class AuditoriaModule {}
