export class CreateCasoDto {
  idArea: number;
  titulo: string;
  contenido: string;
  documentoAdjunto?: string | null;
  estado?: string;
}
