import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  primerNombre?: string;

  @IsString()
  @IsOptional()
  segundoNombre?: string;

  @IsString()
  @IsOptional()
  primerApellido?: string;

  @IsString()
  @IsOptional()
  segundoApellido?: string;

  @IsEmail()
  @IsOptional()
  correoInstitucional?: string;
}
