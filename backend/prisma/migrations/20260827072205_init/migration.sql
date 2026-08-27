-- CreateTable
CREATE TABLE "facultad" (
    "id_facultad" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,

    CONSTRAINT "facultad_pkey" PRIMARY KEY ("id_facultad")
);

-- CreateTable
CREATE TABLE "carrera" (
    "id_carrera" BIGSERIAL NOT NULL,
    "id_facultad" BIGINT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,

    CONSTRAINT "carrera_pkey" PRIMARY KEY ("id_carrera")
);

-- CreateTable
CREATE TABLE "plan_estudio" (
    "id_plan_estudio" BIGSERIAL NOT NULL,
    "id_carrera" BIGINT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "estado_vigencia" VARCHAR(20) NOT NULL DEFAULT 'VIGENTE',

    CONSTRAINT "plan_estudio_pkey" PRIMARY KEY ("id_plan_estudio")
);

-- CreateTable
CREATE TABLE "area_academica" (
    "id_area" BIGSERIAL NOT NULL,
    "id_carrera" BIGINT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "umbral_disponibilidad" INTEGER NOT NULL DEFAULT 2,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "area_academica_pkey" PRIMARY KEY ("id_area")
);

-- CreateTable
CREATE TABLE "plan_area" (
    "id_plan_estudio" BIGINT NOT NULL,
    "id_area" BIGINT NOT NULL,

    CONSTRAINT "plan_area_pkey" PRIMARY KEY ("id_plan_estudio","id_area")
);

