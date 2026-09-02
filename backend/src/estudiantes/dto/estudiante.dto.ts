import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Representa la entrada cruda de un estudiante (desde archivos CSV, Excel, SIS o JSON).
 */
export class RawEstudianteInputDto {
  @IsNotEmpty({ message: 'El carnet estudiantil es requerido' })
  @IsString({ message: 'El carnet estudiantil debe ser una cadena de texto' })
  carnetEstudiantil: string;

  @IsNotEmpty({ message: 'El carnet de identidad es requerido' })
  @IsString({ message: 'El carnet de identidad debe ser una cadena de texto' })
  carnetIdentidad: string;

  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  nombreCompleto?: string;

  @IsOptional()
  @IsString()
  nombres?: string;

  @IsOptional()
  @IsString()
  primerApellido?: string;

  @IsOptional()
  @IsString()
  segundoApellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  correo?: string;

  @IsOptional()
  idCarrera?: number | string | bigint;

  @IsOptional()
  @IsString()
  nombreCarrera?: string;

  @IsOptional()
  idPlanEstudio?: number | string | bigint;

  @IsOptional()
  @IsString()
  nombrePlanEstudio?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}

/**
 * DTO para la carga masiva transaccional de estudiantes.
 */
export class BulkEstudiantesInputDto {
  @IsArray({ message: 'Los estudiantes deben proporcionarse en un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => RawEstudianteInputDto)
  estudiantes: RawEstudianteInputDto[];

  @IsOptional()
  idCarreraPorDefecto?: number | string | bigint;

  @IsOptional()
  @IsString()
  nombreCarreraPorDefecto?: string;

  @IsOptional()
  @IsString()
  nombrePlanPorDefecto?: string;

  @IsOptional()
  @IsBoolean()
  crearPlanesFaltantes?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(1)
  batchSize?: number = 50;
}

/**
 * Estructura de respuesta detallada tras la inserción masiva.
 */
export class BulkEstudiantesResultDto {
  total: number;
  creados: number;
  actualizados: number;
  planesCreados: number;
  planesCreadosDetalle: Array<{
    idPlanEstudio: string;
    idCarrera: string;
    nombre: string;
    estadoVigencia: string;
  }>;
  errores: Array<{
    indice?: number;
    carnet?: string;
    mensaje: string;
  }>;
  duracionMs: number;
}

/**
 * DTO para filtrado paginado de estudiantes por carrera, plan y estado.
 */
export class FilterEstudiantesDto {
  @IsOptional()
  idCarrera?: number | string;

  @IsOptional()
  idPlanEstudio?: number | string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsBoolean()
  incluirEliminados?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

/**
 * DTO para creación individual de Estudiante.
 */
export class CreateEstudianteDto {
  @IsOptional()
  idPlanEstudio?: number | string | bigint;

  @IsOptional()
  idCarrera?: number | string | bigint;

  @IsOptional()
  @IsString()
  nombrePlanEstudio?: string;

  @IsNotEmpty({ message: 'El carnet estudiantil es requerido' })
  @IsString()
  carnetEstudiantil: string;

  @IsNotEmpty({ message: 'El carnet de identidad es requerido' })
  @IsString()
  carnetIdentidad: string;

  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @IsString()
  nombreCompleto: string;

  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'Formato de correo inválido' })
  correo: string;

  @IsOptional()
  @IsString()
  estado?: string;
}

/**
 * DTO para actualización individual de Estudiante.
 */
export class UpdateEstudianteDto {
  @IsOptional()
  idPlanEstudio?: number | string | bigint;

  @IsOptional()
  @IsString()
  carnetIdentidad?: string;

  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}
