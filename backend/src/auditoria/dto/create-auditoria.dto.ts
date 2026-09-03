import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class CreateAuditoriaDto {
  @IsNumber()
  @IsOptional()
  idUsuario?: number | null;

  @IsNumber()
  @IsOptional()
  idCasoEstudio?: number | null;

  @IsNumber()
  @IsOptional()
  idSorteo?: number | null;

  @IsNumber()
  @IsOptional()
  idProceso?: number | null;

  @IsNumber()
  @IsOptional()
  idInstancia?: number | null;

  @IsNumber()
  @IsOptional()
  idDefensa?: number | null;

  @IsNumber()
  @IsOptional()
  idEnvio?: number | null;

  @IsString()
  @IsNotEmpty()
  tipoOperacion!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsString()
  @IsOptional()
  motivo?: string | null;

  @IsObject()
  @IsOptional()
  valorAnterior?: Record<string, unknown> | null;

  @IsObject()
  @IsOptional()
  valorNuevo?: Record<string, unknown> | null;
}
