import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

export interface ArchivoSubido {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size?: number;
}

@Injectable()
export class EstudiantesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Si la tabla está vacía, sembramos los estudiantes iniciales
    const count = await this.prisma.estudiante.count();
    if (count === 0) {
      const estudiantesIniciales = [
        {
          registro: '2019-04812',
          nombre: 'Mariana Rojas Quiroga',
          ci: '8493021 SC',
          correo: 'mariana.rojas@utepsa.edu.bo',
          carrera: 'Marketing',
          pensum: '2019',
          estado: 'Sorteado',
        },
        {
          registro: '2020-01377',
          nombre: 'Luis Fernando Céspedes',
          ci: '9120485 SC',
          correo: 'luis.cespedes@utepsa.edu.bo',
          carrera: 'Administración',
          pensum: '2019',
          estado: 'Sorteado',
        },
        {
          registro: '2021-06540',
          nombre: 'Camila Antelo Suárez',
          ci: '7482910 SC',
          correo: 'camila.antelo@utepsa.edu.bo',
          carrera: 'Contaduría',
          pensum: '2022',
          estado: 'Pendiente',
        },
        {
          registro: '2021-07188',
          nombre: 'Diego Mamani Torrico',
          ci: '8392019 SC',
          correo: 'diego.mamani@utepsa.edu.bo',
          carrera: 'Ingeniería Comercial',
          pensum: '2022',
          estado: 'Pendiente',
        },
        {
          registro: '2022-02904',
          nombre: 'Valeria Ibáñez Peña',
          ci: '9384721 SC',
          correo: 'valeria.ibanez@utepsa.edu.bo',
          carrera: 'Sistemas',
          pensum: '2024',
          estado: 'Observado',
        },
        {
          registro: '2022-03551',
          nombre: 'Jorge Andrés Vaca',
          ci: '8839201 SC',
          correo: 'jorge.vaca@utepsa.edu.bo',
          carrera: 'Administración',
          pensum: '2024',
          estado: 'Pendiente',
        },
      ];

      for (const est of estudiantesIniciales) {
        await this.prisma.estudiante.create({
          data: est,
        });
      }
    } else {
      // Actualizar cualquier registro existente con dominio @uagrm.edu.bo a @utepsa.edu.bo
      const estudiantes = await this.prisma.estudiante.findMany();
      for (const est of estudiantes) {
        if (est.correo && est.correo.includes('@uagrm.edu.bo')) {
          await this.prisma.estudiante.update({
            where: { id: est.id },
            data: { correo: est.correo.replace('@uagrm.edu.bo', '@utepsa.edu.bo') },
          });
        }
      }
    }
  }

  async findAll(query?: { pensum?: string; carrera?: string }) {
    const where: any = {};
    if (query?.pensum && query.pensum !== 'Todos los pensum') {
      where.pensum = query.pensum.replace('Pensum ', '');
    }
    if (query?.carrera) {
      where.carrera = query.carrera;
    }

    return this.prisma.estudiante.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.estudiante.findUnique({
      where: { id },
    });
  }

  async create(data: {
    registro: string;
    nombre: string;
    ci?: string;
    correo?: string;
    carrera: string;
    pensum: string;
    estado?: string;
  }) {
    return this.prisma.estudiante.upsert({
      where: { registro: data.registro },
      update: {
        nombre: data.nombre,
        ci: data.ci,
        correo: data.correo,
        carrera: data.carrera,
        pensum: data.pensum,
        estado: data.estado || 'Pendiente',
      },
      create: {
        registro: data.registro,
        nombre: data.nombre,
        ci: data.ci,
        correo: data.correo,
        carrera: data.carrera,
        pensum: data.pensum,
        estado: data.estado || 'Pendiente',
      },
    });
  }

  async importar(file: ArchivoSubido) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No se ha proporcionado ningún archivo para importar.');
    }

    const filename = (file.originalname || '').toLowerCase();
    const rowsToProcess: Array<{
      registro: string;
      nombre: string;
      ci?: string;
      correo?: string;
      carrera: string;
      pensum: string;
      estado: string;
    }> = [];

    if (filename.endsWith('.csv') || file.mimetype === 'text/csv' || file.mimetype === 'text/plain') {
      // Procesar CSV
      const content = file.buffer.toString('utf-8');
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        throw new BadRequestException('El archivo CSV debe tener al menos una fila de encabezado y una de datos.');
      }

      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0]
        .split(delimiter)
        .map((h) => this.normalizarColumna(h));

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const rowData: Record<string, string> = {};
        headers.forEach((h, idx) => {
          if (h) rowData[h] = values[idx] || '';
        });

        const est = this.mapearFilaAEstudiante(rowData, i);
        if (est) rowsToProcess.push(est);
      }
    } else {
      // Procesar Excel con ExcelJS
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          throw new BadRequestException('El archivo Excel no contiene hojas de cálculo.');
        }

        let headerMap: Record<number, string> = {};
        let headerRowIndex = 1;

        // Encontrar la fila de encabezados
        worksheet.eachRow((row, rowNumber) => {
          if (Object.keys(headerMap).length > 0) return;
          const cells: string[] = [];
          row.eachCell((cell) => {
            cells.push(this.normalizarColumna(cell.text || ''));
          });
          if (cells.some((c) => ['registro', 'nombre', 'estudiante', 'carrera'].includes(c))) {
            headerRowIndex = rowNumber;
            row.eachCell((cell, colNumber) => {
              headerMap[colNumber] = this.normalizarColumna(cell.text || '');
            });
          }
        });

        // Si no se detectaron encabezados específicos, mapear primera fila
        if (Object.keys(headerMap).length === 0) {
          const firstRow = worksheet.getRow(1);
          firstRow.eachCell((cell, colNumber) => {
            headerMap[colNumber] = this.normalizarColumna(cell.text || '');
          });
        }

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber <= headerRowIndex) return;
          const rowData: Record<string, string> = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const colName = headerMap[colNumber];
            if (colName) {
              rowData[colName] = (cell.text || '').trim();
            }
          });

          const est = this.mapearFilaAEstudiante(rowData, rowNumber);
          if (est) rowsToProcess.push(est);
        });
      } catch (err: any) {
        throw new BadRequestException(`Error al procesar el archivo Excel: ${err.message}`);
      }
    }

    if (rowsToProcess.length === 0) {
      throw new BadRequestException('No se encontraron registros válidos de estudiantes en el archivo.');
    }

    // Upsert masivo o secuencial en Prisma
    const importados: any[] = [];
    for (const data of rowsToProcess) {
      const saved = await this.prisma.estudiante.upsert({
        where: { registro: data.registro },
        update: {
          nombre: data.nombre,
          ci: data.ci,
          correo: data.correo,
          carrera: data.carrera,
          pensum: data.pensum,
          estado: data.estado,
        },
        create: {
          registro: data.registro,
          nombre: data.nombre,
          ci: data.ci,
          correo: data.correo,
          carrera: data.carrera,
          pensum: data.pensum,
          estado: data.estado,
        },
      });
      importados.push(saved);
    }

    const todos = await this.findAll();

    return {
      message: `Padrón importado exitosamente. Se procesaron ${importados.length} estudiantes.`,
      totalImportados: importados.length,
      importados,
      estudiantes: todos,
    };
  }

  private normalizarColumna(header: string): string {
    const h = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (['registro', 'carnetestudiantil', 'carnet', 'reg', 'codigo'].includes(h)) return 'registro';
    if (['nombre', 'estudiante', 'nombrecompleto', 'nombres'].includes(h)) return 'nombre';
    if (['ci', 'carnetidentidad', 'cedula', 'documento'].includes(h)) return 'ci';
    if (['correo', 'email', 'correoelectronico', 'mail'].includes(h)) return 'correo';
    if (['carrera', 'programa', 'carreranombre'].includes(h)) return 'carrera';
    if (['pensum', 'plan', 'planestudio', 'malla', 'anio'].includes(h)) return 'pensum';
    if (['estado', 'estadohabilitacion', 'habilitacion', 'status'].includes(h)) return 'estado';
    return h;
  }

  private mapearFilaAEstudiante(rowData: Record<string, string>, index: number) {
    const nombre = rowData.nombre || rowData.estudiante || '';
    if (!nombre && !rowData.registro) return null;

    let pensum = (rowData.pensum || '2024').replace(/[^0-9]/g, '');
    if (!pensum || pensum.length < 4) pensum = '2024';

    let estado = rowData.estado || 'Pendiente';
    if (estado.toLowerCase().includes('sorte')) estado = 'Sorteado';
    else if (estado.toLowerCase().includes('obs')) estado = 'Observado';
    else estado = 'Pendiente';

    return {
      registro: rowData.registro || `REG-${2024000 + index}`,
      nombre: nombre || 'Estudiante Sin Nombre',
      ci: rowData.ci || undefined,
      correo: rowData.correo || undefined,
      carrera: rowData.carrera || 'Sistemas',
      pensum: pensum,
      estado: estado,
    };
  }

  async delete(id: string) {
    return this.prisma.estudiante.delete({
      where: { id },
    });
  }
}
