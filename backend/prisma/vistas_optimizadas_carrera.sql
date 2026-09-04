-- =============================================================================
-- SGSEG - VISTAS OPTIMIZADAS E ÍNDICES POR CARRERA (PostgreSQL)
-- Vistas relacionales y de agregación para listar Casos y Áreas por id_carrera
-- =============================================================================

-- 1. ÍNDICES DE ALTO RENDIMIENTO PARA CONSULTAS POR CARRERA Y ÁREA
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_caso_estudio_id_area 
  ON caso_estudio(id_area);

CREATE INDEX IF NOT EXISTS idx_caso_estudio_area_estado 
  ON caso_estudio(id_area, estado);

CREATE INDEX IF NOT EXISTS idx_area_academica_id_carrera 
  ON area_academica(id_carrera);

CREATE INDEX IF NOT EXISTS idx_area_academica_carrera_estado 
  ON area_academica(id_carrera, estado);

CREATE INDEX IF NOT EXISTS idx_defensa_id_caso_utilizado 
  ON defensa_examen_grado(id_caso_utilizado) 
  WHERE id_caso_utilizado IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sorteo_caso_seleccionado 
  ON sorteo_caso(id_caso_seleccionado);

-- 2. VISTA OPTIMIZADA: vista_casos_por_carrera
-- -----------------------------------------------------------------------------
-- Desnormaliza la jerarquía Facultad -> Carrera -> Área -> Caso
-- Pre-calcula el conteo consolidado de defensas (usos) y sorteos
-- Evalúa el estado_efectivo según el umbral reglamentario y excepciones especiales
CREATE OR REPLACE VIEW vista_casos_por_carrera AS
SELECT 
    c.id_caso_estudio,
    c.titulo,
    c.contenido,
    c.documento_adjunto,
    c.estado AS estado_base,
    a.id_area,
    a.nombre AS nombre_area,
    a.umbral_disponibilidad,
    a.estado AS estado_area,
    car.id_carrera,
    car.nombre AS nombre_carrera,
    f.id_facultad,
    f.nombre AS nombre_facultad,
    COALESCE(d.total_defensas, 0)::INT AS total_usos,
    COALESCE(s.total_sorteos, 0)::INT AS total_sorteos,
    CASE
        WHEN c.estado = 'INACTIVO' THEN 'INACTIVO'
        WHEN c.estado = 'REACTIVADO_ESPECIAL' THEN 'REACTIVADO_ESPECIAL'
        WHEN c.estado = 'AGOTADO' OR COALESCE(d.total_defensas, 0) >= a.umbral_disponibilidad THEN 'AGOTADO'
        ELSE 'DISPONIBLE'
    END AS estado_efectivo,
    CASE
        WHEN c.estado = 'INACTIVO' THEN FALSE
        WHEN c.estado = 'REACTIVADO_ESPECIAL' THEN TRUE
        WHEN c.estado = 'DISPONIBLE' AND COALESCE(d.total_defensas, 0) < a.umbral_disponibilidad THEN TRUE
        ELSE FALSE
    END AS es_disponible_para_sorteo
FROM caso_estudio c
INNER JOIN area_academica a ON c.id_area = a.id_area
INNER JOIN carrera car ON a.id_carrera = car.id_carrera
INNER JOIN facultad f ON car.id_facultad = f.id_facultad
LEFT JOIN (
    SELECT id_caso_utilizado, COUNT(*) AS total_defensas
    FROM defensa_examen_grado
    WHERE id_caso_utilizado IS NOT NULL
    GROUP BY id_caso_utilizado
) d ON c.id_caso_estudio = d.id_caso_utilizado
LEFT JOIN (
    SELECT id_caso_seleccionado, COUNT(*) AS total_sorteos
    FROM sorteo_caso
    GROUP BY id_caso_seleccionado
) s ON c.id_caso_estudio = s.id_caso_seleccionado;

-- 3. VISTA OPTIMIZADA: vista_areas_por_carrera
-- -----------------------------------------------------------------------------
-- Resume las áreas académicas agrupadas por carrera con conteo de casos en una sola pasada
-- Evalúa alertas preventivas de stock crítico respecto al umbral
CREATE OR REPLACE VIEW vista_areas_por_carrera AS
SELECT 
    a.id_area,
    a.nombre AS nombre_area,
    a.umbral_disponibilidad,
    a.estado AS estado_area,
    car.id_carrera,
    car.nombre AS nombre_carrera,
    f.id_facultad,
    f.nombre AS nombre_facultad,
    COUNT(vc.id_caso_estudio)::INT AS total_casos,
    COUNT(CASE WHEN vc.estado_efectivo IN ('DISPONIBLE', 'REACTIVADO_ESPECIAL') THEN 1 END)::INT AS casos_disponibles,
    COUNT(CASE WHEN vc.estado_efectivo = 'AGOTADO' THEN 1 END)::INT AS casos_agotados,
    COUNT(CASE WHEN vc.estado_efectivo = 'INACTIVO' THEN 1 END)::INT AS casos_inactivos,
    CASE 
        WHEN COUNT(CASE WHEN vc.estado_efectivo IN ('DISPONIBLE', 'REACTIVADO_ESPECIAL') THEN 1 END) < a.umbral_disponibilidad 
        THEN TRUE 
        ELSE FALSE 
    END AS stock_critico,
    CASE 
        WHEN COUNT(CASE WHEN vc.estado_efectivo IN ('DISPONIBLE', 'REACTIVADO_ESPECIAL') THEN 1 END) < a.umbral_disponibilidad 
        THEN CONCAT('Alerta: Área "', a.nombre, '" con stock crítico (', 
                    COUNT(CASE WHEN vc.estado_efectivo IN ('DISPONIBLE', 'REACTIVADO_ESPECIAL') THEN 1 END), 
                    ' disponibles frente al umbral de ', a.umbral_disponibilidad, ')')
        ELSE 'Stock adecuado'
    END AS mensaje_alerta
FROM area_academica a
INNER JOIN carrera car ON a.id_carrera = car.id_carrera
INNER JOIN facultad f ON car.id_facultad = f.id_facultad
LEFT JOIN vista_casos_por_carrera vc ON a.id_area = vc.id_area
GROUP BY 
    a.id_area,
    a.nombre,
    a.umbral_disponibilidad,
    a.estado,
    car.id_carrera,
    car.nombre,
    f.id_facultad,
    f.nombre;
