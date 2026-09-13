import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RecuperarPasswordDto {
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El correo institucional debe ser una cadena de texto' })
  correoInstitucional?: string;
}
