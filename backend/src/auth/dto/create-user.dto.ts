import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  correoInstitucional?: string;

  @IsString()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  rol!: string;

  @IsOptional()
  carreraId?: string | number | null;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
