import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EstudiantesController } from './controller/estudiantes.controller';
import { EstudiantesRepository } from './repositories/estudiantes.repository';
import { EstudiantesNormalizerService } from './services/estudiantes-normalizer.service';
import { EstudiantesService } from './services/estudiantes.service';

@Module({
  imports: [PrismaModule],
  controllers: [EstudiantesController],
  providers: [
    EstudiantesService,
    EstudiantesNormalizerService,
    EstudiantesRepository,
  ],
  exports: [
    EstudiantesService,
    EstudiantesNormalizerService,
    EstudiantesRepository,
  ],
})
export class EstudiantesModule {}
