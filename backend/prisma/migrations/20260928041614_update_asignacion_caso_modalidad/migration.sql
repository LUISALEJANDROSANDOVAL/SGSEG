-- AlterTable
ALTER TABLE "asignacion_caso" ADD COLUMN     "modalidad" VARCHAR(30) NOT NULL DEFAULT 'AREA_Y_CASO',
ALTER COLUMN "id_caso" DROP NOT NULL;
