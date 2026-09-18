import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { SorteosRepository } from '../repositories/sorteos.repository';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('SorteosService', () => {
  let service: SorteosService;
  let repository: jest.Mocked<SorteosRepository>;

  const mockSecretariaUser: AuthenticatedUser = {
    idUsuario: '5',
    correoInstitucional: 'secretaria.fct@uni.edu.bo',
    rol: 'SECRETARIADO',
  };

  const mockJefeUser: AuthenticatedUser = {
    idUsuario: '10',
    correoInstitucional: 'jefe.sistemas@uni.edu.bo',
    rol: 'JEFE_CARRERA',
  };

  beforeEach(() => {
    repository = {
      getUserCarreraIds: jest.fn(),
      findDefensaWithDetails: jest.fn(),
      findAreasDisponibles: jest.fn(),
      findCasosDisponibles: jest.fn(),
      findOrCreateConfigSorteoArea: jest.fn(),
      findOrCreateConfigSorteoCaso: jest.fn(),
      ejecutarSorteoArea: jest.fn(),
      ejecutarSorteoCaso: jest.fn(),
      ejecutarSorteoConjunto: jest.fn(),
      finalizarYAsignarSorteo: jest.fn(),
      crearSesionEspectador: jest.fn(),
      findSesionEspectadorByTokenOrSlug: jest.fn(),
      actualizarFaseSesionEspectador: jest.fn(),
      expirarSesionEspectador: jest.fn(),
      findAsignacionByDefensa: jest.fn(),
      findHistorial: jest.fn(),
      countHistorial: jest.fn(),
      findSorteoById: jest.fn(),
    } as unknown as jest.Mocked<SorteosRepository>;

    service = new SorteosService(repository);
  });

  describe('Criptografía y Token del Acta (CSPRNG)', () => {
    it('debe generar un token SHA-256 de 32 caracteres para el acta', () => {
      const token1 = service.generarTokenActa(BigInt(1), BigInt(10), BigInt(3), new Date('2026-10-10'));
      const token2 = service.generarTokenActa(BigInt(1), BigInt(10), BigInt(3), new Date('2026-10-10'));

      expect(token1).toHaveLength(32);
      expect(token1).toBe(token2);
    });

    it('debe seleccionar un elemento válido con CSPRNG dentro del rango', () => {
      const elementos = ['Area 1', 'Area 2', 'Area 3'];
      const { elemento, indice } = service.seleccionarGanadorCSPRNG(elementos);

      expect(elementos).toContain(elemento);
      expect(indice).toBeGreaterThanOrEqual(0);
      expect(indice).toBeLessThan(elementos.length);
    });

    it('debe lanzar BadRequestException si el pool a sortear está vacío', () => {
      expect(() => service.seleccionarGanadorCSPRNG([])).toThrow(BadRequestException);
    });
  });

  describe('Sorteo de Área Temática', () => {
    it('debe lanzar NotFoundException si la defensa no existe', async () => {
      repository.findDefensaWithDetails.mockResolvedValue(null);

      await expect(
        service.sortearArea({ idDefensa: '999' }, mockSecretariaUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe impedir que un Jefe de Carrera sortee para otra carrera', async () => {
      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        instancia: {
          proceso: {
            estudiante: {
              idPlanEstudio: BigInt(2),
              planEstudio: {
                carrera: { idCarrera: BigInt(8), nombre: 'Derecho' },
              },
            },
          },
        },
        sorteos: [],
      } as any);

      repository.getUserCarreraIds.mockResolvedValue([BigInt(1)]); // Solo Sistemas

      await expect(
        service.sortearArea({ idDefensa: '1' }, mockJefeUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar BadRequestException si la defensa ya tiene un área sorteada', async () => {
      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        instancia: {
          proceso: {
            estudiante: {
              idPlanEstudio: BigInt(1),
              planEstudio: {
                carrera: { idCarrera: BigInt(1), nombre: 'Sistemas' },
              },
            },
          },
        },
        sorteos: [
          {
            idSorteo: BigInt(10),
            estadoSorteo: 'ACTIVO',
            area: { idAreaResultado: BigInt(3) },
          },
        ],
      } as any);

      await expect(
        service.sortearArea({ idDefensa: '1' }, mockSecretariaUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe ejecutar el sorteo de área con éxito si el pool es válido', async () => {
      const mockAreas = [
        { idArea: BigInt(1), nombre: 'Ingeniería de Software' },
        { idArea: BigInt(2), nombre: 'Seguridad Informática' },
      ];

      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        idTipoDefensa: BigInt(1),
        fechaDefensa: new Date('2026-11-20'),
        instancia: {
          proceso: {
            estudiante: {
              idPlanEstudio: BigInt(1),
              planEstudio: {
                carrera: { idCarrera: BigInt(1), nombre: 'Ingeniería de Sistemas' },
              },
            },
          },
        },
        sorteos: [],
      } as any);

      repository.findAreasDisponibles.mockResolvedValue(mockAreas as any);
      repository.findOrCreateConfigSorteoArea.mockResolvedValue({
        idConfigSorteoArea: BigInt(1),
      } as any);

      repository.ejecutarSorteoArea.mockResolvedValue({
        idSorteo: BigInt(101),
        idDefensa: BigInt(1),
        fechaHora: new Date(),
      } as any);

      const res = await service.sortearArea({ idDefensa: '1' }, mockSecretariaUser);

      expect(res.sorteo.idSorteo).toBe('101');
      expect(res.totalParticipantes).toBe(2);
      expect(res.tokenActa).toBeDefined();
    });
  });

  describe('Sorteo de Caso de Estudio', () => {
    it('debe lanzar BadRequestException si el área aún no ha sido sorteada', async () => {
      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        idCasoUtilizado: null,
        instancia: {
          proceso: {
            estudiante: {
              idPlanEstudio: BigInt(1),
              planEstudio: {
                carrera: { idCarrera: BigInt(1), nombre: 'Sistemas' },
              },
            },
          },
        },
        sorteos: [], // No tiene sorteos
      } as any);

      await expect(
        service.sortearCaso({ idDefensa: '1' }, mockSecretariaUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si no hay casos disponibles (stock crítico)', async () => {
      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        idCasoUtilizado: null,
        instancia: {
          proceso: {
            estudiante: {
              idPlanEstudio: BigInt(1),
              planEstudio: {
                carrera: { idCarrera: BigInt(1), nombre: 'Sistemas' },
              },
            },
          },
        },
        sorteos: [
          {
            idSorteo: BigInt(5),
            estadoSorteo: 'ACTIVO',
            area: { idAreaResultado: BigInt(2) },
          },
        ],
      } as any);

      repository.findCasosDisponibles.mockResolvedValue([]); // 0 casos disponibles

      await expect(
        service.sortearCaso({ idDefensa: '1' }, mockSecretariaUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Finalizar Sorteo y Persistencia de Asignación', () => {
    it('debe persistir exitosamente la asignación con cálculo de plazo y token de acta', async () => {
      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        fechaDefensa: new Date('2026-11-20'),
        tipoDefensa: { nombre: 'INTERNA' },
        sorteos: [{ idSorteo: BigInt(10) }],
        instancia: {
          proceso: {
            estudiante: {
              idEstudiante: BigInt(50),
              idPlanEstudio: BigInt(2),
              nombreCompleto: 'Carlos Mendoza',
              carnetEstudiantil: 'CARNET-001',
              correoInstitucional: 'carlos@uni.edu.bo',
              planEstudio: {
                carrera: { idCarrera: BigInt(1), nombre: 'Ingeniería de Sistemas' },
              },
            },
          },
        },
      } as any);

      repository.finalizarYAsignarSorteo.mockResolvedValue({
        idAsignacion: BigInt(100),
        idEstudiante: BigInt(50),
        idDefensa: BigInt(1),
        idArea: BigInt(4),
        idCaso: BigInt(9),
        idUsuarioEjecutor: BigInt(5),
        codigoActa: 'ACTA-DEF-1-2026',
        tokenActa: 'HASH-TEST-32-CHARS',
        estado: 'ASIGNADO',
      } as any);

      const result = await service.finalizarSorteo(
        {
          idDefensa: '1',
          idArea: '4',
          idCaso: '9',
          estudiantePresente: true,
        },
        mockSecretariaUser,
      );

      expect(result.mensaje).toContain('Sorteo finalizado');
      expect(result.codigoActa).toBe('ACTA-DEF-1-2026');
      expect(result.tokenActa).toBeDefined();
      expect(result.plazoLimiteEntrega).toBeDefined();
      expect(repository.finalizarYAsignarSorteo).toHaveBeenCalledWith(
        expect.objectContaining({
          idDefensa: BigInt(1),
          idEstudiante: BigInt(50),
          idArea: BigInt(4),
          idCaso: BigInt(9),
        }),
      );
    });

    it('debe impedir que Jefe de Carrera finalice un sorteo de otra carrera', async () => {
      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        tipoDefensa: { nombre: 'EXTERNA' },
        sorteos: [],
        instancia: {
          proceso: {
            estudiante: {
              idEstudiante: BigInt(50),
              planEstudio: {
                carrera: { idCarrera: BigInt(99), nombre: 'Medicina' },
              },
            },
          },
        },
      } as any);

      repository.getUserCarreraIds.mockResolvedValue([BigInt(1)]); // Solo Sistemas

      await expect(
        service.finalizarSorteo(
          { idDefensa: '1', idArea: '2', idCaso: '3' },
          mockJefeUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Enlaces de Espectador Móvil (Sin Autenticación)', () => {
    it('debe generar un enlace temporal con token y slug únicos', async () => {
      repository.findDefensaWithDetails.mockResolvedValue({
        idDefensa: BigInt(1),
        instancia: {
          proceso: {
            estudiante: {
              idEstudiante: BigInt(50),
              nombreCompleto: 'Ana Belén',
              carnetEstudiantil: 'SIS-99',
              correoInstitucional: 'ana@uni.edu.bo',
              planEstudio: {
                carrera: { idCarrera: BigInt(1), nombre: 'Sistemas' },
              },
            },
          },
        },
      } as any);

      repository.crearSesionEspectador.mockResolvedValue({
        idSesion: BigInt(1),
        token: 'uuid-test-token',
        slug: 'sorteo-ab12',
        fechaExpiracion: new Date(Date.now() + 7200000),
      } as any);

      const res = await service.generarEnlaceEspectador(
        { idDefensa: '1', duracionMinutos: 120 },
        mockSecretariaUser,
      );

      expect(res.token).toBe('uuid-test-token');
      expect(res.slug).toBe('sorteo-ab12');
      expect(res.urlEspectador).toContain('/sorteos/espectador/sorteo-ab12');
      expect(res.estudiante.nombreCompleto).toBe('Ana Belén');
    });

    it('debe retornar estado EXPIRADO si la sesión ya pasó su tiempo límite', async () => {
      repository.findSesionEspectadorByTokenOrSlug.mockResolvedValue({
        idSesion: BigInt(1),
        token: 'expired-token',
        slug: 'sorteo-exp',
        fechaExpiracion: new Date('2020-01-01'), // Fecha pasada
        activo: true,
        fase: 'ESPERANDO',
        defensa: { idDefensa: BigInt(1), tipoDefensa: { nombre: 'INTERNA' } },
        estudiante: {
          nombreCompleto: 'Test',
          carnetEstudiantil: 'TEST',
          planEstudio: { carrera: { nombre: 'Test' } },
        },
      } as any);

      const vista = await service.obtenerVistaEspectador('sorteo-exp');
      expect(vista.expirado).toBe(true);
      expect(vista.fase).toBe('EXPIRADO');
    });

    it('debe arrojar NotFoundException si el slug o token no existe', async () => {
      repository.findSesionEspectadorByTokenOrSlug.mockResolvedValue(null);

      await expect(
        service.obtenerVistaEspectador('slug-invalido'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

