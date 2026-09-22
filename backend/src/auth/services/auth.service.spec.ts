import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthRepository } from '../repositories/auth.repository';

describe('AuthService', () => {
  it('should throw UnauthorizedException when credentials are invalid', async () => {
    const authRepository = {
      findByCorreoInstitucional: jest.fn().mockResolvedValue(null),
    } as unknown as AuthRepository;

    const jwtService = {
      signAsync: jest.fn(),
    } as unknown as JwtService;

    const service = new AuthService(authRepository, jwtService);

    await expect(
      service.login({
        correoInstitucional: 'coord@uni.edu.bo',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return sanitized user profile on getProfile', async () => {
    const mockUser = {
      idUsuario: BigInt(1),
      primerNombre: 'Ana',
      primerApellido: 'Flores',
      segundoNombre: null,
      segundoApellido: null,
      correoInstitucional: 'secretaria@uni.edu.bo',
      estado: 'ACTIVO',
      rol: { nombre: 'SECRETARIADO' },
      carreras: [],
    };

    const authRepository = {
      findById: jest.fn().mockResolvedValue(mockUser),
    } as unknown as AuthRepository;

    const jwtService = {} as unknown as JwtService;
    const service = new AuthService(authRepository, jwtService);

    const profile = await service.getProfile('1');
    expect(profile.correoInstitucional).toBe('secretaria@uni.edu.bo');
    expect(profile.rol).toBe('SECRETARIADO');
    expect(profile.primerNombre).toBe('Ana');
  });

  it('should throw UnauthorizedException if user not found or inactive in getProfile', async () => {
    const authRepository = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as AuthRepository;

    const jwtService = {} as unknown as JwtService;
    const service = new AuthService(authRepository, jwtService);

    await expect(service.getProfile('999')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  describe('adminResetPassword', () => {
    it('debe permitir a Coordinación o SuperAdmin resetear la contraseña de un usuario', async () => {
      const mockTarget = {
        idUsuario: BigInt(2),
        correoInstitucional: 'jefe.sistemas@uni.edu.bo',
        rol: { nombre: 'JEFE_CARRERA' },
      };

      const authRepository = {
        findById: jest.fn().mockResolvedValue(mockTarget),
        updatePassword: jest.fn().mockResolvedValue(mockTarget),
      } as unknown as AuthRepository;

      const jwtService = {} as unknown as JwtService;
      const service = new AuthService(authRepository, jwtService);

      const res = await service.adminResetPassword(
        { idUsuario: '2', newPassword: 'NewPassword123!' },
        { idUsuario: '1', correoInstitucional: 'coord@uni.edu.bo', rol: 'COORDINACION' },
      );

      expect(res.success).toBe(true);
      expect(authRepository.updatePassword).toHaveBeenCalled();
    });

    it('debe permitir reseteo de emergencia usando adminSecret válido sin sesión de usuario', async () => {
      process.env.ADMIN_FALLBACK_SECRET = 'TEST_SECRET_123';
      const mockTarget = {
        idUsuario: BigInt(1),
        correoInstitucional: 'coord@uni.edu.bo',
        rol: { nombre: 'COORDINACION' },
      };

      const authRepository = {
        findById: jest.fn().mockResolvedValue(mockTarget),
        updatePassword: jest.fn().mockResolvedValue(mockTarget),
      } as unknown as AuthRepository;

      const jwtService = {} as unknown as JwtService;
      const service = new AuthService(authRepository, jwtService);

      const res = await service.adminResetPassword({
        idUsuario: '1',
        adminSecret: 'TEST_SECRET_123',
      });

      expect(res.success).toBe(true);
      expect(res.nuevaContrasenaTemporal).toBeDefined();
    });

    it('debe rechazar reseteo administrativo si el rol es no autorizado y no hay secreto válido', async () => {
      const authRepository = {} as unknown as AuthRepository;
      const jwtService = {} as unknown as JwtService;
      const service = new AuthService(authRepository, jwtService);

      await expect(
        service.adminResetPassword(
          { idUsuario: '2' },
          { idUsuario: '3', correoInstitucional: 'jefe.sistemas@uni.edu.bo', rol: 'JEFE_CARRERA' },
        ),
      ).rejects.toThrow('No tienes autorización para realizar el reseteo administrativo');
    });

    it('debe impedir que Coordinación resetee a un SuperAdmin', async () => {
      const mockSuperAdmin = {
        idUsuario: BigInt(99),
        correoInstitucional: 'superadmin@uni.edu.bo',
        rol: { nombre: 'SUPER_ADMIN' },
      };

      const authRepository = {
        findById: jest.fn().mockResolvedValue(mockSuperAdmin),
      } as unknown as AuthRepository;

      const jwtService = {} as unknown as JwtService;
      const service = new AuthService(authRepository, jwtService);

      await expect(
        service.adminResetPassword(
          { idUsuario: '99', newPassword: 'HackPassword123!' },
          { idUsuario: '1', correoInstitucional: 'coord@uni.edu.bo', rol: 'COORDINACION' },
        ),
      ).rejects.toThrow('Un usuario con rol COORDINACION no puede restablecer la contraseña de un SUPER_ADMIN');
    });
  });

  describe('updateUserEstado', () => {
    it('debe rechazar que un usuario desactive su propia cuenta', async () => {
      const mockUser = {
        idUsuario: BigInt(1),
        correoInstitucional: 'coord@uni.edu.bo',
      };

      const authRepository = {
        findById: jest.fn().mockResolvedValue(mockUser),
      } as unknown as AuthRepository;

      const jwtService = {} as unknown as JwtService;
      const service = new AuthService(authRepository, jwtService);

      await expect(
        service.updateUserEstado(
          '1',
          { estado: 'INACTIVO' },
          { idUsuario: '1', correoInstitucional: 'vice@uni.edu.bo', rol: 'VICERRECTORADO' },
        ),
      ).rejects.toThrow('No puedes inactivar tu propia cuenta activa');
    });
  });
});
