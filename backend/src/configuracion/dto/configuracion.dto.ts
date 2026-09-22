import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GuardarConfiguracionDto {
  @IsNotEmpty()
  @IsString()
  carreraId!: string;

  @IsNotEmpty()
  @IsString()
  tipoDefensa!: string; // 'INTERNA' | 'EXTERNA'

  @IsOptional()
  @IsBoolean()
  mismoMomento?: boolean;

  @IsOptional()
  @IsNumber()
  anticipacionDefensa?: number;

  @IsOptional()
  @IsNumber()
  plazoResolucion?: number;

  @IsOptional()
  @IsString()
  unidadTiempo?: string; // 'HORAS' | 'DIAS_CALENDARIO' | 'DIAS_HABILES'
}

export class CreateFacultadDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;
}

export class CreateCarreraDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  facultadId!: string;
}

export class CreateAreaAcademiaDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  carreraId!: string;

  @IsOptional()
  pensumIds?: string[];
}

export class CreatePensumDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  carreraId!: string;
}
