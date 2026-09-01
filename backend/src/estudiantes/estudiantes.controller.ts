import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EstudiantesService } from './estudiantes.service';
import type { ArchivoSubido } from './estudiantes.service';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Get()
  async findAll(@Query('pensum') pensum?: string, @Query('carrera') carrera?: string) {
    return this.estudiantesService.findAll({ pensum, carrera });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.estudiantesService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    if (!body.registro || !body.nombre || !body.carrera || !body.pensum) {
      throw new BadRequestException('Los campos registro, nombre, carrera y pensum son requeridos.');
    }
    return this.estudiantesService.create(body);
  }

  @Post('importar')
  @UseInterceptors(FileInterceptor('file'))
  async importar(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Archivo no adjuntado. Use el campo "file" en el formulario.');
    }
    return this.estudiantesService.importar(file as ArchivoSubido);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.estudiantesService.delete(id);
  }
}
