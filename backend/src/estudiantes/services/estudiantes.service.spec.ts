import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstudiantesNormalizerService } from './estudiantes-normalizer.service';
import { EstudiantesService } from './estudiantes.service';
import { EstudiantesRepository } from '../repositories/estudiantes.repository';

describe('EstudiantesService', () => {
  let service: EstudiantesService;
  let repository: jest.Mocked<EstudiantesRepository>;
  let normalizer: EstudiantesNormalizerService;

  beforeEach(() => {
    repository = {
      executeInTransaction: jest.fn(),
      findCarreraById: jest.fn(),
      findCarreraByName: jest.fn(),
      findPlanById: jest.fn(),
      findPlanByCarreraAndNombre: jest.fn(),
      findDefaultPlanByCarrera: jest.fn(),
      createPlanEstudio: jest.fn(),
      upsertEstudianteInTx: jest.fn(),
      findByCarnetEstudiantil: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findCarrerasWithPlans: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    } as unknown as jest.Mocked<EstudiantesRepository>;

    normalizer = new EstudiantesNormalizerService();
    service = new EstudiantesService(repository, normalizer);
  });

  describe('bulkUpsertEstudiantes', () => {
    it('debería retornar resultado vacío si no se envían estudiantes', async () => {
      const result = await service.bulkUpsertEstudiantes({ estudiantes: [] });
      expect(result.total).toBe(0);
      expect(result.creados).toBe(0);
      expect(result.actualizados).toBe(0);
      expect(result.errores).toHaveLength(0);
    });

    it('debería insertar nuevos estudiantes y auto-crear planes no existentes en una transacción', async () => {
      const carreraMock = {
        idCarrera: BigInt(1),
        idFacultad: BigInt(1),
        nombre: 'Ingeniería de Sistemas',
        facultad: { idFacultad: BigInt(1), nombre: 'Facultad de Ingeniería' },
      };

      const planMock = {
        idPlanEstudio: BigInt(10),
        idCarrera: BigInt(1),
        nombre: 'Plan 2024',
        estadoVigencia: 'VIGENTE',
        carrera: carreraMock,
      };

      repository.findCarreraByName.mockResolvedValue(carreraMock);
      repository.findPlanByCarreraAndNombre.mockResolvedValue(null);
      repository.createPlanEstudio.mockResolvedValue(planMock);

      repository.executeInTransaction.mockImplementation(async (callback) => {
        const txMock = {} as any;
        return callback(txMock);
      });

      repository.upsertEstudianteInTx.mockResolvedValue({
        record: {
          idEstudiante: BigInt(100),
          idPlanEstudio: BigInt(10),
          carnetEstudiantil: 'SIS-20230001',
          carnetIdentidad: '8392011 LP',
          nombreCompleto: 'Juan Carlos Perez',
          correo: 'juan.perez@uni.edu.bo',
          estado: 'ACTIVO',
          fechaRegistro: new Date(),
          planEstudio: planMock,
        },
        isNew: true,
      });

      const result = await service.bulkUpsertEstudiantes({
        estudiantes: [
          {
            carnetEstudiantil: '  sis-20230001 ',
            carnetIdentidad: '8392011 lp',
            nombreCompleto: '  JUAN   CARLOS   PEREZ  ',
            correo: 'juan.perez@uni.edu.bo',
            nombreCarrera: 'Ingeniería de Sistemas',
            nombrePlanEstudio: 'Plan 2024',
          },
        ],
      });

      expect(result.total).toBe(1);
      expect(result.creados).toBe(1);
      expect(result.actualizados).toBe(0);
      expect(result.planesCreados).toBe(1);
      expect(result.planesCreadosDetalle[0].nombre).toBe('Plan 2024');
      expect(result.errores).toHaveLength(0);
    });

    it('debería actualizar (isNew = false) si el estudiante ya existe sin generar errores', async () => {
      const carreraMock = {
        idCarrera: BigInt(1),
        idFacultad: BigInt(1),
        nombre: 'Ingeniería de Sistemas',
        facultad: { idFacultad: BigInt(1), nombre: 'Facultad de Ingeniería' },
      };

      const planMock = {
        idPlanEstudio: BigInt(10),
        idCarrera: BigInt(1),
        nombre: 'Plan 2024',
        estadoVigencia: 'VIGENTE',
        carrera: carreraMock,
      };

      repository.findCarreraByName.mockResolvedValue(carreraMock);
      repository.findPlanByCarreraAndNombre.mockResolvedValue(planMock);

      repository.executeInTransaction.mockImplementation(async (callback) => {
        const txMock = {} as any;
        return callback(txMock);
      });

      repository.upsertEstudianteInTx.mockResolvedValue({
        record: {
          idEstudiante: BigInt(100),
          idPlanEstudio: BigInt(10),
          carnetEstudiantil: 'SIS-20230001',
          carnetIdentidad: '8392011 LP',
          nombreCompleto: 'Juan Carlos Perez Modificado',
          correo: 'juan.perez@uni.edu.bo',
          estado: 'ACTIVO',
          fechaRegistro: new Date(),
          planEstudio: planMock,
        },
        isNew: false,
      });

      const result = await service.bulkUpsertEstudiantes({
        estudiantes: [
          {
            carnetEstudiantil: 'SIS-20230001',
            carnetIdentidad: '8392011 LP',
            nombreCompleto: 'Juan Carlos Perez Modificado',
            nombreCarrera: 'Ingeniería de Sistemas',
            nombrePlanEstudio: 'Plan 2024',
          },
        ],
      });

      expect(result.total).toBe(1);
      expect(result.creados).toBe(0);
      expect(result.actualizados).toBe(1);
      expect(result.planesCreados).toBe(0);
      expect(result.errores).toHaveLength(0);
    });

    it('debería asociar al plan por defecto si no se indica nombrePlanEstudio', async () => {
      const planDefaultMock = {
        idPlanEstudio: BigInt(5),
        idCarrera: BigInt(2),
        nombre: 'PLAN VIGENTE GENERAL',
        estadoVigencia: 'VIGENTE',
        carrera: {
          idCarrera: BigInt(2),
          idFacultad: BigInt(1),
          nombre: 'Ingeniería Industrial',
          facultad: { idFacultad: BigInt(1), nombre: 'Facultad de Ingeniería' },
        },
      };

      repository.findDefaultPlanByCarrera.mockResolvedValue(planDefaultMock);

      repository.executeInTransaction.mockImplementation(async (callback) => {
        const txMock = {} as any;
        return callback(txMock);
      });

      repository.upsertEstudianteInTx.mockResolvedValue({
        record: {
          idEstudiante: BigInt(101),
          idPlanEstudio: BigInt(5),
          carnetEstudiantil: 'IND-20230002',
          carnetIdentidad: '7482910 CB',
          nombreCompleto: 'Valeria Andrea Rojas Mamani',
          correo: 'ind20230002@estudiante.edu.bo',
          estado: 'ACTIVO',
          fechaRegistro: new Date(),
          planEstudio: planDefaultMock,
        },
        isNew: true,
      });

      const result = await service.bulkUpsertEstudiantes({
        idCarreraPorDefecto: '2',
        estudiantes: [
          {
            carnetEstudiantil: 'IND-20230002',
            carnetIdentidad: '7482910 CB',
            nombres: 'valeria andrea',
            primerApellido: 'rojas',
            segundoApellido: 'mamani',
          },
        ],
      });

      expect(result.total).toBe(1);
      expect(result.creados).toBe(1);
      expect(result.errores).toHaveLength(0);
    });

    it('debería registrar error para filas con datos incompletos o inválidos sin romper el resto', async () => {
      const result = await service.bulkUpsertEstudiantes({
        estudiantes: [
          {
            carnetEstudiantil: '',
            carnetIdentidad: '8392011 LP',
            nombreCompleto: 'Sin Carnet',
          },
          {
            carnetEstudiantil: 'SIS-20230002',
            carnetIdentidad: '',
            nombreCompleto: 'Sin CI',
          },
        ],
      });

      expect(result.total).toBe(2);
      expect(result.creados).toBe(0);
      expect(result.errores).toHaveLength(2);
      expect(result.errores[0].mensaje).toContain(
        'Carnet estudiantil no válido',
      );
      expect(result.errores[1].mensaje).toContain(
        'Carnet de identidad no válido',
      );
    });
  });

  describe('findAll', () => {
    it('debería filtrar estudiantes por carrera, plan y serializar BigInt a string', async () => {
      repository.findMany.mockResolvedValue([
        {
          idEstudiante: BigInt(1),
          idPlanEstudio: BigInt(10),
          carnetEstudiantil: 'SIS-20230001',
          carnetIdentidad: '8392011 LP',
          nombreCompleto: 'Alejandro Morales',
          correo: 'alejandro@uni.edu.bo',
          estado: 'ACTIVO',
          fechaRegistro: new Date(),
          planEstudio: {
            idPlanEstudio: BigInt(10),
            idCarrera: BigInt(1),
            nombre: 'Plan 2024',
            estadoVigencia: 'VIGENTE',
            carrera: {
              idCarrera: BigInt(1),
              idFacultad: BigInt(1),
              nombre: 'Ingeniería de Sistemas',
              facultad: {
                idFacultad: BigInt(1),
                nombre: 'Facultad de Ingeniería',
              },
            },
          },
        },
      ]);

      repository.count.mockResolvedValue(1);

      const res = await service.findAll({
        idCarrera: '1',
        idPlanEstudio: '10',
        page: 1,
        limit: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].idEstudiante).toBe('1');
      expect(res.items[0].idPlanEstudio).toBe('10');
      expect(res.pagination.total).toBe(1);
    });
  });

  describe('softDelete y restore', () => {
    it('debería aplicar soft-delete a un estudiante cambiando su estado a ELIMINADO', async () => {
      repository.findById.mockResolvedValue({
        idEstudiante: BigInt(1),
        carnetEstudiantil: 'SIS-20230001',
        estado: 'ACTIVO',
      } as any);

      repository.softDelete.mockResolvedValue({
        idEstudiante: BigInt(1),
        carnetEstudiantil: 'SIS-20230001',
        estado: 'ELIMINADO',
      } as any);

      const res = await service.softDelete('1');
      expect(res.mensaje).toContain('soft delete');
      expect(repository.softDelete).toHaveBeenCalledWith(BigInt(1));
    });

    it('debería restaurar un estudiante eliminado a estado ACTIVO', async () => {
      repository.findById.mockResolvedValue({
        idEstudiante: BigInt(1),
        carnetEstudiantil: 'SIS-20230001',
        estado: 'ELIMINADO',
      } as any);

      repository.restore.mockResolvedValue({
        idEstudiante: BigInt(1),
        carnetEstudiantil: 'SIS-20230001',
        estado: 'ACTIVO',
      } as any);

      const res = await service.restore('1');
      expect(res.mensaje).toContain('restaurado');
      expect(repository.restore).toHaveBeenCalledWith(BigInt(1));
    });

    it('debería lanzar NotFoundException si el estudiante no existe', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.softDelete('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCarreras', () => {
    it('debería retornar la lista de carreras con BigInt serializados', async () => {
      repository.findCarrerasWithPlans.mockResolvedValue([
        {
          idCarrera: BigInt(1),
          idFacultad: BigInt(1),
          nombre: 'Ingeniería de Sistemas',
          facultad: { idFacultad: BigInt(1), nombre: 'Facultad de Ingeniería' },
          planesEstudio: [
            {
              idPlanEstudio: BigInt(10),
              idCarrera: BigInt(1),
              nombre: 'Plan 2024',
              estadoVigencia: 'VIGENTE',
            },
          ],
        },
      ]);

      const res = await service.getCarreras();
      expect(res).toHaveLength(1);
      expect(res[0].idCarrera).toBe('1');
      expect(res[0].planesEstudio[0].idPlanEstudio).toBe('10');
    });
  });
});
