import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const correoInstitucional = dto.correoInstitucional.trim().toLowerCase();

    const user =
      await this.authRepository.findByCorreoInstitucional(correoInstitucional);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: String(user.idUsuario),
      correoInstitucional: user.correoInstitucional,
      rol: user.rol.nombre,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        idUsuario: String(user.idUsuario),
        primerNombre: user.primerNombre,
        segundoNombre: user.segundoNombre,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        correoInstitucional: user.correoInstitucional,
        rol: user.rol.nombre,
        estado: user.estado,
        carreras: (user.carreras ?? []).map((uc) => ({
          idCarrera: String(uc.carrera.idCarrera),
          nombre: uc.carrera.nombre,
        })),
      },
    };
  }

  async getProfile(idUsuario: string) {
    const user = await this.authRepository.findById(Number(idUsuario));

    if (!user || user.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return {
      idUsuario: String(user.idUsuario),
      primerNombre: user.primerNombre,
      segundoNombre: user.segundoNombre,
      primerApellido: user.primerApellido,
      segundoApellido: user.segundoApellido,
      correoInstitucional: user.correoInstitucional,
      rol: user.rol.nombre,
      estado: user.estado,
      carreras: (user.carreras ?? []).map((uc) => ({
        idCarrera: String(uc.carrera.idCarrera),
        nombre: uc.carrera.nombre,
      })),
    };
  }

  async validateUser(payload: { sub: string; correoInstitucional: string }) {
    const user = await this.authRepository.findById(Number(payload.sub));

    if (!user) {
      return null;
    }

    return {
      idUsuario: String(user.idUsuario),
      correoInstitucional: user.correoInstitucional,
      rol: user.rol?.nombre ?? null,
    };
  }
}
