import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
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

  async updateProfile(idUsuario: string, dto: UpdateProfileDto) {
    const user = await this.authRepository.findById(Number(idUsuario));
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (dto.correoInstitucional && dto.correoInstitucional !== user.correoInstitucional) {
      const existing = await this.authRepository.findByCorreoInstitucional(
        dto.correoInstitucional.trim().toLowerCase(),
      );
      if (existing && String(existing.idUsuario) !== idUsuario) {
        throw new BadRequestException('El correo institucional ya está registrado por otro usuario');
      }
    }

    const updated = await this.authRepository.updateProfile(Number(idUsuario), {
      ...(dto.primerNombre ? { primerNombre: dto.primerNombre.trim() } : {}),
      ...(dto.segundoNombre !== undefined ? { segundoNombre: dto.segundoNombre?.trim() || null } : {}),
      ...(dto.primerApellido ? { primerApellido: dto.primerApellido.trim() } : {}),
      ...(dto.segundoApellido !== undefined ? { segundoApellido: dto.segundoApellido?.trim() || null } : {}),
      ...(dto.correoInstitucional ? { correoInstitucional: dto.correoInstitucional.trim().toLowerCase() } : {}),
    });

    return {
      idUsuario: String(updated.idUsuario),
      primerNombre: updated.primerNombre,
      segundoNombre: updated.segundoNombre,
      primerApellido: updated.primerApellido,
      segundoApellido: updated.segundoApellido,
      correoInstitucional: updated.correoInstitucional,
      rol: updated.rol.nombre,
      estado: updated.estado,
      carreras: (updated.carreras ?? []).map((uc) => ({
        idCarrera: String(uc.carrera.idCarrera),
        nombre: uc.carrera.nombre,
      })),
    };
  }

  async changePassword(idUsuario: string, dto: ChangePasswordDto) {
    const user = await this.authRepository.findById(Number(idUsuario));
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const currentMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!currentMatches) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la anterior');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.authRepository.updatePassword(Number(idUsuario), newHash);

    return {
      mensaje: 'Contraseña actualizada correctamente',
      success: true,
    };
  }

  async listUsers() {
    const users = await this.authRepository.findAll();
    return users.map((u) => ({
      id: String(u.idUsuario),
      idUsuario: String(u.idUsuario),
      nombre: [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
        .filter(Boolean)
        .join(' '),
      primerNombre: u.primerNombre,
      segundoNombre: u.segundoNombre,
      primerApellido: u.primerApellido,
      segundoApellido: u.segundoApellido,
      email: u.correoInstitucional,
      correoInstitucional: u.correoInstitucional,
      rol: u.rol.nombre,
      activo: u.estado === 'ACTIVO',
      estado: u.estado,
      carreras: (u.carreras ?? []).map((uc) => ({
        idCarrera: String(uc.carrera.idCarrera),
        nombre: uc.carrera.nombre,
      })),
    }));
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

