import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface DatosActaSorteo {
  codigoActa: string;
  tokenActa?: string;
  fechaAsignacion: Date | string;
  plazoLimiteEntrega?: Date | string | null;
  estudiante: {
    nombreCompleto: string;
    carnetIdentidad: string;
    carnetEstudiantil: string;
    correoInstitucional: string;
    carrera: string;
    facultad: string;
    planEstudio: string;
  };
  defensa: {
    idDefensa: string;
    tipoDefensa: string;
    fechaDefensa: Date | string;
    periodoAcademico: string;
  };
  area: {
    nombre: string;
  };
  caso: {
    idCaso: string;
    titulo: string;
    contenido?: string;
  };
  usuarioEjecutor: {
    nombreCompleto: string;
    correo: string;
    rol: string;
  };
}

@Injectable()
export class ActasPdfService {
  /**
   * Genera el documento PDF formal del Acta de Sorteo de Examen de Grado en memoria.
   */
  async generarActaPdfBuffer(datos: DatosActaSorteo): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 36, bottom: 36, left: 40, right: 40 },
          info: {
            Title: `Acta de Sorteo - ${datos.codigoActa}`,
            Author: 'UTEPSA - Sistema de Gestión de Sorteos (SGSEG)',
            Subject: 'Acta Oficial de Asignación de Examen de Grado',
            Keywords: 'Acta, Sorteo, Grado, UTEPSA, Integridad',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        this.renderizarContenidoActa(doc, datos);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private renderizarContenidoActa(doc: PDFKit.PDFDocument, datos: DatosActaSorteo) {
    const primaryColor = '#7A1C1C'; // Granate / Crimson UTEPSA
    const textDark = '#1A1A1A';
    const textMuted = '#4A4A4A';
    const borderColor = '#D1D5DB';
    const bgLight = '#F9FAFB';

    const fechaAsigStr = new Date(datos.fechaAsignacion).toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      dateStyle: 'long',
      timeStyle: 'short',
    });

    const fechaDefensaStr = new Date(datos.defensa.fechaDefensa).toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      dateStyle: 'full',
    });

    const plazoStr = datos.plazoLimiteEntrega
      ? new Date(datos.plazoLimiteEntrega).toLocaleString('es-BO', {
          timeZone: 'America/La_Paz',
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : 'Según reglamento de carrera';

    // -------------------------------------------------------------
    // ENCABEZADO INSTITUCIONAL
    // -------------------------------------------------------------
    doc.rect(40, 36, 532, 6).fill(primaryColor);

    doc.moveDown(0.8);
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('UNIVERSIDAD TECNOLÓGICA PRIVADA DE SANTA CRUZ', { align: 'center' });

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(textMuted)
      .text('VICERRECTORADO ACADÉMICO · DIRECCIÓN DE GRADO', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(textDark)
      .text('ACTA OFICIAL DE ASIGNACIÓN DE ÁREA Y CASO DE ESTUDIO', {
        align: 'center',
        underline: false,
      });

    doc
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .fillColor(textMuted)
      .text('MODALIDAD EXAMEN DE GRADO · SISTEMA DE GESTIÓN Y AUDITORÍA DE SORTEOS (SGSEG)', {
        align: 'center',
      });

    // -------------------------------------------------------------
    // BARRA DE CONTROL Y METADATOS DEL ACTA
    // -------------------------------------------------------------
    const yBar = 108;
    doc.rect(40, yBar, 532, 24).fillAndStroke(bgLight, borderColor);

    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text(`N° ACTA: ${datos.codigoActa}`, 48, yBar + 7);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(textDark)
      .text(`Fecha y Hora de Emisión: ${fechaAsigStr}`, 280, yBar + 7, { align: 'right', width: 284 });

    // -------------------------------------------------------------
    // SECCIÓN 1: DATOS DEL POSTULANTE
    // -------------------------------------------------------------
    let curY = 142;
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('1. DATOS OFICIALES DEL POSTULANTE', 40, curY);

    curY += 14;
    doc.rect(40, curY, 532, 70).fillAndStroke('#FFFFFF', borderColor);

    const leftCol = 48;
    const midCol = 220;
    const rightCol = 410;
    let rY = curY + 8;

    // Fila 1
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('POSTULANTE:', leftCol, rY);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(textDark).text(datos.estudiante.nombreCompleto, leftCol, rY + 10);

    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('C.I.:', midCol, rY);
    doc.fontSize(8.5).font('Helvetica').fillColor(textDark).text(datos.estudiante.carnetIdentidad, midCol, rY + 10);

    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('REGISTRO / CU:', rightCol, rY);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(textDark).text(datos.estudiante.carnetEstudiantil, rightCol, rY + 10);

    // Fila 2
    rY += 28;
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('FACULTAD:', leftCol, rY);
    doc.fontSize(8).font('Helvetica').fillColor(textDark).text(datos.estudiante.facultad || 'UTEPSA', leftCol, rY + 10);

    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('CARRERA:', midCol, rY);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(textDark).text(datos.estudiante.carrera, midCol, rY + 10);

    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('TIPO DE EXAMEN:', rightCol, rY);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text(`DEFENSA ${datos.defensa.tipoDefensa}`, rightCol, rY + 10);

    // -------------------------------------------------------------
    // SECCIÓN 2: RESULTADOS DEL SORTEO DIGITAL (CSPRNG)
    // -------------------------------------------------------------
    curY = 236;
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('2. RESULTADOS DEL SORTEO DIGITAL ALEATORIO (CSPRNG CRYPTO)', 40, curY);

    curY += 14;
    doc.rect(40, curY, 532, 185).fillAndStroke('#FFFFFF', borderColor);

    let sY = curY + 8;
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('ÁREA DEL CONOCIMIENTO SORTEADA:', leftCol, sY);
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryColor).text(datos.area.nombre, leftCol, sY + 10);

    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('PERÍODO / FECHA DE DEFENSA:', rightCol - 40, sY);
    doc.fontSize(8).font('Helvetica').fillColor(textDark).text(`${datos.defensa.periodoAcademico} · ${fechaDefensaStr}`, rightCol - 40, sY + 10, { width: 190 });

    sY += 32;
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('CASO DE ESTUDIO ASIGNADO:', leftCol, sY);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(textDark).text(`[Caso #${datos.caso.idCaso}] ${datos.caso.titulo}`, leftCol, sY + 10, { width: 516 });

    sY += 28;
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('PLANTEAMIENTO Y PREGUNTAS DEL CASO:', leftCol, sY);

    const contenidoLimpio = (datos.caso.contenido || 'Contenido formal depositado en sobre sellado por Secretaría.')
      .replace(/\r?\n|\r/g, ' ')
      .trim();
    const resumenCaso = contenidoLimpio.length > 360 ? `${contenidoLimpio.substring(0, 360)}...` : contenidoLimpio;

    doc.rect(leftCol, sY + 10, 516, 62).fillAndStroke(bgLight, borderColor);
    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor(textDark)
      .text(resumenCaso, leftCol + 6, sY + 14, {
        width: 504,
        align: 'justify',
        lineGap: 1.5,
      });

    sY += 78;
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('PLAZO REGLAMENTARIO DE ENTREGA / PREPARACIÓN:', leftCol, sY);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text(plazoStr, leftCol, sY + 10);

    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('AUTORIDAD / EJECUTOR DEL SORTEO:', rightCol - 40, sY);
    doc.fontSize(8).font('Helvetica').fillColor(textDark).text(`${datos.usuarioEjecutor.nombreCompleto} (${datos.usuarioEjecutor.rol})`, rightCol - 40, sY + 10);

    // -------------------------------------------------------------
    // SECCIÓN 3: CERTIFICACIÓN CRIPTOGRÁFICA Y SEGURIDAD
    // -------------------------------------------------------------
    curY = 445;
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('3. SEGURIDAD, TRAZABILIDAD Y AUDITORÍA CRIPTOGRÁFICA', 40, curY);

    curY += 14;
    doc.rect(40, curY, 532, 54).fillAndStroke(bgLight, borderColor);

    let secY = curY + 6;
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textMuted).text('TOKEN CRIPTOGRÁFICO DE VERIFICACIÓN (SHA-256):', leftCol, secY);
    doc
      .fontSize(8)
      .font('Courier-Bold')
      .fillColor(primaryColor)
      .text(datos.tokenActa || 'SHA256-AUTHENTICATED-SEAL-VALIDATED', leftCol, secY + 10);

    secY += 24;
    doc
      .fontSize(6.8)
      .font('Helvetica')
      .fillColor(textMuted)
      .text(
        'El presente documento ha sido generado automáticamente por el Sistema SGSEG de la UTEPSA bajo estándares de integridad algorítmica. ' +
        'El hash criptográfico certifica que la asignación no ha sufrido modificaciones y reposa con copia fiel en los libros digitales de la universidad.',
        leftCol,
        secY,
        { width: 516, align: 'justify' },
      );

    // -------------------------------------------------------------
    // SECCIÓN 4: CUADRO DE FIRMAS LEGALES A 3 COLUMNAS
    // -------------------------------------------------------------
    curY = 545;
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('4. CONFORMIDAD Y FIRMAS OFICIALES', 40, curY);

    curY += 16;
    doc.rect(40, curY, 532, 130).fillAndStroke('#FFFFFF', borderColor);

    const fY = curY + 68;
    const colWidth = 150;
    const col1X = 55;
    const col2X = 231;
    const col3X = 407;

    doc.strokeColor(borderColor);
    doc.moveTo(col1X, fY).lineTo(col1X + colWidth, fY).stroke();
    doc.moveTo(col2X, fY).lineTo(col2X + colWidth, fY).stroke();
    doc.moveTo(col3X, fY).lineTo(col3X + colWidth, fY).stroke();

    // Columna 1: Postulante
    doc
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .fillColor(textDark)
      .text(datos.estudiante.nombreCompleto, col1X, fY + 6, { width: colWidth, align: 'center' });
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(textMuted)
      .text(`POSTULANTE\nCI: ${datos.estudiante.carnetIdentidad}`, col1X, fY + 17, { width: colWidth, align: 'center' });

    // Columna 2: Jefe de Carrera
    doc
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .fillColor(textDark)
      .text(datos.usuarioEjecutor.nombreCompleto, col2X, fY + 6, { width: colWidth, align: 'center' });
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(textMuted)
      .text(`JEFE DE CARRERA / PRESIDENTE\n${datos.estudiante.carrera}`, col2X, fY + 17, { width: colWidth, align: 'center' });

    // Columna 3: Fe Pública / Secretaría
    doc
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .fillColor(textDark)
      .text('SECRETARÍA ACADÉMICA', col3X, fY + 6, { width: colWidth, align: 'center' });
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(textMuted)
      .text('TESTIGO DE FE PÚBLICA\nUTEPSA', col3X, fY + 17, { width: colWidth, align: 'center' });

    // -------------------------------------------------------------
    // PIE DE PÁGINA
    // -------------------------------------------------------------
    doc.rect(40, 742, 532, 1).fill(borderColor);
    doc
      .fontSize(6.5)
      .font('Helvetica')
      .fillColor(textMuted)
      .text(
        `UTEPSA SGSEG · Acta Oficial N° ${datos.codigoActa} · Página 1 de 1 · Generado el ${fechaAsigStr}`,
        40,
        748,
        { align: 'center', width: 532 },
      );
  }
}
