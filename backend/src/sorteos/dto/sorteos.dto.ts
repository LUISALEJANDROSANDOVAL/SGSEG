import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SortearAreaDto {
  @IsNotEmpty({ message: 'El ID de la defensa es requerido.' })
  @IsString({ message: 'El ID de la defensa debe ser una cadena.' })
  idDefensa: string;

  @IsOptional()
  @IsBoolean({ message: 'estudiantePresente debe ser un booleano.' })
  estudiantePresente?: boolean;

  @IsOptional()
  @IsString({ message: 'El motivo de inasistencia debe ser texto.' })
  motivoInasistencia?: string;
}

export class SortearCasoDto {
  @IsNotEmpty({ message: 'El ID de la defensa es requerido.' })
  @IsString({ message: 'El ID de la defensa debe ser una cadena.' })
  idDefensa: string;

  @IsOptional()
  @IsBoolean({ message: 'estudiantePresente debe ser un booleano.' })
  estudiantePresente?: boolean;

  @IsOptional()
  @IsString({ message: 'El motivo de inasistencia debe ser texto.' })
  motivoInasistencia?: string;
}

export class SorteoConjuntoDto {
  @IsNotEmpty({ message: 'El ID de la defensa es requerido.' })
  @IsString({ message: 'El ID de la defensa debe ser una cadena.' })
  idDefensa: string;

  @IsOptional()
  @IsBoolean({ message: 'estudiantePresente debe ser un booleano.' })
  estudiantePresente?: boolean;

  @IsOptional()
  @IsString({ message: 'El motivo de inasistencia debe ser texto.' })
  motivoInasistencia?: string;
}

export class FilterSorteosDto {
  @IsOptional()
  @IsString()
  idCarrera?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class FinalizarSorteoDto {
  @IsNotEmpty({ message: 'El ID de la defensa es requerido.' })
  @IsString({ message: 'El ID de la defensa debe ser una cadena.' })
  idDefensa: string;

  @IsNotEmpty({ message: 'El ID del área es requerido.' })
  @IsString({ message: 'El ID del área debe ser una cadena.' })
  idArea: string;

  @IsNotEmpty({ message: 'El ID del caso es requerido.' })
  @IsString({ message: 'El ID del caso debe ser una cadena.' })
  idCaso: string;

  @IsOptional()
  @IsBoolean({ message: 'estudiantePresente debe ser un booleano.' })
  estudiantePresente?: boolean;

  @IsOptional()
  @IsString({ message: 'El motivo de inasistencia debe ser texto.' })
  motivoInasistencia?: string;

  @IsOptional()
  @IsString()
  tokenSesionLive?: string;
}

export class CrearEnlaceEspectadorDto {
  @IsNotEmpty({ message: 'El ID de la defensa es requerido.' })
  @IsString({ message: 'El ID de la defensa debe ser una cadena.' })
  idDefensa: string;

  @IsOptional()
  duracionMinutos?: number;
}

