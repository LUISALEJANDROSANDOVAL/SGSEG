import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { carrera: true },
    });
    if (user && user.activo && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      carreraId: user.carreraId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        carreraId: user.carreraId,
        carrera: user.carrera,
      },
    };
  }

  async recuperarPassword(email: string) {
    if (!email || !email.trim()) {
      throw new UnauthorizedException('Por favor ingresa un correo electrónico válido.');
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (!usuario) {
      // Mensaje seguro/informativo
      return {
        success: true,
        message: `Si el correo ${emailNormalizado} está registrado en el sistema, recibirás un enlace para restablecer tu contraseña.`,
      };
    }

    const tokenRecuperacion = this.jwtService.sign(
      { sub: usuario.id, email: usuario.email, type: 'password_reset' },
      { expiresIn: '15m' },
    );

    return {
      success: true,
      message: `Se han enviado las instrucciones de recuperación al correo ${usuario.email}. Revisa tu bandeja de entrada o spam.`,
      token: tokenRecuperacion,
    };
  }
}

