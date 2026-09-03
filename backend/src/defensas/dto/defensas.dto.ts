import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProgramarDefensaDto {
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio.' })
  idEstudiante: string | number;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de defensa es obligatorio (INTERNA o EXTERNA).' })
  @IsIn(['INTERNA', 'EXTERNA'], {
    message: 'El tipo de defensa debe ser INTERNA o EXTERNA.',
  })
  tipoDefensa: 'INTERNA' | 'EXTERNA';

  @IsDateString(
    {},
    { message: 'La fecha de defensa debe ser una fecha válida (YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'La fecha de defensa es obligatoria.' })
  fechaDefensa: string;

  @IsOptional()
  @IsString()
  periodoAcademico?: string;
}

export class UpdateDefensaDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de defensa debe ser una fecha válida (YYYY-MM-DD).' },
  )
  fechaDefensa?: string;

  @IsOptional()
  @IsIn(['INTERNA', 'EXTERNA'])
  tipoDefensa?: 'INTERNA' | 'EXTERNA';

  @IsOptional()
  @IsString()
  periodoAcademico?: string;

  @IsOptional()
  @IsString()
  estadoDefensa?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nota?: number;

  @IsOptional()
  @IsString()
  resultado?: string;
}

export class FilterDefensasDto {
  @IsOptional()
  @IsString()
  idFacultad?: string;

  @IsOptional()
  @IsString()
  idCarrera?: string;

  @IsOptional()
  @IsString()
  estadoDefensa?: string;

  @IsOptional()
  @IsString()
  tipoDefensa?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
