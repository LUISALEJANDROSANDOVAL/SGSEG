import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CrearEnlaceEspectadorDto,
  FilterSorteosDto,
  FinalizarSorteoDto,
  SortearAreaDto,
  SortearCasoDto,
  SorteoConjuntoDto,
} from '../dto/sorteos.dto';
import { SorteosService } from '../services/sorteos.service';
import { SorteosLiveService, type NotificacionSorteoDto } from '../services/sorteos-live.service';

@Controller('sorteos')
export class SorteosController {
  constructor(
    private readonly sorteosService: SorteosService,
    private readonly sorteosLiveService: SorteosLiveService,
  ) {}

  /**
   * Ejecuta el sorteo digital de Área Temática mediante CSPRNG.
   * Vicerrectorado bloqueado.
   */
  @Post('area')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async sortearArea(
    @Body() dto: SortearAreaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sortearArea(dto, user);
  }

  /**
   * Ejecuta el sorteo digital de Caso de Estudio dentro del área asignada.
   * Vicerrectorado bloqueado.
   */
  @Post('caso')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async sortearCaso(
    @Body() dto: SortearCasoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sortearCaso(dto, user);
  }

  /**
   * Ejecuta el sorteo conjunto anticipado de Área y Caso (FCT y Psicología).
   * Vicerrectorado bloqueado.
   */
  @Post('conjunto')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async sorteoConjunto(
    @Body() dto: SorteoConjuntoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sorteoConjunto(dto, user);
  }

  /**
   * Finaliza el sorteo y formaliza la asignación atómica (estudiante, área y caso).
   * Vicerrectorado bloqueado (403 Forbidden).
   */
  @Post('finalizar')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async finalizarSorteo(
    @Body() dto: FinalizarSorteoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.finalizarSorteo(dto, user);
  }

  /**
   * Genera un enlace temporal de visualización con token/slug y fecha de expiración.
   * Vicerrectorado bloqueado.
   */
  @Post('enlace-espectador')
  @Roles('COORDINACION', 'SECRETARIADO', 'JEFE_CARRERA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async generarEnlaceEspectador(
    @Body() dto: CrearEnlaceEspectadorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.generarEnlaceEspectador(dto, user);
  }

  /**
   * Vista de espectador en tiempo real para el celular del estudiante (solo lectura, sin JWT).
   */
  @Get('espectador/:slugOrToken')
  @Public()
  async obtenerVistaEspectador(@Param('slugOrToken') slugOrToken: string) {
    return this.sorteosService.obtenerVistaEspectador(slugOrToken);
  }

  /**
   * Consulta la asignación formal de una defensa por su ID.
   */
  @Get('asignacion/:idDefensa')
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'REGISTRO',
    'DEFENSA',
    'SUPER_ADMIN',
  )
  async consultarAsignacion(
    @Param('idDefensa') idDefensa: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.consultarAsignacion(idDefensa, user);
  }

  /**
   * Genera y descarga el documento oficial de Acta de Sorteo en formato PDF.
   */
  @Get('acta/:idDefensa/pdf')
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'REGISTRO',
    'DEFENSA',
    'SUPER_ADMIN',
  )
  async descargarActaPdf(
    @Param('idDefensa') idDefensa: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.sorteosService.generarActaPdf(idDefensa, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  }

  /**
   * Consulta el historial general de sorteos ejecutados.
   */
  @Get()
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'REGISTRO',
    'DEFENSA',
    'SUPER_ADMIN',
  )
  async findHistorial(
    @Query() query: FilterSorteosDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.findHistorial(query, user);
  }

  /**
   * Consulta pública del estado en vivo del sorteo para el celular del estudiante.
   */
  @Get('live/:token')
  @Public()
  async getLiveSession(@Param('token') token: string) {
    return this.sorteosLiveService.obtenerSesion(token);
  }

  /**
   * Crea una nueva sesión pública de sorteo en vivo.
   */
  @Post('live/crear')
  @Roles('COORDINACION', 'SECRETARIADO', 'SUPER_ADMIN')
  async crearLiveSession(
    @Body()
    body: {
      idPostulante: string;
      nombreEstudiante: string;
      carnet: string;
      carrera: string;
      correo: string;
      tipoDefensa: string;
    },
  ) {
    return this.sorteosLiveService.crearSesion(body);
  }

  /**
   * Actualiza el estado en vivo (giro en proceso, ganador, etc.).
   */
  @Post('live/actualizar')
  @Roles('COORDINACION', 'SECRETARIADO', 'SUPER_ADMIN')
  async actualizarLiveSession(
    @Body() body: { token: string; update: any },
  ) {
    return this.sorteosLiveService.actualizarSesion(body.token, body.update);
  }

  /**
   * Expira formalmente la sesión en vivo al terminar el acto.
   */
  @Post('live/expirar')
  @Roles('COORDINACION', 'SECRETARIADO', 'SUPER_ADMIN')
  async expirarLiveSession(@Body() body: { token: string }) {
    return this.sorteosLiveService.expirarSesion(body.token);
  }

  /**
   * Despacha formalmente el acta y el pliego sorteado al correo del estudiante.
   */
  @Post('notificar-estudiante')
  @Roles('COORDINACION', 'SECRETARIADO', 'SUPER_ADMIN')
  async notificarEstudiante(@Body() dto: NotificacionSorteoDto) {
    return this.sorteosLiveService.enviarNotificacionSorteo(dto);
  }

  /**
   * Registra el ping/heartbeat de presencia en tiempo real del estudiante.
   */
  @Post('live/conectar')
  @Public()
  async conectarEstudiante(@Body() body: { token: string }) {
    return this.sorteosLiveService.conectarEstudiante(body.token);
  }

  /**
   * El estudiante confirma explícitamente desde su móvil que está listo para el sorteo.
   */
  @Post('live/confirmar-listo')
  @Public()
  async confirmarEstudianteListo(@Body() body: { token: string }) {
    return this.sorteosLiveService.confirmarEstudianteListo(body.token);
  }

  /**
   * Despacha el enlace de transmisión en vivo al correo del estudiante al iniciar el acto.
   */
  @Post('live/notificar-inicio')
  @Roles('COORDINACION', 'SECRETARIADO', 'SUPER_ADMIN')
  async notificarInicioSorteo(
    @Body()
    body: {
      token: string;
      correo: string;
      nombreEstudiante: string;
      carnet: string;
      carrera: string;
      linkLive: string;
    },
  ) {
    return this.sorteosLiveService.enviarNotificacionInicio(body);
  }

  /**
   * Obtiene el detalle y acta formal de un sorteo por ID.
   */
  @Get(':id')
  @Roles(
    'COORDINACION',
    'SECRETARIADO',
    'JEFE_CARRERA',
    'VICERRECTORADO',
    'REGISTRO',
    'DEFENSA',
    'SUPER_ADMIN',
  )
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.findSorteoById(id, user);
  }
}
