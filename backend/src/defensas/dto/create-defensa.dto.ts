export class CreateDefensaDto {
  idInstancia: number;
  idTipoDefensa: number;
  idCasoUtilizado?: number | null;
  fechaDefensa: string | Date;
  periodoAcademico: string;
  estadoDefensa?: string;
  nota?: number | null;
  resultado?: string | null;
}
