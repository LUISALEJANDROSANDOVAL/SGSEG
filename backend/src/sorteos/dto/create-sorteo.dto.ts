export class CreateSorteoDto {
  idDefensa: number;
  idUsuarioEjecutor: number;
  idPlanEstudioContexto: number;
  idSorteoAnterior?: number | null;
  fechaDefensaContexto: string | Date;
  estadoSorteo?: string;
  estudiantePresente?: boolean;
  motivoInasistencia?: string | null;
}
