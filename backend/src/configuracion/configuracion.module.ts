import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SorteoConfigController } from './controller/configuracion.controller';
import { AcademiaController } from './controller/academia.controller';
import { ConfiguracionService } from './services/configuracion.service';

@Module({
  imports: [PrismaModule],
  controllers: [SorteoConfigController, AcademiaController],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}
