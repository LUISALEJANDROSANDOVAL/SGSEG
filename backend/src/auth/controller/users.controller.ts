import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserEstadoDto } from '../dto/update-user-estado.dto';
import { AuthService } from '../services/auth.service';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async listUsers() {
    return this.authService.listUsers();
  }

  @Post()
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.createUser(dto, user);
  }

  @Put(':id')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.updateUser(id, dto, user);
  }

  @Patch(':id/estado')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async updateUserEstado(
    @Param('id') id: string,
    @Body() dto: UpdateUserEstadoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.updateUserEstado(id, dto, user);
  }

  @Patch(':id/deactivate')
  @Roles('VICERRECTORADO', 'SUPER_ADMIN')
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.deactivateUser(id, user);
  }
}
