-- AlterTable: estudiante (Separar correo institucional y correo personal)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'estudiante' AND column_name = 'correo'
  ) THEN
    ALTER TABLE "estudiante" RENAME COLUMN "correo" TO "correo_institucional";
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'estudiante' AND column_name = 'correo_institucional'
    ) THEN
      ALTER TABLE "estudiante" ADD COLUMN "correo_institucional" VARCHAR(200) NOT NULL DEFAULT '';
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'estudiante' AND column_name = 'correo_personal'
  ) THEN
    ALTER TABLE "estudiante" ADD COLUMN "correo_personal" VARCHAR(200);
  END IF;
END $$;

-- CreateTable: asignacion_caso
CREATE TABLE IF NOT EXISTS "asignacion_caso" (
    "id_asignacion" BIGSERIAL NOT NULL,
    "id_estudiante" BIGINT NOT NULL,
    "id_defensa" BIGINT NOT NULL,
    "id_area" BIGINT NOT NULL,
    "id_caso" BIGINT NOT NULL,
    "id_usuario_ejecutor" BIGINT NOT NULL,
    "id_sorteo" BIGINT,
    "token_acta" VARCHAR(100),
    "codigo_acta" VARCHAR(100),
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plazo_limite_entrega" TIMESTAMP(3),
    "estado" VARCHAR(30) NOT NULL DEFAULT 'ASIGNADO',

    CONSTRAINT "asignacion_caso_pkey" PRIMARY KEY ("id_asignacion")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "asignacion_caso_id_defensa_key" ON "asignacion_caso"("id_defensa");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "asignacion_caso_id_caso_estado_idx" ON "asignacion_caso"("id_caso", "estado");

-- CreateIndex: Partial Unique Index for Concurrency and Active Case Locking
CREATE UNIQUE INDEX IF NOT EXISTS "idx_asignacion_caso_activo_unico" 
ON "asignacion_caso" ("id_caso") 
WHERE estado IN ('ASIGNADO', 'EN_CURSO');

-- CreateTable: sesion_espectador_sorteo
CREATE TABLE IF NOT EXISTS "sesion_espectador_sorteo" (
    "id_sesion" BIGSERIAL NOT NULL,
    "token" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "id_defensa" BIGINT NOT NULL,
    "id_estudiante" BIGINT NOT NULL,
    "fase" VARCHAR(30) NOT NULL DEFAULT 'ESPERANDO',
    "estado_payload" JSONB,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sesion_espectador_sorteo_pkey" PRIMARY KEY ("id_sesion")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sesion_espectador_sorteo_token_key" ON "sesion_espectador_sorteo"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sesion_espectador_sorteo_slug_key" ON "sesion_espectador_sorteo"("slug");

-- AddForeignKey: asignacion_caso
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asignacion_caso_id_estudiante_fkey') THEN
    ALTER TABLE "asignacion_caso" ADD CONSTRAINT "asignacion_caso_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asignacion_caso_id_defensa_fkey') THEN
    ALTER TABLE "asignacion_caso" ADD CONSTRAINT "asignacion_caso_id_defensa_fkey" FOREIGN KEY ("id_defensa") REFERENCES "defensa_examen_grado"("id_defensa") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asignacion_caso_id_area_fkey') THEN
    ALTER TABLE "asignacion_caso" ADD CONSTRAINT "asignacion_caso_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area_academica"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asignacion_caso_id_caso_fkey') THEN
    ALTER TABLE "asignacion_caso" ADD CONSTRAINT "asignacion_caso_id_caso_fkey" FOREIGN KEY ("id_caso") REFERENCES "caso_estudio"("id_caso_estudio") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asignacion_caso_id_usuario_ejecutor_fkey') THEN
    ALTER TABLE "asignacion_caso" ADD CONSTRAINT "asignacion_caso_id_usuario_ejecutor_fkey" FOREIGN KEY ("id_usuario_ejecutor") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asignacion_caso_id_sorteo_fkey') THEN
    ALTER TABLE "asignacion_caso" ADD CONSTRAINT "asignacion_caso_id_sorteo_fkey" FOREIGN KEY ("id_sorteo") REFERENCES "sorteo"("id_sorteo") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey: sesion_espectador_sorteo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sesion_espectador_sorteo_id_defensa_fkey') THEN
    ALTER TABLE "sesion_espectador_sorteo" ADD CONSTRAINT "sesion_espectador_sorteo_id_defensa_fkey" FOREIGN KEY ("id_defensa") REFERENCES "defensa_examen_grado"("id_defensa") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sesion_espectador_sorteo_id_estudiante_fkey') THEN
    ALTER TABLE "sesion_espectador_sorteo" ADD CONSTRAINT "sesion_espectador_sorteo_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
