import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @IsNotEmpty({ message: 'El ID o correo del usuario a restablecer es obligatorio' })
  @IsString({ message: 'El identificador del usuario debe ser texto' })
  idUsuario: string;

  @IsOptional()
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword?: string;

  @IsOptional()
  @IsString({ message: 'El secreto de recuperación administrativa debe ser texto' })
  adminSecret?: string;
}
