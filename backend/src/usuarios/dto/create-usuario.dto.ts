import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsNumber()
  @IsNotEmpty()
  idRol: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  primerNombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  segundoNombre?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  primerApellido: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  segundoApellido?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(200)
  correoInstitucional: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  estado?: string;
}
