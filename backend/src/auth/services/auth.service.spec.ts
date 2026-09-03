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
});
