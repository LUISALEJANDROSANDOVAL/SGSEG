import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CasosService } from './casos.service';
import { CasosRepository } from '../repositories/casos.repository';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('CasosService', () => {
  let service: CasosService;
  let repository: jest.Mocked<CasosRepository>;

  const mockJefeUser: AuthenticatedUser = {
    idUsuario: '10',
    correoInstitucional: 'jefe.sistemas@uni.edu.bo',
    rol: 'JEFE_CARRERA',
  };

  const mockCoordUser: AuthenticatedUser = {
    idUsuario: '1',
    correoInstitucional: 'coord@uni.edu.bo',
    rol: 'COORDINACION',
  };

  beforeEach(() => {
    repository = {
      getUserCarreraIds: jest.fn(),
      findCasos: jest.fn(),
      countCasos: jest.fn(),
      findCasoById: jest.fn(),
      createCaso: jest.fn(),
      updateCaso: jest.fn(),
      setEstadoCaso: jest.fn(),
      reactivarCasoEspecial: jest.fn(),
      findAreaById: jest.fn(),
      findAreas: jest.fn(),
      createArea: jest.fn(),
      getMetricas: jest.fn(),
      findCasosPorCarreraVista: jest.fn(),
      findAreasPorCarreraVista: jest.fn(),
    } as unknown as jest.Mocked<CasosRepository>;

    service = new CasosService(repository);
  });

  it('debe rechazar a un Jefe de Carrera sin carreras asignadas', async () => {
    repository.getUserCarreraIds.mockResolvedValue([]);

    await expect(
      service.findAll({}, mockJefeUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('debe impedir que un Jefe de Carrera cree un caso en un área ajena a su carrera', async () => {
    repository.getUserCarreraIds.mockResolvedValue([BigInt(1)]); // Carrera 1
    repository.findAreaById.mockResolvedValue({
      idArea: BigInt(5),
      idCarrera: BigInt(99), // Carrera 99 (otra carrera)
      nombre: 'Derecho Penal',
      umbralDisponibilidad: 2,
      estado: 'ACTIVO',
      carrera: {
        idCarrera: BigInt(99),
        idFacultad: BigInt(2),
        nombre: 'Derecho',
        facultad: { idFacultad: BigInt(2), nombre: 'Facultad de Derecho' },
      },
    });

    await expect(
      service.create(
        {
          idArea: '5',
          titulo: 'Caso de prueba en área ajena',
          contenido: 'Planteamiento del problema de prueba...',
        },
        mockJefeUser,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('debe permitir crear un caso si el área pertenece a la carrera del Jefe de Carrera', async () => {
    repository.getUserCarreraIds.mockResolvedValue([BigInt(1)]);
    repository.findAreaById.mockResolvedValue({
      idArea: BigInt(1),
      idCarrera: BigInt(1),
      nombre: 'Ingeniería de Software',
      umbralDisponibilidad: 2,
      estado: 'ACTIVO',
      carrera: {
        idCarrera: BigInt(1),
        idFacultad: BigInt(1),
        nombre: 'Ingeniería de Sistemas',
        facultad: { idFacultad: BigInt(1), nombre: 'Tecnología' },
      },
    });

    repository.createCaso.mockResolvedValue({
      idCasoEstudio: BigInt(100),
      idArea: BigInt(1),
      titulo: 'Arquitectura Limpia',
      contenido: 'Planteamiento de arquitectura hexagonal...',
      documentoAdjunto: null,
      estado: 'DISPONIBLE',
      area: {
        idArea: BigInt(1),
        idCarrera: BigInt(1),
        nombre: 'Ingeniería de Software',
        umbralDisponibilidad: 2,
        estado: 'ACTIVO',
        carrera: {
          idCarrera: BigInt(1),
          idFacultad: BigInt(1),
          nombre: 'Ingeniería de Sistemas',
          facultad: { idFacultad: BigInt(1), nombre: 'Tecnología' },
        },
      },
    });

    const res = await service.create(
      {
        idArea: '1',
        titulo: 'Arquitectura Limpia',
        contenido: 'Planteamiento de arquitectura hexagonal...',
      },
      mockJefeUser,
    );

    expect(res.caso.idCasoEstudio).toBe('100');
    expect(res.caso.titulo).toBe('Arquitectura Limpia');
  });

  it('debe calcular el estado efectivo AGOTADO cuando el caso alcanza el umbral de usos', async () => {
    repository.getUserCarreraIds.mockResolvedValue([BigInt(1)]);
    repository.findCasos.mockResolvedValue([
      {
        idCasoEstudio: BigInt(1),
        idArea: BigInt(1),
        titulo: 'Caso muy solicitado',
        contenido: 'Descripción...',
        documentoAdjunto: null,
        estado: 'DISPONIBLE',
        area: {
          idArea: BigInt(1),
          idCarrera: BigInt(1),
          nombre: 'Ingeniería de Software',
          umbralDisponibilidad: 2,
          estado: 'ACTIVO',
          carrera: {
            idCarrera: BigInt(1),
            idFacultad: BigInt(1),
            nombre: 'Ingeniería de Sistemas',
            facultad: { idFacultad: BigInt(1), nombre: 'Tecnología' },
          },
        },
        _count: { defensas: 2, sorteosCaso: 2 }, // Total usos: 2
      },
    ]);
    repository.countCasos.mockResolvedValue(1);

    const res = await service.findAll({}, mockJefeUser);

    expect(res.items[0].usos).toBe(2);
    expect(res.items[0].estadoEfectivo).toBe('AGOTADO');
  });

  it('debe permitir que un Jefe de Carrera reactive un caso de su carrera por caso especial', async () => {
    repository.getUserCarreraIds.mockResolvedValue([BigInt(1)]);
    repository.findCasoById.mockResolvedValue({
      idCasoEstudio: BigInt(10),
      idArea: BigInt(1),
      titulo: 'Caso Agotado',
      contenido: 'Planteamiento...',
      documentoAdjunto: null,
      estado: 'AGOTADO',
      area: {
        idArea: BigInt(1),
        idCarrera: BigInt(1),
        nombre: 'Ingeniería de Software',
        umbralDisponibilidad: 2,
        estado: 'ACTIVO',
        carrera: {
          idCarrera: BigInt(1),
          idFacultad: BigInt(1),
          nombre: 'Ingeniería de Sistemas',
          facultad: { idFacultad: BigInt(1), nombre: 'Tecnología' },
        },
      },
      _count: { defensas: 2, sorteosCaso: 2 },
    });

    repository.reactivarCasoEspecial.mockResolvedValue({
      idCasoEstudio: BigInt(10),
      idArea: BigInt(1),
      titulo: 'Caso Agotado',
      contenido: 'Planteamiento...',
      documentoAdjunto: null,
      estado: 'REACTIVADO_ESPECIAL',
      area: {
        idArea: BigInt(1),
        idCarrera: BigInt(1),
        nombre: 'Ingeniería de Software',
        umbralDisponibilidad: 2,
        estado: 'ACTIVO',
        carrera: {
          idCarrera: BigInt(1),
          idFacultad: BigInt(1),
          nombre: 'Ingeniería de Sistemas',
          facultad: { idFacultad: BigInt(1), nombre: 'Tecnología' },
        },
      },
      _count: { defensas: 2, sorteosCaso: 2 },
    });

    const res = await service.reactivarCasoEspecial(
      '10',
      { motivo: 'Excepción académica por estudiante extraordinario' },
      mockJefeUser,
    );

    expect(res.caso.estadoEfectivo).toBe('REACTIVADO_ESPECIAL');
    expect(repository.reactivarCasoEspecial).toHaveBeenCalledWith(
      BigInt(10),
      'Excepción académica por estudiante extraordinario',
      BigInt(10),
    );
  });

  it('debe impedir que un rol distinto a Jefe de Carrera reactive un caso por caso especial', async () => {
    await expect(
      service.reactivarCasoEspecial(
        '10',
        { motivo: 'Intento no autorizado' },
        mockCoordUser,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('debe lanzar NotFoundException si se solicita un caso que no existe', async () => {
    repository.findCasoById.mockResolvedValue(null);

    await expect(service.findById('999', mockCoordUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('Vistas Optimizadas por idCarrera', () => {
    it('debe permitir a Coordinación consultar casos mediante vista para cualquier carrera', async () => {
      repository.findCasosPorCarreraVista.mockResolvedValue({
        items: [
          {
            id_caso_estudio: BigInt(1),
            titulo: 'Caso Vista 1',
            contenido: 'Contenido Vista',
            documento_adjunto: null,
            estado_base: 'DISPONIBLE',
            id_area: BigInt(267),
            nombre_area: 'Desarrollo de Software',
            umbral_disponibilidad: 2,
            estado_area: 'ACTIVO',
            id_carrera: BigInt(98),
            nombre_carrera: 'Sistemas',
            id_facultad: BigInt(45),
            nombre_facultad: 'Tecnología',
            total_usos: 0,
            total_sorteos: 0,
            estado_efectivo: 'DISPONIBLE',
            es_disponible_para_sorteo: true,
          },
        ],
        total: 1,
      });

      const res = await service.getCasosPorCarreraVista('98', {}, mockCoordUser);

      expect(res.items).toHaveLength(1);
      expect(res.items[0].idCasoEstudio).toBe('1');
      expect(res.items[0].nombreCarrera).toBe('Sistemas');
      expect(res.items[0].esDisponibleParaSorteo).toBe(true);
      expect(repository.findCasosPorCarreraVista).toHaveBeenCalledWith(
        BigInt(98),
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('debe denegar a un Jefe de Carrera consultar casos de una carrera distinta a la asignada', async () => {
      repository.getUserCarreraIds.mockResolvedValue([BigInt(85)]); // Solo asignado a Carrera 85

      await expect(
        service.getCasosPorCarreraVista('98', {}, mockJefeUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe retornar áreas estructuradas con stock crítico mediante vista_areas_por_carrera', async () => {
      repository.findAreasPorCarreraVista.mockResolvedValue([
        {
          id_area: BigInt(267),
          nombre_area: 'Desarrollo de Software',
          umbral_disponibilidad: 2,
          estado_area: 'ACTIVO',
          id_carrera: BigInt(98),
          nombre_carrera: 'Sistemas',
          id_facultad: BigInt(45),
          nombre_facultad: 'Tecnología',
          total_casos: 1,
          casos_disponibles: 1,
          casos_agotados: 0,
          casos_inactivos: 0,
          stock_critico: true,
          mensaje_alerta: 'Alerta: Stock crítico',
        },
      ]);

      const res = await service.getAreasPorCarreraVista('98', mockCoordUser);

      expect(res).toHaveLength(1);
      expect(res[0].idArea).toBe('267');
      expect(res[0].stockCritico).toBe(true);
      expect(res[0].mensajeAlerta).toBe('Alerta: Stock crítico');
      expect(repository.findAreasPorCarreraVista).toHaveBeenCalledWith(BigInt(98));
    });
  });
});

