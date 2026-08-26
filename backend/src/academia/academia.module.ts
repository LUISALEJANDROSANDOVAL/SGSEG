import { Module } from '@nestjs/common';
import { AcademiaService } from './academia.service';
import { AcademiaController } from './academia.controller';

@Module({
  providers: [AcademiaService],
  controllers: [AcademiaController],
  exports: [AcademiaService],
})
export class AcademiaModule {}
