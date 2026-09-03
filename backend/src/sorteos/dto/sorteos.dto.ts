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
