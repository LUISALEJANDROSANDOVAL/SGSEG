import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from './services/mailer.service';
import { ColaNotificacionesService } from './services/cola-notificaciones.service';

@Module({
  imports: [PrismaModule],
  providers: [MailerService, ColaNotificacionesService],
  exports: [MailerService, ColaNotificacionesService],
})
export class NotificacionesModule {}
