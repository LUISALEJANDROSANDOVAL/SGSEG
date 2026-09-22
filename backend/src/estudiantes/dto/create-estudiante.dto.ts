export class CreateEstudianteDto {
  idPlanEstudio?: number | string | bigint;
  idCarrera?: number | string | bigint;
  nombrePlanEstudio?: string;
  carnetEstudiantil: string;
  carnetIdentidad: string;
  nombreCompleto: string;
  correoInstitucional?: string;
  correo?: string;
  correoPersonal?: string;
  estado?: string;
}
