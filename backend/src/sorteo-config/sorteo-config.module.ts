import { Module } from '@nestjs/common';
import { SorteoConfigService } from './sorteo-config.service';
import { SorteoConfigController } from './sorteo-config.controller';

@Module({
  providers: [SorteoConfigService],
  controllers: [SorteoConfigController],
  exports: [SorteoConfigService],
})
export class SorteoConfigModule {}
