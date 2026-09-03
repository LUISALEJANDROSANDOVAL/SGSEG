import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CasosController } from './controller/casos.controller';
import { CasosRepository } from './repositories/casos.repository';
import { CasosService } from './services/casos.service';

@Module({
  imports: [PrismaModule],
  controllers: [CasosController],
  providers: [CasosService, CasosRepository],
  exports: [CasosService, CasosRepository],
})
export class CasosModule {}
