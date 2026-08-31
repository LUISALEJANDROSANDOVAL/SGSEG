import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('Coordinador General', 'Secretario de Facultad')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('Coordinador General', 'Secretario de Facultad')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('Coordinador General')
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put(':id')
  @Roles('Coordinador General')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Patch(':id/deactivate')
  @Roles('Coordinador General')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
