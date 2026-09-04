import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function applyViews() {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://sgseg:sgseg@localhost:5437/sgseg?schema=public';

  console.log('================================================================================');
  console.log('SGSEG - APLICANDO VISTAS OPTIMIZADAS E ÍNDICES EN POSTGRESQL');
  console.log(`Conexión: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);
  console.log('================================================================================');

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const sqlPath = path.join(__dirname, 'vistas_optimizadas_carrera.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando script SQL...');
    await client.query(sql);
    console.log('✓ Vistas e índices aplicados exitosamente:');
    console.log('  - idx_caso_estudio_id_area');
    console.log('  - idx_caso_estudio_area_estado');
    console.log('  - idx_area_academica_id_carrera');
    console.log('  - idx_area_academica_carrera_estado');
    console.log('  - idx_defensa_id_caso_utilizado');
    console.log('  - idx_sorteo_caso_seleccionado');
    console.log('  - vista_casos_por_carrera');
    console.log('  - vista_areas_por_carrera');
  } catch (error) {
    console.error('❌ Error al aplicar vistas e índices:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applyViews();
