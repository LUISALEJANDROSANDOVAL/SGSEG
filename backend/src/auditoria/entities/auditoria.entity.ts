export class AuditoriaEntity {
  idRegistroAuditoria?: string;
  idUsuario?: string | null;
  idCasoEstudio?: string | null;
  idSorteo?: string | null;
  idProceso?: string | null;
  idInstancia?: string | null;
  idDefensa?: string | null;
  idEnvio?: string | null;
  fechaHora?: Date;
  tipoOperacion?: string;
  descripcion?: string;
  motivo?: string | null;
}
