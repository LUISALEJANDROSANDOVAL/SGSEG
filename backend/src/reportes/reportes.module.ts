import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportesController } from './controller/reportes.controller';
import { ReportesRepository } from './repositories/reportes.repository';
import { ReportesService } from './services/reportes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportesController],
  providers: [ReportesService, ReportesRepository],
  exports: [ReportesService, ReportesRepository],
})
export class ReportesModule {}
