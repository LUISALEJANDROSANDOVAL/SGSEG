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
    const textDark = '#000000';
    
    // Top right code
    doc.fontSize(7).font('Helvetica').fillColor(textDark);
    doc.text('COD.: PO-DFG-100-7    VER.: 2    VIGENTE: 01-06-2018', 0, 40, { align: 'right' });

    doc.moveDown(3);

    // Title
    doc.fontSize(14).font('Helvetica-Bold');
    const titleText = 'ACTA DE SORTEO PARA DEFENSA DE GRADO';
    // Emulate spaced letters
    const spacedTitle = titleText.split('').join(' ');
    doc.text(spacedTitle, { align: 'center', underline: true });
    
    // Acta number
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`No. ${datos.codigoActa}`, { align: 'right' });
    
    doc.moveDown(1.5);

    // Paragraph
    const fechaAsig = new Date(datos.fechaAsignacion);
    const horas = fechaAsig.toLocaleTimeString('es-BO', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit' });
    const dia = fechaAsig.toLocaleDateString('es-BO', { timeZone: 'America/La_Paz', day: '2-digit' });
    const mes = fechaAsig.toLocaleDateString('es-BO', { timeZone: 'America/La_Paz', month: 'long' });
    const anio = fechaAsig.toLocaleDateString('es-BO', { timeZone: 'America/La_Paz', year: 'numeric' });

    doc.fontSize(11).font('Times-Roman');
    
    const parrafoText = `En Santa Cruz de la Sierra, a horas ${horas} del día ${dia}, ${mes}, ${anio}, en secretaría de la facultad de ${datos.estudiante.facultad || 'Ciencias y Tecnología'}, de la Universidad Tecnológica Privada de Santa Cruz, se reunieron el Jefe de Carrera, estudiante y testigo académico, para realizar el SORTEO DE ÁREAS DEL CONOCIMIENTO para la Defensa de Grado de ${datos.estudiante.nombreCompleto} con registro ${datos.estudiante.carnetEstudiantil} bajo la modalidad de postulante al Título Académico de Licenciatura en ${datos.estudiante.carrera}.`;
    
    doc.text(parrafoText, { align: 'justify', lineGap: 4 });

    doc.moveDown(1.5);
    
    // Jefe and Testigo
    doc.font('Times-Bold').text(`Jefe de Carrera: `, { continued: true });
    doc.font('Times-Roman').text(datos.usuarioEjecutor.nombreCompleto, { underline: true });
    
    doc.moveDown(0.5);
    doc.font('Times-Bold').text(`Testigo Académico: `, { continued: true });
    doc.font('Times-Roman').text('_________________________________', { underline: false });

    doc.moveDown(1.5);
    doc.text('Realizado el sorteo, al estudiante le corresponde el área:');
    doc.moveDown(1);
    doc.font('Times-Bold').text(datos.area.nombre, { align: 'center', underline: true });
    doc.moveDown(1.5);
    
    const fechaDefensaStr = new Date(datos.defensa.fechaDefensa).toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      dateStyle: 'long',
    });
    
    doc.font('Times-Roman').text(`Para ser expuesto en su Defensa de Grado el día ${fechaDefensaStr}.`);
    doc.moveDown(1);
    
    // Add 20 minutes to horas for conclusion
    const fechaFin = new Date(fechaAsig.getTime() + 20 * 60000);
    const horasFin = fechaFin.toLocaleTimeString('es-BO', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit' });
    
    doc.text(`El acto concluyó a horas. ${horasFin} y para constancia firman al pie de la presente Acta de Sorteo los presentes.`);

    doc.moveDown(5);

    // Signatures
    const tableY = doc.y;
    const colWidth = 200;
    const leftX = 70;
    const rightX = doc.page.width - 70 - colWidth;
    
    doc.font('Times-Roman').fontSize(11);

    // Fila 1 (Jefe de Carrera y Testigo)
    doc.text('____________________________________', leftX, tableY, { width: colWidth, align: 'center' });
    doc.text('____________________________________', rightX, tableY, { width: colWidth, align: 'center' });
    
    doc.moveDown(0.2);
    const textY = doc.y;
    doc.text(datos.usuarioEjecutor.nombreCompleto, leftX, textY, { width: colWidth, align: 'center' });
    doc.text('Testigo Académico', rightX, textY, { width: colWidth, align: 'center' });

    doc.moveDown(0.2);
    doc.font('Times-Bold').text('Jefe de Carrera', leftX, doc.y, { width: colWidth, align: 'center' });

    // Fila 2 (Estudiante Postulante)
    doc.moveDown(4);
    const bottomY = doc.y;
    doc.font('Times-Roman').text('____________________________________', leftX, bottomY, { width: colWidth, align: 'center' });
    
    doc.moveDown(0.2);
    doc.font('Times-Bold').text('Estudiante Postulante', leftX, doc.y, { width: colWidth, align: 'center' });

    // Page number bottom right
    doc.fontSize(10).font('Times-Roman');
    doc.text('Página 1 de 1', 0, 720, { align: 'right' });
  }
}
