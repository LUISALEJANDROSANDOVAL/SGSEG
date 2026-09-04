import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCasoDto {
  @IsNotEmpty({ message: 'El ID del área académica es obligatorio.' })
  idArea: string | number;

  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El título del caso es obligatorio.' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres.' })
  @MaxLength(250, { message: 'El título no puede exceder los 250 caracteres.' })
  titulo: string;

  @IsString({ message: 'El contenido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El planteamiento y preguntas del caso son obligatorios.' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres.' })
  contenido: string;

  @IsOptional()
  @IsString({ message: 'El documento adjunto debe ser una cadena de texto o URL.' })
  documentoAdjunto?: string;
}

export class ReactivarCasoEspecialDto {
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La justificación académica o motivo de la reactivación es obligatoria.' })
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres.' })
  @MaxLength(500, { message: 'El motivo no puede exceder los 500 caracteres.' })
  motivo: string;
}

export class UpdateCasoDto {
  @IsOptional()
  idArea?: string | number;

  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres.' })
  @MaxLength(250, { message: 'El título no puede exceder los 250 caracteres.' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena de texto.' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres.' })
  contenido?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  documentoAdjunto?: string;
}

export class FilterCasosDto {
  @IsOptional()
  @IsString()
  idCarrera?: string;

  @IsOptional()
  @IsString()
  idArea?: string;

  @IsOptional()
  @IsString()
  estado?: string;

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

export class CreateAreaDto {
  @IsNotEmpty({ message: 'El ID de la carrera es obligatorio.' })
  idCarrera: string | number;

  @IsString({ message: 'El nombre del área es obligatorio.' })
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  umbralDisponibilidad?: number = 2;
}

export class UpdateAreaDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  umbralDisponibilidad?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
