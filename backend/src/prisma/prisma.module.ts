import { Global, Module } from '@nestjs/common';
<<<<<<< HEAD
import { PrismaService } from './services/prisma.service';
=======
import { PrismaService } from './prisma.service';
>>>>>>> feature/Arnez

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
