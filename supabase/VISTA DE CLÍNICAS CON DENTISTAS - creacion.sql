DROP VIEW IF EXISTS view_clinics_con_dentistas;

CREATE OR REPLACE VIEW view_clinics_con_dentistas AS
SELECT 
    -- 1. ID VIRTUAL
    md5(concat(m.sp_name, m.latitude::text, m.longitude::text)) as clinic_id,
    
    -- 2. DATOS PRINCIPALES
    m.sp_name as name,
    m.latitude,
    m.longitude,
    
    -- 3. DATOS DE CONTACTO
    MAX(m.address) as address,
    
    -- Ciudad
    MAX(m.town) as city, 
    MAX(m.ine_municipality_code) as ine_city_code, 

    -- >>> NUEVO CAMPO: CÓDIGO DE COMARCA <<<
    -- Lo sacamos de la tabla ine_municipios que hemos unido abajo
    MAX(mun.comarca_codigo) as ine_comarca_code,

    -- Provincia
    MAX(m.province) as province, 
    MAX(m.ine_province_code) as ine_province_code, 
        
    MAX(m.postal_code) as zip_code,

    -- Lógica de centro propio
    CASE 
        WHEN MAX(m.sp_is_health_space)::int = 1 THEN true
        ELSE false 
    END as is_propio,
    
    MAX(m.sp_customer_telephone_1) as phone,
    
    -- 4. LÓGICA DE NEGOCIO (Staff Count)
    GREATEST(
        COUNT(
            DISTINCT NULLIF(
                TRIM(
                    CONCAT_WS(' ', m.professional_name, m.professional_last_name_1, m.professional_last_name_2)
                ), 
                ''
            )
        ), 
        1
    ) as staff_count,

    -- Especialidades
    array_agg(DISTINCT m.speciality) FILTER (WHERE m.speciality IS NOT NULL) as specialties,

    -- Nombres de dentistas
    array_agg(DISTINCT m.professional_name) FILTER (WHERE m.professional_name IS NOT NULL AND m.professional_name <> '') as staff_names

FROM medical_directory_raw m
-- >>> JOIN NUEVO <<<
-- Unimos con ine_municipios para recuperar la comarca basándonos en el código de municipio
LEFT JOIN ine_municipios mun ON m.ine_municipality_code = mun.codigo

WHERE m.latitude IS NOT NULL AND m.longitude IS NOT NULL
GROUP BY m.sp_name, m.latitude, m.longitude;

-- 5. PERMISOS
GRANT SELECT ON view_clinics_con_dentistas TO anon, authenticated, service_role;