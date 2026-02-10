DROP VIEW IF EXISTS view_clinics;

CREATE OR REPLACE VIEW view_clinics AS
SELECT 
    -- 1. ID VIRTUAL: Generamos un hash único basado en Nombre + Coordenadas
    md5(concat(sp_name, latitude::text, longitude::text)) as clinic_id,
    
    -- 2. DATOS PRINCIPALES
    sp_name as name,
    latitude,
    longitude,
    
    -- 3. DATOS DE CONTACTO (Normalización)
    MAX(address) as address,
    
    -- Mapeo: 'town' de tu tabla -> 'city' para el frontend
    MAX(town) as city, 

    MAX(ine_municipality_code) as ine_city_code, 

    -- Mapeo: 'province' de tu tabla -> 'province' para el frontend
    MAX(province) as province, 

    MAX(ine_province_code) as ine_province_code, 
        
    MAX(postal_code) as zip_code,

    -- >>> LÓGICA DE CENTRO PROPIO (Campo sp_is_health_space) <<<
    -- Usamos MAX() y cast a integer para asegurar la comparación
    CASE 
        WHEN MAX(sp_is_health_space)::int = 1 THEN true
        ELSE false 
    END as is_propio,
    
    MAX(sp_customer_telephone_1) as phone,
    
    -- 4. LÓGICA DE NEGOCIO (Agregaciones)
    
    -- Contamos profesionales ÚNICOS concatenando Nombre + Apellidos para evitar duplicados si se llaman igual
    --  COUNT(DISTINCT CONCAT_WS(' ', professional_name, professional_last_name_1, professional_last_name_2)) 
    -- Al menos contamos 1 por los centros cuyo único profesional es espacios (radilogía por ej)
   GREATEST(
    COUNT(
        DISTINCT NULLIF(
            TRIM(
                CONCAT_WS(' ', professional_name, professional_last_name_1, professional_last_name_2)
            ), 
            ''
        )
    ), 
    1
   ) as staff_count,

    
    -- Lista de especialidades únicas en ese centro
    array_agg(DISTINCT speciality) FILTER (WHERE speciality IS NOT NULL) as specialties

FROM medical_directory_raw
-- FILTRO DE SEGURIDAD: Solo mostramos clínicas que tengan coordenadas válidas para el mapa
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY sp_name, latitude, longitude;

-- 5. PERMISOS
-- Permitimos que la API lea esta vista
GRANT SELECT ON view_clinics TO anon, authenticated, service_role;


