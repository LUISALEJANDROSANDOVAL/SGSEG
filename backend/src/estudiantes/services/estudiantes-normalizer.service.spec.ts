import { EstudiantesNormalizerService } from './estudiantes-normalizer.service';

describe('EstudiantesNormalizerService', () => {
  let service: EstudiantesNormalizerService;

  beforeEach(() => {
    service = new EstudiantesNormalizerService();
  });

  describe('normalizeCarnet', () => {
    it('debería recortar espacios y convertir a mayúsculas', () => {
      expect(service.normalizeCarnet('  sis-20230001  ')).toBe('SIS-20230001');
      expect(service.normalizeCarnet('inf 2024 999')).toBe('INF2024999');
    });

    it('debería retornar cadena vacía si no se provee carnet', () => {
      expect(service.normalizeCarnet('')).toBe('');
      expect(service.normalizeCarnet(undefined)).toBe('');
    });
  });

  describe('normalizeCi', () => {
    it('debería estandarizar el formato de CI con guión y sufijo en mayúsculas', () => {
      expect(service.normalizeCi(' 8392011 - lp ')).toBe('8392011-LP');
      expect(service.normalizeCi('7482910 cb')).toBe('7482910 CB');
      expect(service.normalizeCi(' 6391024 - 1t  sc ')).toBe('6391024-1T SC');
    });

    it('debería retornar cadena vacía si no se provee CI', () => {
      expect(service.normalizeCi('')).toBe('');
      expect(service.normalizeCi(undefined)).toBe('');
    });
  });

  describe('normalizeNombreCompleto', () => {
    it('debería colapsar espacios y aplicar formato capitalizado con conectores', () => {
      expect(
        service.normalizeNombreCompleto(
          '   carlos   eduardo   de la barra   gutierrez   ',
        ),
      ).toBe('Carlos Eduardo de la Barra Gutierrez');

      expect(
        service.normalizeNombreCompleto('JUAN CARLOS PEREZ VAN DER VALK'),
      ).toBe('Juan Carlos Perez van der Valk');
    });

    it('debería combinar nombres y apellidos separados cuando no se envía nombreCompleto', () => {
      expect(
        service.normalizeNombreCompleto(
          undefined,
          '  valeria andrea  ',
          'rojas',
          'mamani',
        ),
      ).toBe('Valeria Andrea Rojas Mamani');
    });

    it('debería manejar apellidos simples sin segundo apellido', () => {
      expect(
        service.normalizeNombreCompleto(
          undefined,
          'Mateo',
          'Romero',
          undefined,
        ),
      ).toBe('Mateo Romero');
    });
  });

  describe('normalizeCorreo', () => {
    it('debería limpiar y convertir a minúsculas correos válidos', () => {
      expect(
        service.normalizeCorreo('  JUAN.PEREZ@GMAIL.COM  ', 'SIS-2023001'),
      ).toBe('juan.perez@gmail.com');
    });

    it('debería generar correo institucional si no se provee correo o es inválido', () => {
      expect(service.normalizeCorreo('', 'SIS-20230001')).toBe(
        'sis20230001@estudiante.edu.bo',
      );
      expect(service.normalizeCorreo('correo-invalido', 'SIS-20230002')).toBe(
        'sis20230002@estudiante.edu.bo',
      );
    });
  });

  describe('normalizeRecord', () => {
    it('debería normalizar todos los campos de un registro crudo correctamente', () => {
      const normalized = service.normalizeRecord({
        carnetEstudiantil: '  sis-20210001 ',
        carnetIdentidad: ' 8392011 lp ',
        nombreCompleto: '  ALEJANDRO   MORALES QUISPE  ',
        correo: ' ALEJANDRO.MORALES@UNI.EDU.BO ',
        idCarrera: '10',
        nombreCarrera: ' Ingeniería de Sistemas ',
        nombrePlanEstudio: ' Plan 2024 ',
        estado: 'activo',
      });

      expect(normalized).toEqual({
        carnetEstudiantil: 'SIS-20210001',
        carnetIdentidad: '8392011 LP',
        nombreCompleto: 'Alejandro Morales Quispe',
        correo: 'alejandro.morales@uni.edu.bo',
        idCarrera: BigInt(10),
        nombreCarrera: 'Ingeniería de Sistemas',
        idPlanEstudio: undefined,
        nombrePlanEstudio: 'Plan 2024',
        estado: 'ACTIVO',
      });
    });
  });
});
