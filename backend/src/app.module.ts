import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AcademiaModule } from './academia/academia.module';
import { SorteoConfigModule } from './sorteo-config/sorteo-config.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AcademiaModule,
    SorteoConfigModule,
    EstudiantesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
