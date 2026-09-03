import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DefensasController } from './controller/defensas.controller';
import { DefensasRepository } from './repositories/defensas.repository';
import { DefensasService } from './services/defensas.service';

@Module({
  imports: [PrismaModule],
  controllers: [DefensasController],
  providers: [DefensasService, DefensasRepository],
  exports: [DefensasService, DefensasRepository],
})
export class DefensasModule {}
