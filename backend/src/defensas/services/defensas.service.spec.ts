import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DefensasService } from './defensas.service';
import { DefensasRepository } from '../repositories/defensas.repository';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('DefensasService', () => {
  let service: DefensasService;
  let repository: jest.Mocked<DefensasRepository>;

  const mockCoordUser: AuthenticatedUser = {
    idUsuario: '1',
    correoInstitucional: 'coord@uni.edu.bo',
    rol: 'COORDINACION',
  };

  const mockJefeUser: AuthenticatedUser = {
    idUsuario: '10',
    correoInstitucional: 'jefe.sistemas@uni.edu.bo',
    rol: 'JEFE_CARRERA',
  };

  beforeEach(() => {
    repository = {
      getUserCarreraIds: jest.fn(),
      findEstudianteById: jest.fn(),
      findTipoDefensaByNombre: jest.fn(),
      programarDefensa: jest.fn(),
      findDefensas: jest.fn(),
      countDefensas: jest.fn(),
      findDefensaById: jest.fn(),
      updateDefensa: jest.fn(),
      getEmbudoEstados: jest.fn(),
      getAlertasOperativas: jest.fn(),
    } as unknown as jest.Mocked<DefensasRepository>;

    service = new DefensasService(repository);
  });

  describe('Cálculo de Reglas de Sorteo por Facultad y Carrera (UPTECSA)', () => {
    it('debe calcular 7 días de anticipación para Ingeniería de Sistemas (FCT)', () => {
      const fechaDefensa = new Date('2026-10-20T00:00:00.000Z');
      const reglas = service.calcularReglasSorteo(
        'Facultad de Ciencias y Tecnología',
        'Ingeniería de Sistemas',
        'INTERNA',
        fechaDefensa,
      );

      expect(reglas.modalidad).toBe('ANTICIPADO_CONJUNTO');
      expect(reglas.plazoPreparacionDias).toBe(7);
      expect(reglas.fechaSorteoAreaRecomendada).toBe('2026-10-13');
      expect(reglas.fechaSorteoCasoRecomendada).toBe('2026-10-13');
    });

    it('debe calcular 14 días de anticipación para Ingeniería Mecánica (FCT)', () => {
      const fechaDefensa = new Date('2026-10-20T00:00:00.000Z');
      const reglas = service.calcularReglasSorteo(
        'Facultad de Ciencias y Tecnología',
        'Ingeniería Mecánica',
        'EXTERNA',
        fechaDefensa,
      );

      expect(reglas.modalidad).toBe('ANTICIPADO_CONJUNTO');
      expect(reglas.plazoPreparacionDias).toBe(14);
      expect(reglas.fechaSorteoAreaRecomendada).toBe('2026-10-06');
    });

    it('debe calcular 10 días de anticipación para Psicología (FCJS)', () => {
      const fechaDefensa = new Date('2026-10-20T00:00:00.000Z');
      const reglas = service.calcularReglasSorteo(
        'Facultad de Ciencias Jurídicas y Sociales',
        'Licenciatura en Psicología',
        'INTERNA',
        fechaDefensa,
      );

      expect(reglas.modalidad).toBe('ANTICIPADO_CONJUNTO');
      expect(reglas.plazoPreparacionDias).toBe(10);
      expect(reglas.fechaSorteoAreaRecomendada).toBe('2026-10-10');
    });

    it('debe calcular sorteo de área 5 días antes y 1 hora en el día para Derecho Interna (FCJS)', () => {
      const fechaDefensa = new Date('2026-10-20T00:00:00.000Z');
      const reglas = service.calcularReglasSorteo(
        'Facultad de Ciencias Jurídicas y Sociales',
        'Derecho',
        'INTERNA',
        fechaDefensa,
      );

      expect(reglas.modalidad).toBe('SEPARADO_DIA_DEFENSA');
      expect(reglas.fechaSorteoAreaRecomendada).toBe('2026-10-15');
      expect(reglas.fechaSorteoCasoRecomendada).toBe('2026-10-20');
      expect(reglas.tiempoResolucionHoras).toBe(1.0);
    });

    it('debe calcular 1.5 horas en el día para Administración General Externa (FCE)', () => {
      const fechaDefensa = new Date('2026-10-20T00:00:00.000Z');
      const reglas = service.calcularReglasSorteo(
        'Facultad de Ciencias Empresariales',
        'Administración General',
        'EXTERNA',
        fechaDefensa,
      );

      expect(reglas.modalidad).toBe('SEPARADO_DIA_DEFENSA');
      expect(reglas.fechaSorteoAreaRecomendada).toBe('2026-10-15');
      expect(reglas.fechaSorteoCasoRecomendada).toBe('2026-10-20');
      expect(reglas.tiempoResolucionHoras).toBe(1.5);
    });
  });

  describe('Programación de Defensas', () => {
    it('debe lanzar NotFoundException si el estudiante no existe', async () => {
      repository.findEstudianteById.mockResolvedValue(null);

      await expect(
        service.programarDefensa(
          {
            idEstudiante: '999',
            tipoDefensa: 'INTERNA',
            fechaDefensa: '2026-11-01',
          },
          mockCoordUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe impedir que un Jefe de Carrera programe la defensa de un estudiante de otra carrera', async () => {
      repository.findEstudianteById.mockResolvedValue({
        idEstudiante: BigInt(1),
        idPlanEstudio: BigInt(1),
        carnetEstudiantil: 'DER-1234',
        carnetIdentidad: '7891234 LP',
        nombreCompleto: 'Juan Perez',
        correo: 'juan@uni.edu.bo',
        estado: 'ACTIVO',
        fechaRegistro: new Date(),
        planEstudio: {
          idPlanEstudio: BigInt(1),
          idCarrera: BigInt(8), // Carrera de Derecho
          nombre: 'Plan 2024',
          estadoVigencia: 'VIGENTE',
          carrera: {
            idCarrera: BigInt(8),
            idFacultad: BigInt(3),
            nombre: 'Derecho',
            facultad: { idFacultad: BigInt(3), nombre: 'Jurídicas' },
          },
        },
      });

      repository.getUserCarreraIds.mockResolvedValue([BigInt(1)]); // Solo Sistemas

      await expect(
        service.programarDefensa(
          {
            idEstudiante: '1',
            tipoDefensa: 'INTERNA',
            fechaDefensa: '2026-11-01',
          },
          mockJefeUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe programar exitosamente y retornar las reglas calculadas para Coordinación', async () => {
      repository.findEstudianteById.mockResolvedValue({
        idEstudiante: BigInt(1),
        idPlanEstudio: BigInt(1),
        carnetEstudiantil: 'SIS-20210001',
        carnetIdentidad: '8392011 LP',
        nombreCompleto: 'Alejandro Morales',
        correo: 'alejandro@estudiante.edu.bo',
        estado: 'ACTIVO',
        fechaRegistro: new Date(),
        planEstudio: {
          idPlanEstudio: BigInt(1),
          idCarrera: BigInt(1),
          nombre: 'Plan 2024',
          estadoVigencia: 'VIGENTE',
          carrera: {
            idCarrera: BigInt(1),
            idFacultad: BigInt(1),
            nombre: 'Ingeniería de Sistemas',
            facultad: {
              idFacultad: BigInt(1),
              nombre: 'Facultad de Ciencias y Tecnología',
            },
          },
        },
      });

      repository.findTipoDefensaByNombre.mockResolvedValue({
        idTipoDefensa: BigInt(1),
        nombre: 'INTERNA',
        descripcion: 'Defensa interna',
      });

      repository.programarDefensa.mockResolvedValue({
        idDefensa: BigInt(50),
        idInstancia: BigInt(10),
        idTipoDefensa: BigInt(1),
        idCasoUtilizado: null,
        fechaDefensa: new Date('2026-11-10T00:00:00.000Z'),
        periodoAcademico: 'II-2026',
        estadoDefensa: 'PROGRAMADA',
        nota: null,
        resultado: null,
        tipoDefensa: {
          idTipoDefensa: BigInt(1),
          nombre: 'INTERNA',
          descripcion: 'Defensa interna',
        },
        instancia: {
          idInstancia: BigInt(10),
          idProceso: BigInt(5),
          numeroInstancia: 1,
          estadoInstancia: 'PENDIENTE',
          resultado: null,
          proceso: {
            idProceso: BigInt(5),
            idEstudiante: BigInt(1),
            estadoProceso: 'EN_CURSO',
            fechaInicio: new Date(),
            estudiante: {
              idEstudiante: BigInt(1),
              idPlanEstudio: BigInt(1),
              carnetEstudiantil: 'SIS-20210001',
              carnetIdentidad: '8392011 LP',
              nombreCompleto: 'Alejandro Morales',
              correo: 'alejandro@estudiante.edu.bo',
              estado: 'ACTIVO',
              fechaRegistro: new Date(),
              planEstudio: {
                idPlanEstudio: BigInt(1),
                idCarrera: BigInt(1),
                nombre: 'Plan 2024',
                estadoVigencia: 'VIGENTE',
                carrera: {
                  idCarrera: BigInt(1),
                  idFacultad: BigInt(1),
                  nombre: 'Ingeniería de Sistemas',
                  facultad: {
                    idFacultad: BigInt(1),
                    nombre: 'Facultad de Ciencias y Tecnología',
                  },
                },
              },
            },
          },
        },
      });

      const res = await service.programarDefensa(
        {
          idEstudiante: '1',
          tipoDefensa: 'INTERNA',
          fechaDefensa: '2026-11-10',
          periodoAcademico: 'II-2026',
        },
        mockCoordUser,
      );

      expect(res.defensa.idDefensa).toBe('50');
      expect(res.reglasSorteo.modalidad).toBe('ANTICIPADO_CONJUNTO');
      expect(res.reglasSorteo.plazoPreparacionDias).toBe(7);
      expect(res.reglasSorteo.fechaSorteoAreaRecomendada).toBe('2026-11-03');
    });
  });
});
