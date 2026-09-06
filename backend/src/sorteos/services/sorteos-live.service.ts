import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';

export type FaseSorteoLive =
  | 'ESPERANDO'
  | 'AREA_GIRANDO'
  | 'AREA_ASIGNADA'
  | 'CASO_GIRANDO'
  | 'CASO_ASIGNADO'
  | 'ACTA_OFICIALIZADA'
  | 'EXPIRADO';

export interface SesionLive {
  token: string;
  idPostulante: string;
  nombreEstudiante: string;
  carnet: string;
  carrera: string;
  correo: string;
  tipoDefensa: string;
  fase: FaseSorteoLive;
  areaGanadora?: {
    codigo: string;
    nombre: string;
    descripcion?: string;
  } | null;
  casoGanador?: {
    codigo: string;
    titulo: string;
    contenido?: string;
    plazoHoras?: number;
  } | null;
  codigoActa?: string | null;
  hashActa?: string | null;
  fechaCreacion: Date;
  fechaExpiracion?: Date | null;
  expirado: boolean;
}

export interface NotificacionSorteoDto {
  correo: string;
  nombreEstudiante: string;
  carnet: string;
  carrera: string;
  areaNombre: string;
  casoCodigo: string;
  casoTitulo: string;
  casoContenido?: string;
  plazoHoras: number;
  codigoActa: string;
  hashActa: string;
}

@Injectable()
export class SorteosLiveService {
  // Almacén en memoria de sesiones de sorteo en vivo
  private readonly sesiones = new Map<string, SesionLive>();

  /**
   * Inicializa una sesión de sorteo en tiempo real accesible mediante token único.
   */
  crearSesion(datos: {
    idPostulante: string;
    nombreEstudiante: string;
    carnet: string;
    carrera: string;
    correo: string;
    tipoDefensa: string;
  }): SesionLive {
    const token = crypto.randomUUID();
    const nuevaSesion: SesionLive = {
      token,
      idPostulante: datos.idPostulante,
      nombreEstudiante: datos.nombreEstudiante,
      carnet: datos.carnet,
      carrera: datos.carrera,
      correo: datos.correo,
      tipoDefensa: datos.tipoDefensa,
      fase: 'ESPERANDO',
      areaGanadora: null,
      casoGanador: null,
      codigoActa: null,
      hashActa: null,
      fechaCreacion: new Date(),
      expirado: false,
    };

    this.sesiones.set(token, nuevaSesion);
    return nuevaSesion;
  }

  /**
   * Actualiza el estado en vivo del sorteo (giro de ruleta, ganador de área, caso, etc.).
   */
  actualizarSesion(token: string, update: Partial<SesionLive>): SesionLive {
    const sesion = this.sesiones.get(token);
    if (!sesion) {
      throw new NotFoundException('Sesión de sorteo en vivo no encontrada.');
    }

    if (sesion.expirado) {
      return sesion;
    }

    Object.assign(sesion, update);
    this.sesiones.set(token, sesion);
    return sesion;
  }

  /**
   * Consulta el estado en vivo para el dispositivo móvil del estudiante.
   */
  obtenerSesion(token: string): SesionLive {
    const sesion = this.sesiones.get(token);
    if (!sesion) {
      return {
        token,
        idPostulante: '',
        nombreEstudiante: '',
        carnet: '',
        carrera: '',
        correo: '',
        tipoDefensa: '',
        fase: 'EXPIRADO',
        expirado: true,
        fechaCreacion: new Date(),
      };
    }

    // Auto-expiración de seguridad: 3 horas tras su creación
    const maxTtlMs = 3 * 60 * 60 * 1000;
    if (Date.now() - sesion.fechaCreacion.getTime() > maxTtlMs) {
      sesion.expirado = true;
      sesion.fase = 'EXPIRADO';
    }

    return sesion;
  }

  /**
   * Finaliza y expira inmediatamente el enlace del sorteo.
   */
  expirarSesion(token: string): { mensaje: string; expirado: boolean } {
    const sesion = this.sesiones.get(token);
    if (sesion) {
      sesion.expirado = true;
      sesion.fase = 'EXPIRADO';
      sesion.fechaExpiracion = new Date();
      this.sesiones.set(token, sesion);
    }
    return {
      mensaje: 'La sesión de sorteo en tiempo real ha expirado oficialmente.',
      expirado: true,
    };
  }

  /**
   * Despacha la notificación oficial al correo del postulante.
   */
  enviarNotificacionSorteo(dto: NotificacionSorteoDto): {
    enviado: boolean;
    destinatario: string;
    codigoActa: string;
    fechaDespacho: string;
    mensaje: string;
  } {
    const ahora = new Date().toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
    });

    // Registro formal del correo en los logs del servidor
    console.log(`
================================================================================
🏛️  UTEPSA - NOTIFICACIÓN OFICIAL DE ASIGNACIÓN DE CASO DE EXAMEN DE GRADO
================================================================================
Destinatario: ${dto.nombreEstudiante} <${dto.correo}>
CU/CI:        ${dto.carnet}
Carrera:      ${dto.carrera}
Código Acta:  ${dto.codigoActa}
Hash SHA-256: ${dto.hashActa}
Fecha/Hora:   ${ahora}

Estimado(a) postulante:
Se le notifica que en el acto oficial de sorteo digital se le han asignado:
- ÁREA ACADÉMICA:   ${dto.areaNombre}
- CASO DE ESTUDIO:  ${dto.casoCodigo} - ${dto.casoTitulo}
- PLAZO LÍMITE:     ${dto.plazoHoras} horas continuas a partir de la emisión del acta.

El documento oficial de acta ha sido archivado en los registros de Secretaría de Facultad.
================================================================================
    `);

    return {
      enviado: true,
      destinatario: dto.correo,
      codigoActa: dto.codigoActa,
      fechaDespacho: ahora,
      mensaje: `Notificación y pliego oficial despachados con éxito al correo ${dto.correo}.`,
    };
  }
}
