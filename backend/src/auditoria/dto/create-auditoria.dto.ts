export class CreateAuditoriaDto {
  idUsuario?: number | null;
  idCasoEstudio?: number | null;
  idSorteo?: number | null;
  idProceso?: number | null;
  idInstancia?: number | null;
  idDefensa?: number | null;
  idEnvio?: number | null;
  tipoOperacion: string;
  descripcion: string;
  motivo?: string | null;
  valorAnterior?: Record<string, unknown> | null;
  valorNuevo?: Record<string, unknown> | null;
}
