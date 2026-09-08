import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  FilterSorteosDto,
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
   */
  @Post('area')
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async sortearArea(
    @Body() dto: SortearAreaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sortearArea(dto, user);
  }

  /**
   * Ejecuta el sorteo digital de Caso de Estudio dentro del área asignada.
   */
  @Post('caso')
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async sortearCaso(
    @Body() dto: SortearCasoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sortearCaso(dto, user);
  }

  /**
   * Ejecuta el sorteo conjunto anticipado de Área y Caso (FCT y Psicología).
   */
  @Post('conjunto')
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async sorteoConjunto(
    @Body() dto: SorteoConjuntoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.sorteoConjunto(dto, user);
  }

  /**
   * Consulta el historial general de sorteos ejecutados.
   */
  @Get()
  @Roles(
    'SECRETARIADO',
    'JEFE_CARRERA',
    'COORDINACION',
    'VICERRECTORADO',
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
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
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
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
  async actualizarLiveSession(
    @Body() body: { token: string; update: any },
  ) {
    return this.sorteosLiveService.actualizarSesion(body.token, body.update);
  }

  /**
   * Expira formalmente la sesión en vivo al terminar el acto.
   */
  @Post('live/expirar')
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
  async expirarLiveSession(@Body() body: { token: string }) {
    return this.sorteosLiveService.expirarSesion(body.token);
  }

  /**
   * Despacha formalmente el acta y el pliego sorteado al correo del estudiante.
   */
  @Post('notificar-estudiante')
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
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
  @Roles('SECRETARIADO', 'JEFE_CARRERA', 'COORDINACION', 'SUPER_ADMIN')
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
    'SECRETARIADO',
    'JEFE_CARRERA',
    'COORDINACION',
    'VICERRECTORADO',
    'SUPER_ADMIN',
  )
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sorteosService.findSorteoById(id, user);
  }
}
