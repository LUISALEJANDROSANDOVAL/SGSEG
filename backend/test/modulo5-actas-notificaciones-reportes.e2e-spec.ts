import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { ColaNotificacionesService } from '../src/notificaciones/services/cola-notificaciones.service';

describe('Módulo 5: Actas, Notificaciones y Reportes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let vicerrectoradoToken: string;
  let jefeToken: string;

  let idFacultad: bigint;
  let idCarrera: bigint;
  let idCarreraAjena: bigint;
  let idDefensa: bigint;
  let idEstudiante: bigint;
  let idArea: bigint;
  let idCaso: bigint;
  let idUsuarioJefe: bigint;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // 1. Obtener tokens de autenticación
    const resAuthAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'coord@uni.edu.bo', password: 'Admin123!' });
    adminToken = (resAuthAdmin.body as { accessToken: string }).accessToken;

    // Crear o recuperar roles
    const rolVice = await prisma.rol.upsert({
      where: { nombre: 'VICERRECTORADO' },
      update: {},
      create: { nombre: 'VICERRECTORADO', descripcion: 'Rol Vicerrectorado' },
    });

    const rolJefe = await prisma.rol.upsert({
      where: { nombre: 'JEFE_CARRERA' },
      update: {},
      create: { nombre: 'JEFE_CARRERA', descripcion: 'Rol Jefe de Carrera' },
    });

    // Crear usuario Vicerrectorado para pruebas si no existe
    const pwdHash = await bcrypt.hash('Admin123!', 10);
    const userVice = await prisma.usuario.upsert({
      where: { correoInstitucional: 'vice.test.mod5@utepsa.edu.bo' },
      update: {},
      create: {
        idRol: rolVice.idRol,
        primerNombre: 'Carlos',
        primerApellido: 'Vicerrector',
        correoInstitucional: 'vice.test.mod5@utepsa.edu.bo',
        passwordHash: pwdHash,
        estado: 'ACTIVO',
      },
    });

    const resAuthVice = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: 'vice.test.mod5@utepsa.edu.bo', password: 'Admin123!' });
    vicerrectoradoToken = (resAuthVice.body as { accessToken: string }).accessToken;

    // Crear estructura académica de prueba
    const facultad = await prisma.facultad.create({
      data: { nombre: `Facultad Mod5 ${Date.now()}` },
    });
    idFacultad = facultad.idFacultad;

    const carrera = await prisma.carrera.create({
      data: { nombre: `Carrera Mod5 ${Date.now()}`, idFacultad: facultad.idFacultad },
    });
    idCarrera = carrera.idCarrera;

    const carreraAjena = await prisma.carrera.create({
      data: { nombre: `Carrera Ajena Mod5 ${Date.now()}`, idFacultad: facultad.idFacultad },
    });
    idCarreraAjena = carreraAjena.idCarrera;

    // Crear usuario Jefe de Carrera vinculado exclusivamente a idCarrera
    const userJefe = await prisma.usuario.create({
      data: {
        idRol: rolJefe.idRol,
        primerNombre: 'Ana',
        primerApellido: 'JefaMod5',
        correoInstitucional: `jefe.mod5.${Date.now()}@utepsa.edu.bo`,
        passwordHash: pwdHash,
        estado: 'ACTIVO',
        carreras: {
          create: [{ idCarrera: carrera.idCarrera }],
        },
      },
    });
    idUsuarioJefe = userJefe.idUsuario;

    const resAuthJefe = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correoInstitucional: userJefe.correoInstitucional, password: 'Admin123!' });
    jefeToken = (resAuthJefe.body as { accessToken: string }).accessToken;

    const plan = await prisma.planEstudio.create({
      data: { nombre: `Plan Mod5 ${Date.now()}`, idCarrera: carrera.idCarrera },
    });

    const area = await prisma.areaAcademica.create({
      data: {
        nombre: `Área Mod5 ${Date.now()}`,
        idCarrera: carrera.idCarrera,
        umbralDisponibilidad: 2,
        estado: 'ACTIVO',
      },
    });
    idArea = area.idArea;

    const caso = await prisma.casoEstudio.create({
      data: {
        titulo: `Caso Mod5 Prueba ${Date.now()}`,
        contenido: 'Planteamiento integral del caso de estudio de prueba para el módulo 5.',
        idArea: area.idArea,
        estado: 'DISPONIBLE',
      },
    });
    idCaso = caso.idCasoEstudio;

    const estudiante = await prisma.estudiante.create({
      data: {
        carnetEstudiantil: `E2E-M5-${Date.now()}`,
        carnetIdentidad: '7891234',
        nombreCompleto: 'Postulante Modulo Cinco',
        correoInstitucional: `postulante.mod5.${Date.now()}@utepsa.edu.bo`,
        idPlanEstudio: plan.idPlanEstudio,
      },
    });
    idEstudiante = estudiante.idEstudiante;

    const tipoDefensa = await prisma.tipoDefensa.upsert({
      where: { nombre: 'INTERNA' },
      update: {},
      create: { nombre: 'INTERNA', descripcion: 'Defensa Interna' },
    });

    const proceso = await prisma.procesoExamenGrado.create({
      data: { idEstudiante: estudiante.idEstudiante, estadoProceso: 'EN_CURSO' },
    });

    const instancia = await prisma.instanciaExamenGrado.create({
      data: { idProceso: proceso.idProceso, numeroInstancia: 1, estadoInstancia: 'PENDIENTE' },
    });

    const defensa = await prisma.defensaExamenGrado.create({
      data: {
        idInstancia: instancia.idInstancia,
        idTipoDefensa: tipoDefensa.idTipoDefensa,
        fechaDefensa: new Date('2026-10-15'),
        periodoAcademico: '2-2026',
        estadoDefensa: 'PROGRAMADA',
      },
    });
    idDefensa = defensa.idDefensa;

    // Crear la asignación oficial del sorteo con token y código de acta
    await prisma.asignacionCaso.create({
      data: {
        idEstudiante: estudiante.idEstudiante,
        idDefensa: defensa.idDefensa,
        idArea: area.idArea,
        idCaso: caso.idCasoEstudio,
        idUsuarioEjecutor: userJefe.idUsuario,
        codigoActa: `ACTA-DEF-${defensa.idDefensa}-2026`,
        tokenActa: 'SHA256-TEST-TOKEN-INTEGRIDAD-VALIDA-MOD5',
        plazoLimiteEntrega: new Date(Date.now() + 60 * 60 * 1000),
        estado: 'ASIGNADO',
      },
    });
  });

  afterAll(async () => {
    try {
      if (idDefensa) {
        await prisma.asignacionCaso.deleteMany({ where: { idDefensa } });
        await prisma.registroAuditoria.deleteMany({ where: { idDefensa } });
        await prisma.defensaExamenGrado.deleteMany({ where: { idDefensa } });
      }
      if (idEstudiante) {
        await prisma.envioCasoEstudio.deleteMany({ where: { idEstudiante } });
        await prisma.procesoExamenGrado.deleteMany({ where: { idEstudiante } });
        await prisma.estudiante.deleteMany({ where: { idEstudiante } });
      }
      if (idCaso) {
        await prisma.casoEstudio.deleteMany({ where: { idCasoEstudio: idCaso } });
      }
      if (idArea) {
        await prisma.areaAcademica.deleteMany({ where: { idArea } });
      }
      if (idUsuarioJefe) {
        await prisma.usuarioCarrera.deleteMany({ where: { idUsuario: idUsuarioJefe } });
        await prisma.usuario.deleteMany({ where: { idUsuario: idUsuarioJefe } });
      }
      if (idCarrera) {
        await prisma.planEstudio.deleteMany({ where: { idCarrera } });
        await prisma.carrera.deleteMany({ where: { idCarrera } });
      }
      if (idCarreraAjena) {
        await prisma.carrera.deleteMany({ where: { idCarrera: idCarreraAjena } });
      }
      if (idFacultad) {
        await prisma.facultad.deleteMany({ where: { idFacultad } });
      }
    } catch {
      // Ignorar errores de limpieza
    }
    await app.close();
  });

  // ============================================================================
  // 1. GENERACIÓN DE ACTAS EN PDF
  // ============================================================================
  describe('Generación de Actas en PDF (GET /sorteos/acta/:idDefensa/pdf)', () => {
    it('debe generar y descargar el documento binario PDF con Content-Type application/pdf', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sorteos/acta/${idDefensa}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain(`Acta-Sorteo-ACTA-DEF-${idDefensa}-2026.pdf`);
      // Verificar encabezado mágico de archivo PDF (%PDF-)
      const buffer = res.body as Buffer;
      expect(buffer.toString('utf-8', 0, 5)).toContain('%PDF-');
    });

    it('debe permitir a Vicerrectorado descargar el acta oficial para fines de auditoría', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sorteos/acta/${idDefensa}/pdf`)
        .set('Authorization', `Bearer ${vicerrectoradoToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('debe permitir al Jefe de Carrera descargar el acta de su propia carrera', async () => {
      await request(app.getHttpServer())
        .get(`/sorteos/acta/${idDefensa}/pdf`)
        .set('Authorization', `Bearer ${jefeToken}`)
        .expect(200);
    });

    it('debe retornar 404 si no existe acta o asignación para la defensa solicitada', async () => {
      await request(app.getHttpServer())
        .get('/sorteos/acta/99999999/pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ============================================================================
  // 2. SERVICIO DE NOTIFICACIONES Y ENCOLAMIENTO ASÍNCRONO
  // ============================================================================
  describe('Servicio de Notificaciones y Encolamiento de Correos', () => {
    it('debe encolar y procesar la notificación persistiendo en envio_caso_estudio', async () => {
      const colaService = app.get(ColaNotificacionesService);

      const resultado = await colaService.encolarNotificacion({
        idEstudiante,
        idCasoEstudio: idCaso,
        idDefensa,
        idUsuarioEnvio: idUsuarioJefe,
        correoDestino: 'estudiante.test@utepsa.edu.bo',
        nombreEstudiante: 'Postulante Modulo Cinco',
        carnetEstudiantil: '20261099',
        carnetIdentidad: '7891234',
        carrera: 'Carrera Mod5',
        areaNombre: 'Área Mod5',
        casoCodigo: `CASO-${idCaso}`,
        casoTitulo: 'Caso Mod5 Prueba',
        plazoHoras: 1,
        fechaDefensa: new Date('2026-10-15'),
        tipoDefensa: 'INTERNA',
        codigoActa: `ACTA-DEF-${idDefensa}-2026`,
        tokenActa: 'SHA256-TOKEN-PRUEBA',
      });

      expect(resultado.idEnvio).toBeDefined();
      expect(resultado.estado).toBe('PENDIENTE');

      // Esperar brevemente a que el worker en segundo plano procese el trabajo
      await new Promise((resolve) => setTimeout(resolve, 300));

      const envio = await prisma.envioCasoEstudio.findUnique({
        where: { idEnvio: BigInt(resultado.idEnvio) },
      });

      expect(envio).toBeDefined();
      expect(envio?.estadoEnvio).toBe('ENVIADO');
      expect(envio?.correoDestino).toBe('estudiante.test@utepsa.edu.bo');
    });
  });

  // ============================================================================
  // 3. DASHBOARD EJECUTIVO (KPIs Y AGREGACIONES)
  // ============================================================================
  describe('Dashboard Ejecutivo (GET /reportes/dashboard-ejecutivo)', () => {
    it('debe retornar métricas globales completas para Vicerrectorado', async () => {
      const res = await request(app.getHttpServer())
        .get('/reportes/dashboard-ejecutivo')
        .set('Authorization', `Bearer ${vicerrectoradoToken}`)
        .expect(200);

      expect(res.body.resumenGlobal).toBeDefined();
      expect(typeof res.body.resumenGlobal.casosDisponibles).toBe('number');
      expect(typeof res.body.resumenGlobal.areasStockCritico).toBe('number');
      expect(typeof res.body.resumenGlobal.defensasConcluidas).toBe('number');
      expect(typeof res.body.resumenGlobal.postulantesPendientes).toBe('number');
      expect(typeof res.body.resumenGlobal.actasEmitidas).toBe('number');

      expect(Array.isArray(res.body.stockCritico)).toBe(true);
      expect(Array.isArray(res.body.distribucionFacultades)).toBe(true);
      expect(Array.isArray(res.body.distribucionCarreras)).toBe(true);
    });

    it('debe filtrar adecuadamente por facultad', async () => {
      const res = await request(app.getHttpServer())
        .get(`/reportes/dashboard-ejecutivo?idFacultad=${idFacultad}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.filtrosAplicados.idFacultad).toBe(String(idFacultad));
      expect(res.body.distribucionFacultades.length).toBeLessThanOrEqual(1);
    });

    it('debe aplicar aislamiento estricto de carrera para Jefe de Carrera (RNF-02)', async () => {
      // El jefe consulta sin parámetros: el sistema le fuerza a su carrera asignada
      const res = await request(app.getHttpServer())
        .get('/reportes/dashboard-ejecutivo')
        .set('Authorization', `Bearer ${jefeToken}`)
        .expect(200);

      expect(res.body.filtrosAplicados.idCarrera).toBe(String(idCarrera));
      // No debe contener información de la carrera ajena
      const tieneCarreraAjena = res.body.distribucionCarreras.some(
        (c: any) => c.idCarrera === String(idCarreraAjena),
      );
      expect(tieneCarreraAjena).toBe(false);
    });

    it('debe rechazar con 403 si el Jefe de Carrera intenta consultar una carrera ajena', async () => {
      await request(app.getHttpServer())
        .get(`/reportes/dashboard-ejecutivo?idCarrera=${idCarreraAjena}`)
        .set('Authorization', `Bearer ${jefeToken}`)
        .expect(403);
    });
  });
});
