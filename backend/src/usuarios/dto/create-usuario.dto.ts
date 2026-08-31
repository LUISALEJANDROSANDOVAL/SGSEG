export class CreateUsuarioDto {
  idRol: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correoInstitucional: string;
  estado?: string;
}
