import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { NotificacionDefensaPayload } from '../interfaces/notificacion.interface';
import { MailerService } from './mailer.service';

interface TrabajoColaNotificacion {
  idEnvio: bigint;
  payload: NotificacionDefensaPayload;
  intentos: number;
  maxIntentos: number;
}

@Injectable()
export class ColaNotificacionesService {
  private readonly logger = new Logger(ColaNotificacionesService.name);
  private readonly cola: TrabajoColaNotificacion[] = [];
  private procesando = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Encola la notificación del sorteo persistiendo el registro inicial en la base de datos
   * y despachando el procesamiento asíncrono sin bloquear la respuesta HTTP.
   */
  async encolarNotificacion(payload: NotificacionDefensaPayload): Promise<{
    idEnvio: string;
    estado: string;
    mensaje: string;
  }> {
    const idEstudiante = BigInt(payload.idEstudiante);
    const idCasoEstudio = BigInt(payload.idCasoEstudio);
    const idUsuarioEnvio = BigInt(payload.idUsuarioEnvio);

    // 1. Registro transaccional en tabla envio_caso_estudio
    const envio = await this.prisma.envioCasoEstudio.create({
      data: {
        idEstudiante,
        idCasoEstudio,
        idUsuarioEnvio,
        correoDestino: payload.correoDestino,
        fechaHoraEnvio: new Date(),
        estadoEnvio: 'PENDIENTE',
      },
    });

    const trabajo: TrabajoColaNotificacion = {
      idEnvio: envio.idEnvio,
      payload,
      intentos: 0,
      maxIntentos: 3,
    };

    this.cola.push(trabajo);
    this.logger.log(`Notificación encolada (idEnvio: ${envio.idEnvio}) para ${payload.correoDestino}`);

    // Iniciar procesamiento en background sin esperar a que culmine
    setImmediate(() => {
      this.procesarCola().catch((err) =>
        this.logger.error(`Error procesando cola de notificaciones: ${err.message}`),
      );
    });

    return {
      idEnvio: String(envio.idEnvio),
      estado: 'PENDIENTE',
      mensaje: `Notificación encolada exitosamente para ${payload.correoDestino}.`,
    };
  }

  /**
   * Worker asíncrono que procesa los trabajos pendientes en la cola.
   */
  private async procesarCola(): Promise<void> {
    if (this.procesando || this.cola.length === 0) return;

    this.procesando = true;

    try {
      while (this.cola.length > 0) {
        const trabajo = this.cola.shift();
        if (!trabajo) continue;

        trabajo.intentos++;
        try {
          // Despacho vía MailerService
          const resultado = await this.mailerService.enviarNotificacionSorteo(trabajo.payload);

          if (resultado.exito) {
            // Actualizar estado en base de datos a ENVIADO
            await this.prisma.envioCasoEstudio.update({
              where: { idEnvio: trabajo.idEnvio },
              data: {
                estadoEnvio: 'ENVIADO',
                fechaHoraEnvio: new Date(),
              },
            });

            // Registro en Auditoría
            await this.prisma.registroAuditoria.create({
              data: {
                idUsuario: BigInt(trabajo.payload.idUsuarioEnvio),
                idCasoEstudio: BigInt(trabajo.payload.idCasoEstudio),
                idDefensa: BigInt(trabajo.payload.idDefensa),
                idEnvio: trabajo.idEnvio,
                tipoOperacion: 'NOTIFICACION_SORTEO_DESPACHADA',
                descripcion: `Notificación formal y pliego de sorteo despachado a ${trabajo.payload.correoDestino}. Acta: ${trabajo.payload.codigoActa}`,
                valorNuevo: {
                  correoDestino: trabajo.payload.correoDestino,
                  codigoActa: trabajo.payload.codigoActa,
                  tokenActa: trabajo.payload.tokenActa,
                  idMensaje: resultado.idMensaje,
                },
              },
            });

            this.logger.log(`Notificación idEnvio ${trabajo.idEnvio} enviada y auditada.`);
          } else {
            throw new Error(resultado.error || 'Fallo desconocido en el despacho de correo');
          }
        } catch (error: any) {
          this.logger.warn(
            `Fallo intento ${trabajo.intentos}/${trabajo.maxIntentos} para idEnvio ${trabajo.idEnvio}: ${error.message}`,
          );

          if (trabajo.intentos < trabajo.maxIntentos) {
            // Reintento con retraso exponencial
            this.cola.push(trabajo);
            await new Promise((resolve) => setTimeout(resolve, 1000 * trabajo.intentos));
          } else {
            // Superó reintentos: marcar como FALLIDO
            await this.prisma.envioCasoEstudio.update({
              where: { idEnvio: trabajo.idEnvio },
              data: { estadoEnvio: 'FALLIDO' },
            });
            this.logger.error(`Notificación idEnvio ${trabajo.idEnvio} marcada como FALLIDO tras reintentos.`);
          }
        }
      }
    } finally {
      this.procesando = false;
    }
  }

  /**
   * Consulta los envíos asociados a un estudiante o caso.
   */
  async obtenerEnviosPorEstudiante(idEstudiante: bigint) {
    return this.prisma.envioCasoEstudio.findMany({
      where: { idEstudiante },
      include: {
        casoEstudio: true,
        usuarioEnvio: {
          select: {
            idUsuario: true,
            primerNombre: true,
            primerApellido: true,
            correoInstitucional: true,
          },
        },
      },
      orderBy: { fechaHoraEnvio: 'desc' },
    });
  }
}
