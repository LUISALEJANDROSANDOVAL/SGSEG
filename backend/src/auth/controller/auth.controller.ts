import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RecuperarPasswordDto } from '../dto/recuperar-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AdminResetPasswordDto } from '../dto/admin-reset-password.dto';
import { UpdateUserEstadoDto } from '../dto/update-user-estado.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('recuperar-password')
  @HttpCode(HttpStatus.OK)
  async recuperarPassword(@Body() dto: RecuperarPasswordDto) {
    return this.authService.recuperarPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.idUsuario);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.idUsuario, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.idUsuario, dto);
  }

  @Get('users')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async listUsers() {
    return this.authService.listUsers();
  }

  @Post('users')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.createUser(dto, user);
  }

  @Put('users/:id')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.updateUser(id, dto, user);
  }

  /**
   * Endpoint seguro para reseteo administrativo de contraseñas (Superadministrador / Fallback).
   * Puede ser ejecutado por un usuario con rol COORDINACION o SUPER_ADMIN,
   * o mediante el adminSecret de contingencia.
   */
  @Public()
  @Post('admin/reset-password')
  @HttpCode(HttpStatus.OK)
  async adminResetPassword(
    @Body() dto: AdminResetPasswordDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.authService.adminResetPassword(dto, user);
  }

  /**
   * Endpoint para activación/inactivación de cuentas institucionales.
   */
  @Patch('users/:id/estado')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async updateUserEstado(
    @Param('id') id: string,
    @Body() dto: UpdateUserEstadoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.updateUserEstado(id, dto, user);
  }

  @Patch('users/:id/deactivate')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.deactivateUser(id, user);
  }
}


