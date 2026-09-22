import { MailerService } from './mailer.service';
import { ActasPdfService } from '../../sorteos/services/actas-pdf.service';

describe('MailerService y Despacho con Acta PDF', () => {
  let mailerService: MailerService;
  let actasPdfService: ActasPdfService;

  beforeEach(() => {
    mailerService = new MailerService();
    actasPdfService = new ActasPdfService();
  });

  it('debe generar un buffer PDF válido y firmado para el acta de sorteo', async () => {
    const pdfBuffer = await actasPdfService.generarActaPdfBuffer({
      codigoActa: 'ACTA-TEST-2026',
      tokenActa: 'A1B2C3D4E5F6',
      fechaAsignacion: new Date(),
      plazoLimiteEntrega: new Date(Date.now() + 3600000),
      estudiante: {
        nombreCompleto: 'Mauricio Alejandro Vidal',
        carnetIdentidad: '9988776 SC',
        carnetEstudiantil: 'SIS-2026999',
        correoInstitucional: 'sis-2026999@estudiante.edu.bo',
        carrera: 'Ingeniería de Sistemas',
        facultad: 'Facultad de Ciencia y Tecnología (FCT)',
        planEstudio: 'Plan 2026',
      },
      defensa: {
        idDefensa: '100',
        tipoDefensa: 'INTERNA',
        fechaDefensa: new Date(),
        periodoAcademico: 'II-2026',
      },
      area: {
        nombre: 'Ciberseguridad y Auditoría de Sistemas',
      },
      caso: {
        idCaso: '5',
        titulo: 'Análisis Forense y Mitigación de Ransomware',
        contenido: 'Enunciado detallado de caso de estudio para el postulante.',
      },
      usuarioEjecutor: {
        nombreCompleto: 'Carlos Mendoza Vargas',
        correo: 'jefe.sistemas@uni.edu.bo',
        rol: 'JEFE_CARRERA',
      },
    });

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    // Todo PDF válido inicia con los bytes %PDF (0x25 0x50 0x44 0x46)
    expect(pdfBuffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  it('debe despachar notificación con destinatarios duales (personal + institucional) y PDF adjunto', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 Fake Acta PDF Buffer for testing');

    const resultado = await mailerService.enviarNotificacionSorteo({
      idEstudiante: '83',
      idCasoEstudio: '5',
      idDefensa: '100',
      idUsuarioEnvio: '24',
      correoDestino: 'sis-2026999@estudiante.edu.bo',
      correoPersonal: 'alejandro190902@gmail.com',
      correoInstitucional: 'sis-2026999@estudiante.edu.bo',
      nombreEstudiante: 'Mauricio Alejandro Vidal',
      carnetEstudiantil: 'SIS-2026999',
      carnetIdentidad: '9988776 SC',
      carrera: 'Ingeniería de Sistemas',
      facultad: 'FCT',
      areaNombre: 'Ciberseguridad',
      casoCodigo: 'CASO-5',
      casoTitulo: 'Análisis Forense',
      casoContenido: 'Contenido técnico de prueba',
      plazoHoras: 1.5,
      fechaDefensa: new Date(),
      tipoDefensa: 'INTERNA',
      codigoActa: 'ACTA-DEF-100-2026',
      tokenActa: 'TOKEN-INTEGRIDAD-HASH-12345',
      pdfBuffer: fakePdfBuffer,
    });

    expect(resultado).toBeDefined();
    expect(resultado.exito).toBe(true);
    expect(resultado.destinatario).toBe('sis-2026999@estudiante.edu.bo');
    expect(resultado.idMensaje).toBeDefined();
  });
});
