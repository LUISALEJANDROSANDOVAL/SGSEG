import { Injectable } from '@nestjs/common';
import { RawEstudianteInputDto } from '../dto/estudiante.dto';

export interface NormalizedEstudiante {
  carnetEstudiantil: string;
  carnetIdentidad: string;
  nombreCompleto: string;
  correo: string;
  idCarrera?: bigint;
  nombreCarrera?: string;
  idPlanEstudio?: bigint;
  nombrePlanEstudio?: string;
  estado: string;
}

@Injectable()
export class EstudiantesNormalizerService {
  /**
   * Normaliza el carnet estudiantil: elimina espacios y convierte a mayúsculas.
   */
  normalizeCarnet(carnet?: string): string {
    if (!carnet) return '';
    return carnet
      .trim()
      .replace(/\s+/g, '')
      .toUpperCase();
  }

  /**
   * Normaliza el carnet de identidad: limpia espacios redundantes y estandariza sufijo de departamento.
   */
  normalizeCi(ci?: string): string {
    if (!ci) return '';
    return ci
      .trim()
      .replace(/\s*-\s*/g, '-')
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  /**
   * Normaliza nombres propios limpiando espacios duplicados y formateando mayúsculas/minúsculas.
   */
  normalizeNombreCompleto(
    nombreCompleto?: string,
    nombres?: string,
    primerApellido?: string,
    segundoApellido?: string,
  ): string {
    let raw = '';
    if (nombreCompleto && nombreCompleto.trim().length > 0) {
      raw = nombreCompleto.trim();
    } else {
      const parts = [nombres, primerApellido, segundoApellido]
        .filter((part): part is string => Boolean(part && part.trim().length > 0))
        .map((p) => p.trim());
      raw = parts.join(' ');
    }

    if (!raw) return '';

    // Colapsar espacios consecutivos
    const cleanSpaces = raw.replace(/\s+/g, ' ');

    // Convertir a formato capitalizado amigable (Title Case respetando conectores)
    const lowerWords = new Set([
      'de',
      'del',
      'la',
      'las',
      'los',
      'y',
      'e',
      'van',
      'der',
      'von',
      'da',
      'di',
      'do',
      'dos',
      'das',
    ]);
    const words = cleanSpaces.split(' ');

    const formattedWords = words.map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && lowerWords.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return formattedWords.join(' ');
  }

  /**
   * Normaliza el correo electrónico o genera uno institucional por defecto si no es provisto.
   */
  normalizeCorreo(
    correo?: string,
    carnetNormalizado?: string,
    dominioInstitucional = 'estudiante.edu.bo',
  ): string {
    if (correo && correo.trim().length > 0) {
      const cleanEmail = correo.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(cleanEmail)) {
        return cleanEmail;
      }
    }

    if (carnetNormalizado) {
      const sanitizedCarnet = carnetNormalizado
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      return `${sanitizedCarnet}@${dominioInstitucional}`;
    }

    return '';
  }

  /**
   * Normaliza un registro completo de estudiante crudo.
   */
  normalizeRecord(raw: RawEstudianteInputDto): NormalizedEstudiante {
    const carnetEstudiantil = this.normalizeCarnet(raw.carnetEstudiantil);
    const carnetIdentidad = this.normalizeCi(raw.carnetIdentidad);
    const nombreCompleto = this.normalizeNombreCompleto(
      raw.nombreCompleto,
      raw.nombres,
      raw.primerApellido,
      raw.segundoApellido,
    );
    const correo = this.normalizeCorreo(raw.correo, carnetEstudiantil);

    let idCarrera: bigint | undefined;
    if (raw.idCarrera !== undefined && raw.idCarrera !== null && raw.idCarrera !== '') {
      idCarrera = BigInt(raw.idCarrera);
    }

    let idPlanEstudio: bigint | undefined;
    if (raw.idPlanEstudio !== undefined && raw.idPlanEstudio !== null && raw.idPlanEstudio !== '') {
      idPlanEstudio = BigInt(raw.idPlanEstudio);
    }

    const nombreCarrera = raw.nombreCarrera ? raw.nombreCarrera.trim() : undefined;
    const nombrePlanEstudio = raw.nombrePlanEstudio ? raw.nombrePlanEstudio.trim() : undefined;
    const estado = raw.estado && raw.estado.trim().length > 0 ? raw.estado.trim().toUpperCase() : 'ACTIVO';

    return {
      carnetEstudiantil,
      carnetIdentidad,
      nombreCompleto,
      correo,
      idCarrera,
      nombreCarrera,
      idPlanEstudio,
      nombrePlanEstudio,
      estado,
    };
  }
}
