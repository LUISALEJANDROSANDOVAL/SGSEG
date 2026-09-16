import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// CONFIGURACIÓN DE POSTULANTES POR CARRERA
// ============================================================================

interface PostulanteDef {
  carnet: string;
  ci: string;
  nombre: string;
  correo: string;
  periodo: 'I-2025' | 'II-2025' | 'I-2026' | 'II-2026';
  estado: 'PROGRAMADA' | 'AREA_SORTEADA' | 'CASO_ASIGNADO' | 'CALIFICADO';
  tipo: 'INTERNA' | 'EXTERNA';
  fechaOffsetDias: number; // días respecto a la fecha base del periodo
  nota?: number;
  resultado?: 'APROBADO' | 'REPROBADO';
  inasistencia?: boolean;
  motivoInasistencia?: string;
  observaciones?: string;
}

// Prefijos y nombres por carrera para generar datos coherentes y verosímiles
const PLANTILLAS_14_CARRERAS: Record<
  string,
  {
    sigla: string;
    tribunal: { presidente: string; secretario: string; vocal: string };
    postulantes: PostulanteDef[];
  }
> = {
  Psicología: {
    sigla: 'PSI',
    tribunal: {
      presidente: 'Lic. Mariana Gutiérrez Torrico',
      secretario: 'Lic. Carla Benavides Roca',
      vocal: 'Lic. Javier Salinas Rivero',
    },
    postulantes: [
      // Activas II-2026
      {
        carnet: 'PSI-2024001',
        ci: '8392101 SC',
        nombre: 'Valeria Nicole Cuéllar Morales',
        correo: 'valeria.cuellar@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 8,
      },
      {
        carnet: 'PSI-2024002',
        ci: '7482912 CB',
        nombre: 'Diego Andrés Flores Justiniano',
        correo: 'diego.flores@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 5,
      },
      {
        carnet: 'PSI-2024003',
        ci: '6391023 LP',
        nombre: 'Camila Andrea Vaca Díez',
        correo: 'camila.vaca@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 2,
      },
      {
        carnet: 'PSI-2024004',
        ci: '5829104 TJ',
        nombre: 'Sebastián Leonardo Rojas Paz',
        correo: 'sebastian.rojas@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -3,
        nota: 91.0,
        resultado: 'APROBADO',
        observaciones: 'Excelente enfoque clínico sistémico y solvencia teórica.',
      },
      // Históricas
      {
        carnet: 'PSI-2023010',
        ci: '7182935 SC',
        nombre: 'Natalia Sofía Torrez Melgar',
        correo: 'natalia.torrez@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -90,
        nota: 85.5,
        resultado: 'APROBADO',
      },
      {
        carnet: 'PSI-2023020',
        ci: '8291046 CB',
        nombre: 'Jorge Ignacio Claros Menacho',
        correo: 'jorge.claros@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -270,
        nota: 46.0,
        resultado: 'REPROBADO',
        observaciones: 'Falta de rigurosidad en la evaluación psicométrica.',
      },
      {
        carnet: 'PSI-2022030',
        ci: '6391827 LP',
        nombre: 'Lorena Patricia Antelo Suárez',
        correo: 'lorena.antelo@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -450,
        nota: 94.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Relaciones Internacionales': {
    sigla: 'RII',
    tribunal: {
      presidente: 'Lic. Alejandro Melgar Justiniano',
      secretario: 'Lic. Claudia Vaca Díez',
      vocal: 'Dr. Fernando Morales Roca',
    },
    postulantes: [
      {
        carnet: 'RII-2024001',
        ci: '8172631 SC',
        nombre: 'Rodrigo Mateo Zeballos Hurtado',
        correo: 'rodrigo.zeballos@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 7,
      },
      {
        carnet: 'RII-2024002',
        ci: '9012382 LP',
        nombre: 'Luciana Beatriz Montero Claros',
        correo: 'luciana.montero@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 4,
      },
      {
        carnet: 'RII-2024003',
        ci: '6819203 CB',
        nombre: 'Mateo Alejandro Banegas Dorado',
        correo: 'mateo.banegas@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 3,
      },
      {
        carnet: 'RII-2024004',
        ci: '7482914 SC',
        nombre: 'Gabriela Jimena Barba Ortiz',
        correo: 'gabriela.barba@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -2,
        nota: 88.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'RII-2023010',
        ci: '6281925 PT',
        nombre: 'Esteban Daniel Pedraza Siles',
        correo: 'esteban.pedraza@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -100,
        nota: 79.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'RII-2022020',
        ci: '7192836 TJ',
        nombre: 'Mariana Cecilia Chávez Rivero',
        correo: 'mariana.chavez@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -460,
        nota: 92.5,
        resultado: 'APROBADO',
      },
    ],
  },

  'Ingeniería Comercial': {
    sigla: 'ICO',
    tribunal: {
      presidente: 'Lic. Claudia Arteaga Mendoza',
      secretario: 'Lic. Fernando Suárez Morales',
      vocal: 'Lic. Jimena Paz Zeballos',
    },
    postulantes: [
      {
        carnet: 'ICO-2024001',
        ci: '8392015 SC',
        nombre: 'Joaquín Andrés Suárez Delgado',
        correo: 'joaquin.suarez@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 9,
      },
      {
        carnet: 'ICO-2024002',
        ci: '7192836 CB',
        nombre: 'Natalia Andrea Guzmán Terán',
        correo: 'natalia.guzman@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 6,
      },
      {
        carnet: 'ICO-2024003',
        ci: '6281927 LP',
        nombre: 'Carlos Eduardo De La Sierra',
        correo: 'carlos.delasierra@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 3,
      },
      {
        carnet: 'ICO-2024004',
        ci: '8172638 SC',
        nombre: 'Fabiola Nicole Melgar Ortiz',
        correo: 'fabiola.melgar@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -4,
        nota: 95.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'ICO-2023010',
        ci: '9012389 CB',
        nombre: 'Mauricio Javier Antelo Claros',
        correo: 'mauricio.antelo@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -110,
        nota: 86.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'ICO-2023020',
        ci: '7482910 LP',
        nombre: 'Patricia Andrea Morales Roca',
        correo: 'patricia.morales@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -280,
        nota: 44.0,
        resultado: 'REPROBADO',
      },
      {
        carnet: 'ICO-2022030',
        ci: '5829101 TJ',
        nombre: 'Bruno Alejandro Banegas Paz',
        correo: 'bruno.banegas@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -440,
        nota: 89.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Administración General': {
    sigla: 'ADM',
    tribunal: {
      presidente: 'Lic. Fernando Suárez Morales',
      secretario: 'Lic. Claudia Arteaga Mendoza',
      vocal: 'Lic. Marco Claros Hurtado',
    },
    postulantes: [
      {
        carnet: 'ADM-2024001',
        ci: '8392111 SC',
        nombre: 'Gabriel Ignacio Torrico Justiniano',
        correo: 'gabriel.torrico@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 7,
      },
      {
        carnet: 'ADM-2024002',
        ci: '7482922 CB',
        nombre: 'Mariana Sofía Claros Dorado',
        correo: 'mariana.claros@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 5,
      },
      {
        carnet: 'ADM-2024003',
        ci: '6391033 LP',
        nombre: 'Alejandro Bruno Banegas Ortiz',
        correo: 'alejandro.banegas@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 2,
      },
      {
        carnet: 'ADM-2024004',
        ci: '5829144 SC',
        nombre: 'Camila Nicole Villarroel Cortez',
        correo: 'camila.villarroel@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -2,
        nota: 87.5,
        resultado: 'APROBADO',
      },
      {
        carnet: 'ADM-2023010',
        ci: '7182955 CB',
        nombre: 'Sebastián Andrés Melgar Rivero',
        correo: 'sebastian.melgar@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -95,
        nota: 81.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'ADM-2022020',
        ci: '8291066 LP',
        nombre: 'Valeria Jimena Barba Aguilera',
        correo: 'valeria.barba@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -265,
        nota: 93.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Marketing y Publicidad': {
    sigla: 'MKT',
    tribunal: {
      presidente: 'Lic. Jimena Paz Zeballos',
      secretario: 'Lic. Sergio Villarroel Cortez',
      vocal: 'Lic. Claudia Arteaga Mendoza',
    },
    postulantes: [
      {
        carnet: 'MKT-2024001',
        ci: '8172641 SC',
        nombre: 'Luciana Belén Sandoval Paz',
        correo: 'luciana.sandoval@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 8,
      },
      {
        carnet: 'MKT-2024002',
        ci: '9012352 CB',
        nombre: 'Mateo Alejandro Villarroel',
        correo: 'mateo.villarroel@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 4,
      },
      {
        carnet: 'MKT-2024003',
        ci: '6819263 LP',
        nombre: 'Natalia Andrea Guzmán Terán',
        correo: 'natalia.guzman@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 2,
      },
      {
        carnet: 'MKT-2024004',
        ci: '7482974 SC',
        nombre: 'Rodrigo Andrés Céspedes Suarez',
        correo: 'rodrigo.cespedes@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -3,
        nota: 90.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'MKT-2023010',
        ci: '6281985 TJ',
        nombre: 'Laura Sofía Cuéllar Dorado',
        correo: 'laura.cuellar@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -105,
        nota: 88.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'MKT-2022020',
        ci: '7192896 PT',
        nombre: 'Diego Alonso Paredes Ríos',
        correo: 'diego.paredes@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -455,
        nota: 85.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Ingeniería Financiera': {
    sigla: 'IFI',
    tribunal: {
      presidente: 'Lic. Marco Claros Hurtado',
      secretario: 'Lic. Rosario Méndez Ortiz',
      vocal: 'Lic. Fernando Suárez Morales',
    },
    postulantes: [
      {
        carnet: 'IFI-2024001',
        ci: '8392171 SC',
        nombre: 'Esteban Daniel Pedraza Siles',
        correo: 'esteban.pedraza@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 7,
      },
      {
        carnet: 'IFI-2024002',
        ci: '7482982 CB',
        nombre: 'Camila Nicole Justiniano',
        correo: 'camila.justiniano@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 5,
      },
      {
        carnet: 'IFI-2024003',
        ci: '6391093 LP',
        nombre: 'Sebastián Ignacio Torrez',
        correo: 'sebastian.torrez@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 1,
      },
      {
        carnet: 'IFI-2024004',
        ci: '5829104 SC',
        nombre: 'Fabiola Andrea Zeballos',
        correo: 'fabiola.zeballos@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -5,
        nota: 92.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'IFI-2023010',
        ci: '7182915 CB',
        nombre: 'Gabriel Estefano Montero',
        correo: 'gabriel.montero@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -115,
        nota: 77.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'IFI-2022020',
        ci: '8291026 LP',
        nombre: 'Valeria Jimena Barba',
        correo: 'valeria.barba@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -275,
        nota: 96.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Contaduría Pública': {
    sigla: 'CPA',
    tribunal: {
      presidente: 'Lic. Rosario Méndez Ortiz',
      secretario: 'Lic. Marco Claros Hurtado',
      vocal: 'Lic. Fernando Suárez Morales',
    },
    postulantes: [
      {
        carnet: 'CPA-2024001',
        ci: '8172651 SC',
        nombre: 'Mauricio Javier Antelo Melgar',
        correo: 'mauricio.antelo@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 9,
      },
      {
        carnet: 'CPA-2024002',
        ci: '9012362 CB',
        nombre: 'Natalia Jimena Claros Roca',
        correo: 'natalia.claros@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 6,
      },
      {
        carnet: 'CPA-2024003',
        ci: '6819273 LP',
        nombre: 'Gabriel Estefano Montero',
        correo: 'gabriel.montero@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 3,
      },
      {
        carnet: 'CPA-2024004',
        ci: '7482984 SC',
        nombre: 'Valeria Jimena Barba Aguilera',
        correo: 'valeria.barba@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -1,
        nota: 88.5,
        resultado: 'APROBADO',
      },
      {
        carnet: 'CPA-2023010',
        ci: '6281995 TJ',
        nombre: 'Carlos Eduardo De La Barra',
        correo: 'carlos.delabarra@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -98,
        nota: 91.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'CPA-2022020',
        ci: '7192806 PT',
        nombre: 'Mariana Sofía Torrico Mendoza',
        correo: 'mariana.torrico@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -465,
        nota: 48.0,
        resultado: 'REPROBADO',
      },
    ],
  },

  'Comercio Internacional': {
    sigla: 'CIN',
    tribunal: {
      presidente: 'Lic. Daniel Torrico Alarcón',
      secretario: 'Lic. Claudia Arteaga Mendoza',
      vocal: 'Lic. Alejandro Melgar Justiniano',
    },
    postulantes: [
      {
        carnet: 'CIN-2024001',
        ci: '8392181 SC',
        nombre: 'Diego Alonso Paredes Ríos',
        correo: 'diego.paredes@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 6,
      },
      {
        carnet: 'CIN-2024002',
        ci: '7482992 CB',
        nombre: 'Valeria Andrea Rojas Mamani',
        correo: 'valeria.rojas@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 4,
      },
      {
        carnet: 'CIN-2024003',
        ci: '6391003 LP',
        nombre: 'Alejandro Morales Quispe',
        correo: 'alejandro.morales@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 2,
      },
      {
        carnet: 'CIN-2024004',
        ci: '5829114 SC',
        nombre: 'Luciana Beatriz Aguilar Vega',
        correo: 'luciana.aguilar@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -3,
        nota: 86.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'CIN-2023010',
        ci: '7182925 CB',
        nombre: 'Mateo Sebastián Romero',
        correo: 'mateo.romero@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -108,
        nota: 83.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'CIN-2022020',
        ci: '8291036 LP',
        nombre: 'Camila Nicole Choque Huanca',
        correo: 'camila.choque@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -272,
        nota: 95.5,
        resultado: 'APROBADO',
      },
    ],
  },

  Turismo: {
    sigla: 'TUR',
    tribunal: {
      presidente: 'Lic. Verónica Banegas Dorado',
      secretario: 'Lic. Fernando Suárez Morales',
      vocal: 'Lic. Sergio Villarroel Cortez',
    },
    postulantes: [
      {
        carnet: 'TUR-2024001',
        ci: '8172661 SC',
        nombre: 'Camila Andrea Vaca Díez',
        correo: 'camila.vaca@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 8,
      },
      {
        carnet: 'TUR-2024002',
        ci: '9012372 CB',
        nombre: 'Diego Andrés Flores Justiniano',
        correo: 'diego.flores@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 5,
      },
      {
        carnet: 'TUR-2024003',
        ci: '6819283 LP',
        nombre: 'Valeria Nicole Cuéllar Morales',
        correo: 'valeria.cuellar@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 1,
      },
      {
        carnet: 'TUR-2024004',
        ci: '7482994 SC',
        nombre: 'Sebastián Leonardo Rojas Paz',
        correo: 'sebastian.rojas@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -2,
        nota: 93.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'TUR-2023010',
        ci: '6281905 TJ',
        nombre: 'Natalia Sofía Torrez Melgar',
        correo: 'natalia.torrez@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -92,
        nota: 87.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'TUR-2022020',
        ci: '7192816 PT',
        nombre: 'Jorge Ignacio Claros Menacho',
        correo: 'jorge.claros@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -448,
        nota: 91.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Comunicación Estratégica y Digital': {
    sigla: 'CED',
    tribunal: {
      presidente: 'Lic. Sergio Villarroel Cortez',
      secretario: 'Lic. Jimena Paz Zeballos',
      vocal: 'Lic. Verónica Banegas Dorado',
    },
    postulantes: [
      {
        carnet: 'CED-2024001',
        ci: '8392191 SC',
        nombre: 'Lorena Patricia Antelo Suárez',
        correo: 'lorena.antelo@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 7,
      },
      {
        carnet: 'CED-2024002',
        ci: '7482902 CB',
        nombre: 'Rodrigo Mateo Zeballos',
        correo: 'rodrigo.zeballos@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 4,
      },
      {
        carnet: 'CED-2024003',
        ci: '6391013 LP',
        nombre: 'Luciana Beatriz Montero Claros',
        correo: 'luciana.montero@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 2,
      },
      {
        carnet: 'CED-2024004',
        ci: '5829124 SC',
        nombre: 'Mateo Alejandro Banegas Dorado',
        correo: 'mateo.banegas@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -4,
        nota: 89.5,
        resultado: 'APROBADO',
      },
      {
        carnet: 'CED-2023010',
        ci: '7182935 CB',
        nombre: 'Gabriela Jimena Barba Ortiz',
        correo: 'gabriela.barba@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -102,
        nota: 82.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'CED-2022020',
        ci: '8291046 LP',
        nombre: 'Esteban Daniel Pedraza Siles',
        correo: 'esteban.pedraza@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -268,
        nota: 94.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Industrial y Comercial': {
    sigla: 'IIC',
    tribunal: {
      presidente: 'Ing. Juan Aguilera Justiniano',
      secretario: 'Ing. Oscar Justiniano Ribera',
      vocal: 'Ing. Rolando Vaca Díez Mercado',
    },
    postulantes: [
      {
        carnet: 'IIC-2024001',
        ci: '8172671 SC',
        nombre: 'Mariana Cecilia Chávez Rivero',
        correo: 'mariana.chavez@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 9,
      },
      {
        carnet: 'IIC-2024002',
        ci: '9012382 CB',
        nombre: 'Joaquín Andrés Suárez Delgado',
        correo: 'joaquin.suarez@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 5,
      },
      {
        carnet: 'IIC-2024003',
        ci: '6819293 LP',
        nombre: 'Natalia Andrea Guzmán Terán',
        correo: 'natalia.guzman@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 2,
      },
      {
        carnet: 'IIC-2024004',
        ci: '7482904 SC',
        nombre: 'Carlos Eduardo De La Sierra',
        correo: 'carlos.delasierra@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -1,
        nota: 91.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'IIC-2023010',
        ci: '6281915 TJ',
        nombre: 'Fabiola Nicole Melgar Ortiz',
        correo: 'fabiola.melgar@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -112,
        nota: 79.5,
        resultado: 'APROBADO',
      },
      {
        carnet: 'IIC-2022020',
        ci: '7192826 PT',
        nombre: 'Mauricio Javier Antelo Claros',
        correo: 'mauricio.antelo@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -452,
        nota: 88.0,
        resultado: 'APROBADO',
      },
    ],
  },

  Mecánica: {
    sigla: 'MEC',
    tribunal: {
      presidente: 'Ing. Oscar Justiniano Ribera',
      secretario: 'Ing. Juan Aguilera Justiniano',
      vocal: 'Ing. Jorge Roca Salvatierra',
    },
    postulantes: [
      {
        carnet: 'MEC-2024001',
        ci: '8392101 SC',
        nombre: 'Patricia Andrea Morales Roca',
        correo: 'patricia.morales@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 8,
      },
      {
        carnet: 'MEC-2024002',
        ci: '7482912 CB',
        nombre: 'Bruno Alejandro Banegas Paz',
        correo: 'bruno.banegas@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 5,
      },
      {
        carnet: 'MEC-2024003',
        ci: '6391023 LP',
        nombre: 'Gabriel Ignacio Torrico',
        correo: 'gabriel.torrico@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 1,
      },
      {
        carnet: 'MEC-2024004',
        ci: '5829134 SC',
        nombre: 'Mariana Sofía Claros Dorado',
        correo: 'mariana.claros@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -3,
        nota: 94.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'MEC-2023010',
        ci: '7182945 CB',
        nombre: 'Alejandro Bruno Banegas Ortiz',
        correo: 'alejandro.banegas@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -106,
        nota: 84.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'MEC-2022020',
        ci: '8291056 LP',
        nombre: 'Camila Nicole Villarroel',
        correo: 'camila.villarroel@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -278,
        nota: 42.0,
        resultado: 'REPROBADO',
      },
    ],
  },

  'Electrónica y Sistemas': {
    sigla: 'ELS',
    tribunal: {
      presidente: 'Ing. Jorge Roca Salvatierra',
      secretario: 'Ing. Mario Chávez Gutiérrez',
      vocal: 'Ing. Dennis Gomez Quiroga',
    },
    postulantes: [
      {
        carnet: 'ELS-2024001',
        ci: '8172681 SC',
        nombre: 'Sebastián Andrés Melgar Rivero',
        correo: 'sebastian.melgar@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 7,
      },
      {
        carnet: 'ELS-2024002',
        ci: '9012392 CB',
        nombre: 'Valeria Jimena Barba Aguilera',
        correo: 'valeria.barba@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 4,
      },
      {
        carnet: 'ELS-2024003',
        ci: '6819203 LP',
        nombre: 'Luciana Belén Sandoval Paz',
        correo: 'luciana.sandoval@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 3,
      },
      {
        carnet: 'ELS-2024004',
        ci: '7482914 SC',
        nombre: 'Mateo Alejandro Villarroel',
        correo: 'mateo.villarroel@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -2,
        nota: 92.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'ELS-2023010',
        ci: '6281925 TJ',
        nombre: 'Natalia Andrea Guzmán Terán',
        correo: 'natalia.guzman@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -94,
        nota: 86.5,
        resultado: 'APROBADO',
      },
      {
        carnet: 'ELS-2022020',
        ci: '7192836 PT',
        nombre: 'Rodrigo Andrés Céspedes',
        correo: 'rodrigo.cespedes@estudiante.edu.bo',
        periodo: 'I-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -462,
        nota: 88.0,
        resultado: 'APROBADO',
      },
    ],
  },

  'Ingeniería Eléctrica': {
    sigla: 'IEL',
    tribunal: {
      presidente: 'Ing. Mario Chávez Gutiérrez',
      secretario: 'Ing. Jorge Roca Salvatierra',
      vocal: 'Ing. Oscar Justiniano Ribera',
    },
    postulantes: [
      {
        carnet: 'IEL-2024001',
        ci: '8392111 SC',
        nombre: 'Laura Sofía Cuéllar Dorado',
        correo: 'laura.cuellar@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'PROGRAMADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 8,
      },
      {
        carnet: 'IEL-2024002',
        ci: '7482922 CB',
        nombre: 'Diego Alonso Paredes Ríos',
        correo: 'diego.paredes@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'AREA_SORTEADA',
        tipo: 'INTERNA',
        fechaOffsetDias: 5,
      },
      {
        carnet: 'IEL-2024003',
        ci: '6391033 LP',
        nombre: 'Esteban Daniel Pedraza Siles',
        correo: 'esteban.pedraza@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CASO_ASIGNADO',
        tipo: 'EXTERNA',
        fechaOffsetDias: 2,
      },
      {
        carnet: 'IEL-2024004',
        ci: '5829144 SC',
        nombre: 'Camila Nicole Justiniano',
        correo: 'camila.justiniano@estudiante.edu.bo',
        periodo: 'II-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -4,
        nota: 95.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'IEL-2023010',
        ci: '7182955 CB',
        nombre: 'Sebastián Ignacio Torrez',
        correo: 'sebastian.torrez@estudiante.edu.bo',
        periodo: 'I-2026',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -104,
        nota: 89.0,
        resultado: 'APROBADO',
      },
      {
        carnet: 'IEL-2022020',
        ci: '8291066 LP',
        nombre: 'Fabiola Andrea Zeballos',
        correo: 'fabiola.zeballos@estudiante.edu.bo',
        periodo: 'II-2025',
        estado: 'CALIFICADO',
        tipo: 'INTERNA',
        fechaOffsetDias: -274,
        nota: 91.0,
        resultado: 'APROBADO',
      },
    ],
  },
};

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

async function main() {
  console.log('========================================================================');
  console.log('🚀 POBLACIÓN DE DEFENSAS Y ESTUDIANTES: 14 CARRERAS CON HISTÓRICO');
  console.log('========================================================================\n');

  const inicio = Date.now();
  const ahora = new Date();

  // Usuario ejecutor institucional (Coordinación)
  const usuarioEjecutor =
    (await prisma.usuario.findFirst({ where: { correoInstitucional: 'coord@uni.edu.bo' } })) ??
    (await prisma.usuario.findFirstOrThrow());

  const tipoInterna = await prisma.tipoDefensa.findFirstOrThrow({ where: { nombre: 'INTERNA' } });
  const tipoExterna = await prisma.tipoDefensa.findFirstOrThrow({ where: { nombre: 'EXTERNA' } });

  let totalDefensasProcesadas = 0;
  let totalEstudiantesProcesados = 0;

  for (const [carreraNombre, plantilla] of Object.entries(PLANTILLAS_14_CARRERAS)) {
    const carrera = await prisma.carrera.findFirst({
      where: { nombre: carreraNombre },
      include: {
        planesEstudio: true,
        areasAcademicas: { include: { casos: true } },
        configuracionesArea: true,
        configuracionesCaso: true,
      },
    });

    if (!carrera) {
      console.warn(`⚠️ Carrera "${carreraNombre}" no encontrada en la BD. Saltando.`);
      continue;
    }

    const plan =
      carrera.planesEstudio.find((p) => p.estadoVigencia === 'VIGENTE') ||
      carrera.planesEstudio[0];

    if (!plan) {
      console.warn(`⚠️ Carrera "${carreraNombre}" no tiene planes. Saltando.`);
      continue;
    }

    const configArea = carrera.configuracionesArea.find(
      (c) => c.idTipoDefensa === tipoInterna.idTipoDefensa,
    );
    const configCaso = carrera.configuracionesCaso.find(
      (c) => c.idTipoDefensa === tipoInterna.idTipoDefensa,
    );

    let defensasCarrera = 0;

    for (let i = 0; i < plantilla.postulantes.length; i++) {
      const p = plantilla.postulantes[i];

      // 1. Estudiante
      let estudiante = await prisma.estudiante.findUnique({
        where: { carnetEstudiantil: p.carnet },
      });

      if (!estudiante) {
        estudiante = await prisma.estudiante.create({
          data: {
            idPlanEstudio: plan.idPlanEstudio,
            carnetEstudiantil: p.carnet,
            carnetIdentidad: p.ci,
            nombreCompleto: p.nombre,
            correo: p.correo,
            estado: 'ACTIVO',
          },
        });
        totalEstudiantesProcesados++;
      }

      // 2. Proceso de Examen de Grado
      let proceso = await prisma.procesoExamenGrado.findFirst({
        where: { idEstudiante: estudiante.idEstudiante },
      });

      if (!proceso) {
        proceso = await prisma.procesoExamenGrado.create({
          data: {
            idEstudiante: estudiante.idEstudiante,
            estadoProceso: p.estado === 'CALIFICADO' ? 'CONCLUIDO' : 'EN_CURSO',
          },
        });
      }

      // 3. Instancia de Examen de Grado
      let instancia = await prisma.instanciaExamenGrado.findFirst({
        where: { idProceso: proceso.idProceso, numeroInstancia: 1 },
      });

      if (!instancia) {
        instancia = await prisma.instanciaExamenGrado.create({
          data: {
            idProceso: proceso.idProceso,
            numeroInstancia: 1,
            estadoInstancia: p.estado === 'CALIFICADO' ? 'CONCLUIDO' : 'PENDIENTE',
            resultado: p.resultado ?? null,
          },
        });
      }

      // 4. Tipo de defensa
      const tipoDefensaObj = p.tipo === 'EXTERNA' ? tipoExterna : tipoInterna;

      // 5. Fecha calculada
      const fechaDefensa = new Date(ahora.getTime() + p.fechaOffsetDias * 24 * 3600 * 1000);

      // 6. Área y caso aleatorios de la carrera
      const area = carrera.areasAcademicas[i % carrera.areasAcademicas.length];
      const caso = area?.casos[0] || carrera.areasAcademicas[0]?.casos[0];

      // 7. Crear o actualizar Defensa
      let defensa = await prisma.defensaExamenGrado.findUnique({
        where: {
          idInstancia_idTipoDefensa: {
            idInstancia: instancia.idInstancia,
            idTipoDefensa: tipoDefensaObj.idTipoDefensa,
          },
        },
      });

      if (!defensa) {
        defensa = await prisma.defensaExamenGrado.create({
          data: {
            idInstancia: instancia.idInstancia,
            idTipoDefensa: tipoDefensaObj.idTipoDefensa,
            idCasoUtilizado:
              p.estado === 'CASO_ASIGNADO' || p.estado === 'CALIFICADO'
                ? caso?.idCasoEstudio ?? null
                : null,
            fechaDefensa,
            periodoAcademico: p.periodo,
            estadoDefensa: p.estado,
            nota: p.nota ?? null,
            resultado: p.resultado ?? null,
          },
        });
      } else {
        defensa = await prisma.defensaExamenGrado.update({
          where: { idDefensa: defensa.idDefensa },
          data: {
            periodoAcademico: p.periodo,
            estadoDefensa: p.estado,
            nota: p.nota ?? null,
            resultado: p.resultado ?? null,
            idCasoUtilizado:
              p.estado === 'CASO_ASIGNADO' || p.estado === 'CALIFICADO'
                ? caso?.idCasoEstudio ?? null
                : defensa.idCasoUtilizado,
          },
        });
      }

      // 8. Sorteos según el estado para reflejar el flujo
      if (
        (p.estado === 'AREA_SORTEADA' || p.estado === 'CASO_ASIGNADO' || p.estado === 'CALIFICADO') &&
        area &&
        configArea
      ) {
        let sorteo = await prisma.sorteo.findFirst({
          where: { idDefensa: defensa.idDefensa },
        });

        if (!sorteo) {
          sorteo = await prisma.sorteo.create({
            data: {
              idDefensa: defensa.idDefensa,
              idUsuarioEjecutor: usuarioEjecutor.idUsuario,
              idPlanEstudioContexto: plan.idPlanEstudio,
              fechaDefensaContexto: fechaDefensa,
              estadoSorteo: 'ACTIVO',
              estudiantePresente: !p.inasistencia,
              motivoInasistencia: p.motivoInasistencia ?? null,
            },
          });

          await prisma.sorteoArea.create({
            data: {
              idSorteo: sorteo.idSorteo,
              idConfigSorteoArea: configArea.idConfigSorteoArea,
              idAreaResultado: area.idArea,
            },
          });

          if ((p.estado === 'CASO_ASIGNADO' || p.estado === 'CALIFICADO') && caso && configCaso) {
            await prisma.sorteoCaso.create({
              data: {
                idSorteo: sorteo.idSorteo,
                idConfigSorteoCaso: configCaso.idConfigSorteoCaso,
                idCasoSeleccionado: caso.idCasoEstudio,
              },
            });
          }
        }
      }

      // 9. Auditoría con Tribunal Examinador
      const operacion = p.estado === 'CALIFICADO' ? 'REGISTRO_CALIFICACION' : 'ACTUALIZACION_DEFENSA';
      const auditExistente = await prisma.registroAuditoria.findFirst({
        where: {
          idDefensa: defensa.idDefensa,
          tipoOperacion: operacion,
        },
      });

      if (!auditExistente) {
        await prisma.registroAuditoria.create({
          data: {
            idUsuario: usuarioEjecutor.idUsuario,
            idDefensa: defensa.idDefensa,
            idInstancia: instancia.idInstancia,
            idProceso: proceso.idProceso,
            tipoOperacion: operacion,
            descripcion:
              p.estado === 'CALIFICADO'
                ? `Calificación oficial registrada: ${p.nota}/100 pts (${p.resultado}) [Periodo ${p.periodo}]`
                : `Designación de Tribunal Evaluador para defensa ID ${defensa.idDefensa}`,
            valorNuevo: {
              nota: p.nota ?? null,
              resultado: p.resultado ?? null,
              estadoDefensa: p.estado,
              periodoAcademico: p.periodo,
              tribunal: {
                presidente: plantilla.tribunal.presidente,
                secretario: plantilla.tribunal.secretario,
                vocal: plantilla.tribunal.vocal,
              },
              observaciones:
                p.observaciones ??
                `Defensa evaluada conforme al reglamento de grado de la carrera de ${carreraNombre}.`,
            },
          },
        });
      }

      defensasCarrera++;
      totalDefensasProcesadas++;
    }

    console.log(`   ✅ [${carreraNombre}]: ${defensasCarrera} postulantes e histórico sembrados.`);
  }

  const duracion = ((Date.now() - inicio) / 1000).toFixed(2);
  console.log('\n========================================================================');
  console.log(`🎉 POBLACIÓN DE DEFENSAS E HISTÓRICO COMPLETADA EN ${duracion}s`);
  console.log(`   Total Defensas Procesadas: ${totalDefensasProcesadas}`);
  console.log(`   Total Nuevos Estudiantes Registrados: ${totalEstudiantesProcesados}`);
  console.log('========================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la población de defensas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
