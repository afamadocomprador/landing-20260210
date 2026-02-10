-- 1. Eliminamos la vista anterior para evitar conflictos de nombres de columnas
DROP VIEW IF EXISTS view_professionals_enriquecida;

-- Creamos la vista enriquecida de profesionales con datos de su clínica
CREATE OR REPLACE VIEW view_professionals_enriquecida AS
SELECT 
    p.*,
    c.province AS clinic_province,
    c.ine_province_code AS ine_clinic_province_code,
    c.city AS clinic_town,
    c.ine_city_code AS ine_clinic_town_code,
    c.zip_code AS clinic_zip, -- Añadimos el código postal
    c.is_propio AS clinic_is_propio
FROM view_professionals p
JOIN view_clinics c ON p.clinic_id = c.clinic_id;

-- Importante: Dar permisos de lectura a la vista para el rol anon (API pública)
GRANT SELECT ON view_professionals_enriquecida TO anon;
GRANT SELECT ON view_professionals_enriquecida TO authenticated;