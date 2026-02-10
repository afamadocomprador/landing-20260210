CREATE OR REPLACE VIEW view_professionals AS
SELECT 
    -- 1. FOREIGN KEY VIRTUAL: 
    -- Generamos EL MISMO hash que en view_clinics para poder relacionarlos luego.
    md5(concat(sp_name, latitude::text, longitude::text)) as clinic_id,
    
    -- 2. DATOS DEL DOCTOR
    professional_name as full_name,
    
    -- Número de colegiado (dato valioso para credibilidad)
    professional_membership_number as license_number,
    
    -- 3. SUS ESPECIALIDADES
    -- Aquí agrupamos las filas repetidas del mismo doctor
    array_agg(DISTINCT speciality) FILTER (WHERE speciality IS NOT NULL) as specialties

FROM medical_directory_raw
WHERE 
    latitude IS NOT NULL 
    AND professional_name IS NOT NULL -- Filtramos filas que sean solo del centro sin médico asignado
    AND professional_name <> '' -- Filtramos filas que sean solo del centro sin médico asignado
GROUP BY 
    sp_name, latitude, longitude, 
    professional_name, professional_last_name_1, professional_last_name_2, professional_membership_number;

-- Permisos
GRANT SELECT ON view_professionals TO anon, authenticated, service_role;