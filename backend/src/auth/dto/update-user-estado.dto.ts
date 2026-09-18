import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserEstadoDto {
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsString()
  @IsIn(['ACTIVO', 'INACTIVO'], {
    message: 'El estado debe ser ACTIVO o INACTIVO',
  })
  estado: string;
}
