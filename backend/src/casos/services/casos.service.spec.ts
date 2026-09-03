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
      findAreaById: jest.fn(),
      findAreas: jest.fn(),
      createArea: jest.fn(),
      getMetricas: jest.fn(),
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
        _count: { defensas: 1, sorteosCaso: 1 }, // Total usos: 2
      },
    ]);
    repository.countCasos.mockResolvedValue(1);

    const res = await service.findAll({}, mockJefeUser);

    expect(res.items[0].usos).toBe(2);
    expect(res.items[0].estadoEfectivo).toBe('AGOTADO');
  });

  it('debe lanzar NotFoundException si se solicita un caso que no existe', async () => {
    repository.findCasoById.mockResolvedValue(null);

    await expect(service.findById('999', mockCoordUser)).rejects.toThrow(
      NotFoundException,
    );
  });
});
