import { Test, TestingModule } from '@nestjs/testing';
import { EstudiantesController } from './estudiantes.controller';
import { EstudiantesService } from '../services/estudiantes.service';

describe('EstudiantesController', () => {
  let controller: EstudiantesController;
  let service: jest.Mocked<EstudiantesService>;

  beforeEach(async () => {
    const serviceMock = {
      bulkUpsertEstudiantes: jest.fn(),
      getCarreras: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findByCarnet: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstudiantesController],
      providers: [
        {
          provide: EstudiantesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<EstudiantesController>(EstudiantesController);
    service = module.get(EstudiantesService);
  });

  it('debería invocar bulkUpsertEstudiantes en el servicio', async () => {
    const dto = { estudiantes: [] };
    service.bulkUpsertEstudiantes.mockResolvedValue({
      total: 0,
      creados: 0,
      actualizados: 0,
      planesCreados: 0,
      planesCreadosDetalle: [],
      errores: [],
      duracionMs: 10,
    });

    const res = await controller.bulkUpsert(dto);
    expect(service.bulkUpsertEstudiantes).toHaveBeenCalledWith(dto);
    expect(res.total).toBe(0);
  });

  it('debería invocar findAll con filtros de carrera y paginación', async () => {
    const query = { idCarrera: '1', page: 1, limit: 10 };
    service.findAll.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const res = await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(res.pagination.page).toBe(1);
  });

  it('debería invocar softDelete en el servicio al invocar DELETE /:id', async () => {
    service.softDelete.mockResolvedValue({
      mensaje: 'Estudiante desactivado correctamente (soft delete).',
      estudiante: {} as any,
    });

    const res = await controller.softDelete('1');
    expect(service.softDelete).toHaveBeenCalledWith('1');
    expect(res.mensaje).toContain('soft delete');
  });

  it('debería invocar restore en el servicio al invocar PATCH /:id/restore', async () => {
    service.restore.mockResolvedValue({
      mensaje: 'Estudiante restaurado a estado ACTIVO.',
      estudiante: {} as any,
    });

    const res = await controller.restore('1');
    expect(service.restore).toHaveBeenCalledWith('1');
    expect(res.mensaje).toContain('restaurado');
  });

  it('debería invocar getCarreras en el servicio', async () => {
    service.getCarreras.mockResolvedValue([
      {
        idCarrera: '1',
        nombre: 'Ingeniería de Sistemas',
      } as any,
    ]);

    const res = await controller.getCarreras();
    expect(service.getCarreras).toHaveBeenCalled();
    expect(res).toHaveLength(1);
  });
});
