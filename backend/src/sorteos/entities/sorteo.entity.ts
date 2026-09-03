export class SorteoEntity {
  idSorteo?: string;
  idDefensa?: string;
  idUsuarioEjecutor?: string;
  idPlanEstudioContexto?: string;
  idSorteoAnterior?: string | null;
  fechaHora?: Date;
  fechaDefensaContexto?: Date;
  estadoSorteo?: string;
  estudiantePresente?: boolean;
  motivoInasistencia?: string | null;
}
