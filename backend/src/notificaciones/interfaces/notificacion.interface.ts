export interface NotificacionDefensaPayload {
  idEstudiante: bigint | string;
  idCasoEstudio: bigint | string;
  idDefensa: bigint | string;
  idUsuarioEnvio: bigint | string;
  correoDestino: string;
  nombreEstudiante: string;
  carnetEstudiantil: string;
  carnetIdentidad: string;
  carrera: string;
  facultad?: string;
  areaNombre: string;
  casoCodigo: string;
  casoTitulo: string;
  casoContenido?: string;
  plazoHoras?: number;
  plazoLimiteEntrega?: Date | string | null;
  fechaDefensa: Date | string;
  tipoDefensa: string;
  codigoActa: string;
  tokenActa: string;
  correoPersonal?: string;
  correoInstitucional?: string;
  pdfBuffer?: Buffer;
}

export interface ResultadoEnvioCorreo {
  exito: boolean;
  idMensaje?: string;
  error?: string;
  fechaEnvio: Date;
  destinatario: string;
}
