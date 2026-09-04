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
});
