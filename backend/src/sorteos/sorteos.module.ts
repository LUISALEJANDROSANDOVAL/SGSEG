import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SorteosController } from './controller/sorteos.controller';
import { SorteosRepository } from './repositories/sorteos.repository';
import { SorteosService } from './services/sorteos.service';

@Module({
  imports: [PrismaModule],
  controllers: [SorteosController],
  providers: [SorteosService, SorteosRepository],
  exports: [SorteosService, SorteosRepository],
})
export class SorteosModule {}
