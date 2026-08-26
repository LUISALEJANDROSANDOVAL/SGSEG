import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AcademiaModule } from './academia/academia.module';
import { SorteoConfigModule } from './sorteo-config/sorteo-config.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AcademiaModule,
    SorteoConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
