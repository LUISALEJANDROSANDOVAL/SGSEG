import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
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

export class TribunalDto {
  @IsOptional()
  @IsString()
  presidente?: string;

  @IsOptional()
  @IsString()
  secretario?: string;

  @IsOptional()
  @IsString()
  vocal?: string;
}

export class CalificarDefensaDto {
  @IsNotEmpty({ message: 'La nota numérica es obligatoria.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La nota debe ser un número válido.' })
  @Min(0, { message: 'La nota mínima es 0.' })
  @Max(100, { message: 'La nota máxima es 100.' })
  nota: number;

  @IsNotEmpty({ message: 'El resultado oficial es obligatorio.' })
  @IsString()
  resultado: string;

  @IsOptional()
  @IsString()
  estadoDefensa?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  tribunal?: TribunalDto;
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
  @Min(0)
  @Max(100)
  nota?: number;

  @IsOptional()
  @IsString()
  resultado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  tribunal?: TribunalDto;
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