-- CreateTable
CREATE TABLE "caso_estudio" (
    "id_caso_estudio" BIGSERIAL NOT NULL,
    "id_area" BIGINT NOT NULL,
    "titulo" VARCHAR(250) NOT NULL,
    "contenido" TEXT NOT NULL,
    "documento_adjunto" TEXT,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',

    CONSTRAINT "caso_estudio_pkey" PRIMARY KEY ("id_caso_estudio")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" BIGSERIAL NOT NULL,
    "id_rol" BIGINT NOT NULL,
    "primer_nombre" VARCHAR(80) NOT NULL,
    "segundo_nombre" VARCHAR(80),
    "primer_apellido" VARCHAR(80) NOT NULL,
    "segundo_apellido" VARCHAR(80),
    "correo_institucional" VARCHAR(200) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "usuario_carrera" (
    "id_usuario" BIGINT NOT NULL,
    "id_carrera" BIGINT NOT NULL,

    CONSTRAINT "usuario_carrera_pkey" PRIMARY KEY ("id_usuario","id_carrera")
);

-- CreateTable
CREATE TABLE "estudiante" (
    "id_estudiante" BIGSERIAL NOT NULL,
    "id_plan_estudio" BIGINT NOT NULL,
    "carnet_estudiantil" VARCHAR(50) NOT NULL,
    "carnet_identidad" VARCHAR(30) NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(200) NOT NULL,

    CONSTRAINT "estudiante_pkey" PRIMARY KEY ("id_estudiante")
);

-- CreateTable
CREATE TABLE "proceso_examen_grado" (
    "id_proceso" BIGSERIAL NOT NULL,
    "id_estudiante" BIGINT NOT NULL,
    "estado_proceso" VARCHAR(30) NOT NULL DEFAULT 'EN_CURSO',
    "fecha_inicio" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proceso_examen_grado_pkey" PRIMARY KEY ("id_proceso")
);

-- CreateTable
CREATE TABLE "instancia_examen_grado" (
    "id_instancia" BIGSERIAL NOT NULL,
    "id_proceso" BIGINT NOT NULL,
    "numero_instancia" SMALLINT NOT NULL,
    "estado_instancia" VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    "resultado" VARCHAR(20),

    CONSTRAINT "instancia_examen_grado_pkey" PRIMARY KEY ("id_instancia")
);

-- CreateTable
CREATE TABLE "tipo_defensa" (
    "id_tipo_defensa" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_defensa_pkey" PRIMARY KEY ("id_tipo_defensa")
);

-- CreateTable
CREATE TABLE "defensa_examen_grado" (
    "id_defensa" BIGSERIAL NOT NULL,
    "id_instancia" BIGINT NOT NULL,
    "id_tipo_defensa" BIGINT NOT NULL,
    "id_caso_utilizado" BIGINT,
    "fecha_defensa" DATE NOT NULL,
    "periodo_academico" VARCHAR(30) NOT NULL,
    "estado_defensa" VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA',
    "nota" DECIMAL(6,2),
    "resultado" VARCHAR(20),

    CONSTRAINT "defensa_examen_grado_pkey" PRIMARY KEY ("id_defensa")
);

-- CreateTable
CREATE TABLE "configuracion_sorteo_area" (
    "id_config_sorteo_area" BIGSERIAL NOT NULL,
    "id_carrera" BIGINT NOT NULL,
    "id_tipo_defensa" BIGINT NOT NULL,
    "orden" SMALLINT NOT NULL DEFAULT 1,
    "anticipacion" INTEGER,
    "unidad_anticipacion" VARCHAR(30),
    "estado_vigencia" VARCHAR(20) NOT NULL DEFAULT 'VIGENTE',

    CONSTRAINT "configuracion_sorteo_area_pkey" PRIMARY KEY ("id_config_sorteo_area")
);

-- CreateTable
CREATE TABLE "configuracion_sorteo_caso" (
    "id_config_sorteo_caso" BIGSERIAL NOT NULL,
    "id_carrera" BIGINT NOT NULL,
    "id_tipo_defensa" BIGINT NOT NULL,
    "modo_obtencion_caso" VARCHAR(40) NOT NULL DEFAULT 'NUEVO_SORTEO',
    "orden" SMALLINT NOT NULL DEFAULT 2,
    "anticipacion" INTEGER,
    "unidad_anticipacion" VARCHAR(30),
    "plazo_resolucion" INTEGER,
    "unidad_plazo" VARCHAR(30),
    "estado_vigencia" VARCHAR(20) NOT NULL DEFAULT 'VIGENTE',

    CONSTRAINT "configuracion_sorteo_caso_pkey" PRIMARY KEY ("id_config_sorteo_caso")
);

-- CreateTable
CREATE TABLE "sorteo" (
    "id_sorteo" BIGSERIAL NOT NULL,
    "id_defensa" BIGINT NOT NULL,
    "id_usuario_ejecutor" BIGINT NOT NULL,
    "id_plan_estudio_contexto" BIGINT NOT NULL,
    "id_sorteo_anterior" BIGINT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_defensa_contexto" DATE NOT NULL,
    "estado_sorteo" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "estudiante_presente" BOOLEAN NOT NULL DEFAULT true,
    "motivo_inasistencia" TEXT,

    CONSTRAINT "sorteo_pkey" PRIMARY KEY ("id_sorteo")
);

-- CreateTable
CREATE TABLE "sorteo_area" (
    "id_sorteo" BIGINT NOT NULL,
    "id_config_sorteo_area" BIGINT NOT NULL,
    "id_area_resultado" BIGINT NOT NULL,

    CONSTRAINT "sorteo_area_pkey" PRIMARY KEY ("id_sorteo")
);

-- CreateTable
CREATE TABLE "sorteo_area_pool" (
    "id_sorteo" BIGINT NOT NULL,
    "id_area" BIGINT NOT NULL,

    CONSTRAINT "sorteo_area_pool_pkey" PRIMARY KEY ("id_sorteo","id_area")
);

-- CreateTable
CREATE TABLE "sorteo_caso" (
    "id_sorteo" BIGINT NOT NULL,
    "id_config_sorteo_caso" BIGINT NOT NULL,
    "id_caso_seleccionado" BIGINT NOT NULL,
    "plazo_limite_entrega" TIMESTAMP(3),

    CONSTRAINT "sorteo_caso_pkey" PRIMARY KEY ("id_sorteo")
);

-- CreateTable
CREATE TABLE "envio_caso_estudio" (
    "id_envio" BIGSERIAL NOT NULL,
    "id_estudiante" BIGINT NOT NULL,
    "id_caso_estudio" BIGINT NOT NULL,
    "id_usuario_envio" BIGINT NOT NULL,
    "correo_destino" VARCHAR(200) NOT NULL,
    "fecha_hora_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_envio" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "envio_caso_estudio_pkey" PRIMARY KEY ("id_envio")
);

-- CreateTable
CREATE TABLE "registro_auditoria" (
    "id_registro_auditoria" BIGSERIAL NOT NULL,
    "id_usuario" BIGINT,
    "id_caso_estudio" BIGINT,
    "id_sorteo" BIGINT,
    "id_proceso" BIGINT,
    "id_instancia" BIGINT,
    "id_defensa" BIGINT,
    "id_envio" BIGINT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_operacion" VARCHAR(60) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "motivo" TEXT,
    "valor_anterior" JSONB,
    "valor_nuevo" JSONB,

    CONSTRAINT "registro_auditoria_pkey" PRIMARY KEY ("id_registro_auditoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "facultad_nombre_key" ON "facultad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "carrera_id_facultad_nombre_key" ON "carrera"("id_facultad", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "plan_estudio_id_carrera_nombre_key" ON "plan_estudio"("id_carrera", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "area_academica_id_carrera_nombre_key" ON "area_academica"("id_carrera", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_institucional_key" ON "usuario"("correo_institucional");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_carnet_estudiantil_key" ON "estudiante"("carnet_estudiantil");

-- CreateIndex
CREATE UNIQUE INDEX "instancia_examen_grado_id_proceso_numero_instancia_key" ON "instancia_examen_grado"("id_proceso", "numero_instancia");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_defensa_nombre_key" ON "tipo_defensa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "defensa_examen_grado_id_instancia_id_tipo_defensa_key" ON "defensa_examen_grado"("id_instancia", "id_tipo_defensa");

-- AddForeignKey
ALTER TABLE "carrera" ADD CONSTRAINT "carrera_id_facultad_fkey" FOREIGN KEY ("id_facultad") REFERENCES "facultad"("id_facultad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_estudio" ADD CONSTRAINT "plan_estudio_id_carrera_fkey" FOREIGN KEY ("id_carrera") REFERENCES "carrera"("id_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_academica" ADD CONSTRAINT "area_academica_id_carrera_fkey" FOREIGN KEY ("id_carrera") REFERENCES "carrera"("id_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_area" ADD CONSTRAINT "plan_area_id_plan_estudio_fkey" FOREIGN KEY ("id_plan_estudio") REFERENCES "plan_estudio"("id_plan_estudio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_area" ADD CONSTRAINT "plan_area_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area_academica"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caso_estudio" ADD CONSTRAINT "caso_estudio_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area_academica"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_carrera" ADD CONSTRAINT "usuario_carrera_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_carrera" ADD CONSTRAINT "usuario_carrera_id_carrera_fkey" FOREIGN KEY ("id_carrera") REFERENCES "carrera"("id_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_id_plan_estudio_fkey" FOREIGN KEY ("id_plan_estudio") REFERENCES "plan_estudio"("id_plan_estudio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proceso_examen_grado" ADD CONSTRAINT "proceso_examen_grado_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instancia_examen_grado" ADD CONSTRAINT "instancia_examen_grado_id_proceso_fkey" FOREIGN KEY ("id_proceso") REFERENCES "proceso_examen_grado"("id_proceso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defensa_examen_grado" ADD CONSTRAINT "defensa_examen_grado_id_instancia_fkey" FOREIGN KEY ("id_instancia") REFERENCES "instancia_examen_grado"("id_instancia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defensa_examen_grado" ADD CONSTRAINT "defensa_examen_grado_id_tipo_defensa_fkey" FOREIGN KEY ("id_tipo_defensa") REFERENCES "tipo_defensa"("id_tipo_defensa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defensa_examen_grado" ADD CONSTRAINT "defensa_examen_grado_id_caso_utilizado_fkey" FOREIGN KEY ("id_caso_utilizado") REFERENCES "caso_estudio"("id_caso_estudio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_sorteo_area" ADD CONSTRAINT "configuracion_sorteo_area_id_carrera_fkey" FOREIGN KEY ("id_carrera") REFERENCES "carrera"("id_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_sorteo_area" ADD CONSTRAINT "configuracion_sorteo_area_id_tipo_defensa_fkey" FOREIGN KEY ("id_tipo_defensa") REFERENCES "tipo_defensa"("id_tipo_defensa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_sorteo_caso" ADD CONSTRAINT "configuracion_sorteo_caso_id_carrera_fkey" FOREIGN KEY ("id_carrera") REFERENCES "carrera"("id_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_sorteo_caso" ADD CONSTRAINT "configuracion_sorteo_caso_id_tipo_defensa_fkey" FOREIGN KEY ("id_tipo_defensa") REFERENCES "tipo_defensa"("id_tipo_defensa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo" ADD CONSTRAINT "sorteo_id_defensa_fkey" FOREIGN KEY ("id_defensa") REFERENCES "defensa_examen_grado"("id_defensa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo" ADD CONSTRAINT "sorteo_id_usuario_ejecutor_fkey" FOREIGN KEY ("id_usuario_ejecutor") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo" ADD CONSTRAINT "sorteo_id_plan_estudio_contexto_fkey" FOREIGN KEY ("id_plan_estudio_contexto") REFERENCES "plan_estudio"("id_plan_estudio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo" ADD CONSTRAINT "sorteo_id_sorteo_anterior_fkey" FOREIGN KEY ("id_sorteo_anterior") REFERENCES "sorteo"("id_sorteo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_area" ADD CONSTRAINT "sorteo_area_id_sorteo_fkey" FOREIGN KEY ("id_sorteo") REFERENCES "sorteo"("id_sorteo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_area" ADD CONSTRAINT "sorteo_area_id_config_sorteo_area_fkey" FOREIGN KEY ("id_config_sorteo_area") REFERENCES "configuracion_sorteo_area"("id_config_sorteo_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_area" ADD CONSTRAINT "sorteo_area_id_area_resultado_fkey" FOREIGN KEY ("id_area_resultado") REFERENCES "area_academica"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_area_pool" ADD CONSTRAINT "sorteo_area_pool_id_sorteo_fkey" FOREIGN KEY ("id_sorteo") REFERENCES "sorteo_area"("id_sorteo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_area_pool" ADD CONSTRAINT "sorteo_area_pool_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area_academica"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_caso" ADD CONSTRAINT "sorteo_caso_id_sorteo_fkey" FOREIGN KEY ("id_sorteo") REFERENCES "sorteo"("id_sorteo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_caso" ADD CONSTRAINT "sorteo_caso_id_config_sorteo_caso_fkey" FOREIGN KEY ("id_config_sorteo_caso") REFERENCES "configuracion_sorteo_caso"("id_config_sorteo_caso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteo_caso" ADD CONSTRAINT "sorteo_caso_id_caso_seleccionado_fkey" FOREIGN KEY ("id_caso_seleccionado") REFERENCES "caso_estudio"("id_caso_estudio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_caso_estudio" ADD CONSTRAINT "envio_caso_estudio_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_caso_estudio" ADD CONSTRAINT "envio_caso_estudio_id_caso_estudio_fkey" FOREIGN KEY ("id_caso_estudio") REFERENCES "caso_estudio"("id_caso_estudio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_caso_estudio" ADD CONSTRAINT "envio_caso_estudio_id_usuario_envio_fkey" FOREIGN KEY ("id_usuario_envio") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_id_caso_estudio_fkey" FOREIGN KEY ("id_caso_estudio") REFERENCES "caso_estudio"("id_caso_estudio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_id_sorteo_fkey" FOREIGN KEY ("id_sorteo") REFERENCES "sorteo"("id_sorteo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_id_proceso_fkey" FOREIGN KEY ("id_proceso") REFERENCES "proceso_examen_grado"("id_proceso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_id_instancia_fkey" FOREIGN KEY ("id_instancia") REFERENCES "instancia_examen_grado"("id_instancia") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_id_defensa_fkey" FOREIGN KEY ("id_defensa") REFERENCES "defensa_examen_grado"("id_defensa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_id_envio_fkey" FOREIGN KEY ("id_envio") REFERENCES "envio_caso_estudio"("id_envio") ON DELETE SET NULL ON UPDATE CASCADE;
