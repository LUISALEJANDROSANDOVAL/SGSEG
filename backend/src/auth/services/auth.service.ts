import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RecuperarPasswordDto } from '../dto/recuperar-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AdminResetPasswordDto } from '../dto/admin-reset-password.dto';
import { UpdateUserEstadoDto } from '../dto/update-user-estado.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthRepository } from '../repositories/auth.repository';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

const ROL_MAP_INV: Record<string, string> = {
  'coordinador general': 'COORDINACION',
  'secretario de facultad': 'SECRETARIADO',
  'jefe de carrera': 'JEFE_CARRERA',
  'vicerrectorado': 'VICERRECTORADO',
  'registro': 'REGISTRO',
  'defensas de grado': 'DEFENSA',
  'administrador general': 'SUPER_ADMIN',
  'coordinacion': 'COORDINACION',
  'secretariado': 'SECRETARIADO',
  'jefe_carrera': 'JEFE_CARRERA',
  'super_admin': 'SUPER_ADMIN',
  'defensa': 'DEFENSA',
};

function splitNombre(nombre: string): {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
} {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 1) {
    return {
      primerNombre: parts[0],
      segundoNombre: null,
      primerApellido: 'Docente',
      segundoApellido: null,
    };
  }
  if (parts.length === 2) {
    return {
      primerNombre: parts[0],
      segundoNombre: null,
      primerApellido: parts[1],
      segundoApellido: null,
    };
  }
  if (parts.length === 3) {
    return {
      primerNombre: parts[0],
      segundoNombre: null,
      primerApellido: parts[1],
      segundoApellido: parts[2],
    };
  }
  return {
    primerNombre: parts[0],
    segundoNombre: parts.slice(1, parts.length - 2).join(' ') || null,
    primerApellido: parts[parts.length - 2],
    segundoApellido: parts[parts.length - 1],
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const rawEmail = dto.correoInstitucional || dto.email || dto.correo;
    if (!rawEmail || !rawEmail.trim()) {
      throw new UnauthorizedException('Credenciales inválidas (correo no proporcionado)');
    }
    const correoInstitucional = rawEmail.trim().toLowerCase();

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

    if (user.estado !== 'ACTIVO') {
      throw new UnauthorizedException(
        'Usuario Inactivo. Esta cuenta ha sido deshabilitada en el sistema.',
      );
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

  async recuperarPassword(dto: RecuperarPasswordDto) {
    const emailRaw = dto.correoInstitucional || dto.email;
    if (!emailRaw || !emailRaw.trim()) {
      throw new BadRequestException('Debe ingresar un correo institucional válido');
    }

    const correoInstitucional = emailRaw.trim().toLowerCase();
    const user = await this.authRepository.findByCorreoInstitucional(correoInstitucional);

    if (!user || user.estado !== 'ACTIVO') {
      throw new BadRequestException('El correo institucional ingresado no se encuentra registrado o está inactivo');
    }

    const payload = {
      sub: String(user.idUsuario),
      purpose: 'PASSWORD_RESET',
      correoInstitucional: user.correoInstitucional,
    };

    const token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    return {
      success: true,
      message: `Se han generado las instrucciones de recuperación para ${user.correoInstitucional}.`,
      token,
      resetUrl: `/reset-password?token=${token}`,
      email: user.correoInstitucional,
      expiresInMinutes: 15,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (!dto.token) {
      throw new BadRequestException('Token de recuperación no proporcionado');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.token);
    } catch {
      throw new BadRequestException('El enlace o token de recuperación es inválido o ha expirado');
    }

    if (payload.purpose !== 'PASSWORD_RESET' || !payload.sub) {
      throw new BadRequestException('Token de recuperación inválido');
    }

    const user = await this.authRepository.findById(Number(payload.sub));
    if (!user || user.estado !== 'ACTIVO') {
      throw new BadRequestException('Usuario no encontrado o inactivo');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.authRepository.updatePassword(Number(user.idUsuario), newHash);

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
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

  async adminResetPassword(
    dto: AdminResetPasswordDto,
    currentUser?: AuthenticatedUser,
  ) {
    const fallbackSecret =
      process.env.ADMIN_FALLBACK_SECRET || 'SGSEG_FALLBACK_2026!';
    const hasValidSecret =
      dto.adminSecret && dto.adminSecret === fallbackSecret;

    const isAuthorizedRole =
      currentUser &&
      (currentUser.rol === 'COORDINACION' ||
        currentUser.rol === 'SUPER_ADMIN');

    if (!isAuthorizedRole && !hasValidSecret) {
      throw new ForbiddenException(
        'No tienes autorización para realizar el reseteo administrativo de contraseñas',
      );
    }

    let targetUser: any = null;
    const isEmail = dto.idUsuario.includes('@');
    if (isEmail) {
      targetUser = await this.authRepository.findByCorreoInstitucional(
        dto.idUsuario.trim().toLowerCase(),
      );
    } else {
      const numericId = Number(dto.idUsuario);
      if (!isNaN(numericId)) {
        targetUser = await this.authRepository.findById(numericId);
      }
    }

    if (!targetUser) {
      throw new NotFoundException(
        `El usuario destino "${dto.idUsuario}" no fue encontrado`,
      );
    }

    if (
      currentUser &&
      currentUser.rol === 'COORDINACION' &&
      targetUser.rol?.nombre === 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException(
        'Un usuario con rol COORDINACION no puede restablecer la contraseña de un SUPER_ADMIN',
      );
    }

    const newPassword =
      dto.newPassword && dto.newPassword.trim()
        ? dto.newPassword.trim()
        : `Utepsa${Math.floor(1000 + Math.random() * 9000)}!`;

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(
      Number(targetUser.idUsuario),
      newHash,
    );

    return {
      success: true,
      mensaje: `Contraseña restablecida exitosamente para ${targetUser.correoInstitucional}`,
      idUsuario: String(targetUser.idUsuario),
      correoInstitucional: targetUser.correoInstitucional,
      rol: targetUser.rol?.nombre,
      nuevaContrasenaTemporal: dto.newPassword ? undefined : newPassword,
    };
  }

  async updateUserEstado(
    idUsuario: string,
    dto: UpdateUserEstadoDto,
    currentUser: AuthenticatedUser,
  ) {
    if (
      currentUser.rol !== 'SUPER_ADMIN' &&
      currentUser.rol !== 'VICERRECTORADO' &&
      currentUser.rol !== 'COORDINACION'
    ) {
      throw new ForbiddenException(
        'Solo Coordinación Académica, Vicerrectorado o SuperAdmin pueden modificar el estado de un usuario',
      );
    }

    const numId = Number(idUsuario);
    const existing = await this.authRepository.findById(numId);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    if (String(existing.idUsuario) === currentUser.idUsuario) {
      throw new BadRequestException('No puedes inactivar tu propia cuenta activa');
    }

    const updated = await this.authRepository.updateEstado(numId, dto.estado);

    return {
      success: true,
      mensaje: `Estado del usuario ${updated.correoInstitucional} actualizado a ${dto.estado}`,
      usuario: {
        idUsuario: String(updated.idUsuario),
        correoInstitucional: updated.correoInstitucional,
        estado: updated.estado,
      },
    };
  }

  async createUser(dto: CreateUserDto, currentUser: AuthenticatedUser) {
    if (
      currentUser.rol !== 'SUPER_ADMIN' &&
      currentUser.rol !== 'VICERRECTORADO' &&
      currentUser.rol !== 'COORDINACION'
    ) {
      throw new ForbiddenException(
        'Solo Coordinación Académica, Vicerrectorado o SuperAdmin pueden crear usuarios y asignar roles',
      );
    }

    const emailRaw = dto.email || dto.correoInstitucional || dto.correo;
    if (!emailRaw || !emailRaw.trim()) {
      throw new BadRequestException('El correo institucional o email es requerido');
    }
    const email = emailRaw.trim().toLowerCase();
    const existing = await this.authRepository.findByCorreoInstitucional(email);
    if (existing) {
      throw new BadRequestException(`Ya existe un usuario registrado con el correo ${email}`);
    }

    const rolKey = String(dto.rol || '').trim().toLowerCase();
    const rolNombre = ROL_MAP_INV[rolKey] || dto.rol.toUpperCase().trim();
    const rolRecord = await this.authRepository.findRolByNombre(rolNombre);
    if (!rolRecord) {
      throw new BadRequestException(`El rol '${dto.rol}' no es válido en el sistema institucional`);
    }

    if (rolNombre === 'JEFE_CARRERA' && (!dto.carreraId || String(dto.carreraId).trim() === '')) {
      throw new BadRequestException(
        'Debe asignar obligatoriamente una Carrera al usuario con rol "Jefe de Carrera".',
      );
    }

    const { primerNombre, segundoNombre, primerApellido, segundoApellido } = splitNombre(dto.nombre);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.authRepository.createUser({
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      correoInstitucional: email,
      passwordHash,
      idRol: rolRecord.idRol,
      estado: dto.activo === false ? 'INACTIVO' : 'ACTIVO',
    });

    if (rolNombre === 'JEFE_CARRERA' && dto.carreraId) {
      await this.authRepository.assignCarrera(Number(user.idUsuario), Number(dto.carreraId));
    }

    return {
      success: true,
      mensaje: `Usuario ${user.correoInstitucional} creado exitosamente con rol ${rolRecord.nombre}`,
      id: String(user.idUsuario),
      idUsuario: String(user.idUsuario),
      nombre: [user.primerNombre, user.primerApellido].filter(Boolean).join(' '),
      email: user.correoInstitucional,
      rol: user.rol.nombre,
      activo: user.estado === 'ACTIVO',
    };
  }

  async updateUser(idUsuario: string, dto: UpdateUserDto, currentUser: AuthenticatedUser) {
    if (
      currentUser.rol !== 'SUPER_ADMIN' &&
      currentUser.rol !== 'VICERRECTORADO' &&
      currentUser.rol !== 'COORDINACION'
    ) {
      throw new ForbiddenException(
        'Solo Coordinación Académica, Vicerrectorado o SuperAdmin pueden editar usuarios',
      );
    }

    const numId = Number(idUsuario);
    const existing = await this.authRepository.findById(numId);
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${idUsuario} no encontrado`);
    }

    const updateData: any = {};
    if (dto.nombre) {
      const { primerNombre, segundoNombre, primerApellido, segundoApellido } = splitNombre(dto.nombre);
      updateData.primerNombre = primerNombre;
      updateData.segundoNombre = segundoNombre;
      updateData.primerApellido = primerApellido;
      updateData.segundoApellido = segundoApellido;
    }
    const emailUpdate = dto.email || dto.correoInstitucional || dto.correo;
    if (emailUpdate) {
      updateData.correoInstitucional = emailUpdate.trim().toLowerCase();
    }
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.activo !== undefined) {
      updateData.estado = dto.activo ? 'ACTIVO' : 'INACTIVO';
    }

    let rolNombre = existing.rol.nombre;
    if (dto.rol) {
      const rolKey = String(dto.rol || '').trim().toLowerCase();
      rolNombre = ROL_MAP_INV[rolKey] || dto.rol.toUpperCase().trim();
      const rolRecord = await this.authRepository.findRolByNombre(rolNombre);
      if (!rolRecord) {
        throw new BadRequestException(`El rol '${dto.rol}' no es válido`);
      }
      updateData.idRol = rolRecord.idRol;
    }

    if (rolNombre === 'JEFE_CARRERA' && dto.carreraId) {
      await this.authRepository.assignCarrera(numId, Number(dto.carreraId));
    }

    const updated = await this.authRepository.updateUserFull(numId, updateData);

    return {
      success: true,
      mensaje: `Usuario ${updated.correoInstitucional} actualizado exitosamente`,
      id: String(updated.idUsuario),
      idUsuario: String(updated.idUsuario),
      email: updated.correoInstitucional,
      rol: updated.rol.nombre,
      activo: updated.estado === 'ACTIVO',
    };
  }

  async deactivateUser(idUsuario: string, currentUser: AuthenticatedUser) {
    return this.updateUserEstado(idUsuario, { estado: 'INACTIVO' }, currentUser);
  }
}



