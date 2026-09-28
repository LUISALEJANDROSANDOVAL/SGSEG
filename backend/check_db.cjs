const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.STORAGE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  const defensas = await p.defensaExamenGrado.findMany({
    select: {
      idDefensa: true,
      estadoDefensa: true,
      instancia: {
        select: {
          proceso: {
            select: {
              estudiante: {
                select: {
                  nombreCompleto: true,
                  planEstudio: {
                    select: {
                      carrera: { select: { nombre: true, idCarrera: true } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const asignaciones = await p.asignacionCaso.findMany({
    select: {
      idAsignacion: true,
      idDefensa: true,
      estado: true,
    }
  });

  console.log('=== DEFENSAS EN DB ===');
  defensas.forEach(d => {
    const est = d.instancia.proceso.estudiante;
    console.log(`idDefensa: ${d.idDefensa} | estado: ${d.estadoDefensa} | estudiante: ${est.nombreCompleto} | carrera: ${est.planEstudio.carrera.nombre} | carreraId: ${est.planEstudio.carrera.idCarrera}`);
  });

  console.log('\n=== ASIGNACIONES EN DB ===');
  if (asignaciones.length === 0) {
    console.log('(ninguna - tabla AsignacionCaso vacía)');
  } else {
    asignaciones.forEach(a => {
      console.log(`idAsignacion: ${a.idAsignacion} | idDefensa: ${a.idDefensa} | estado: ${a.estado}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
