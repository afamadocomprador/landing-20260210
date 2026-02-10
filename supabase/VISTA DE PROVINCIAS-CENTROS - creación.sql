DROP VIEW IF EXISTS view_provincias_centros;

CREATE OR REPLACE VIEW view_provincias_centros AS
SELECT 
    -- 1. Datos Administrativos (INE)
    p.codigo AS cod_provincia,
    p.comunidad_codigo AS cod_comunidad,
    
    
    -- 2. Datos SEO/Geo (Landings)
    l.breadcrumb AS nombre_provincia,
    l.slug AS slug_provincia,
    l.latitud_gps AS lat_provincia,
    l.longitud_gps AS lng_provincia,
    
    -- 3. Agregación (Métricas de Negocio)
    -- Cuenta de clínicas (filas encontradas en view_clinics)
    COUNT(vc.clinic_id) AS num_centros_provincia,
    
    -- Cuenta de Dentistas: Sumamos el campo 'staff_count' de cada clínica.
    -- COALESCE asegura que si no hay clínicas, devuelva 0 en vez de NULL.
    COALESCE(SUM(vc.staff_count), 0) AS num_dentistas_provincia

FROM 
    ine_provincias p

-- JOIN 1: Landings (Match con prefijo 'CA-')
LEFT JOIN 
    landings_search_dentistry l 
    ON l.codigo_ine = p.codigo

-- JOIN 2: Clínicas (Datos reales, uniendo por provincia)
LEFT JOIN 
    view_clinics vc 
    ON p.codigo = vc.ine_province_code

GROUP BY 
    p.codigo, 
    p.comunidad_codigo, 
    l.breadcrumb,
    l.slug, 
    l.latitud_gps, 
    l.longitud_gps;

-- ---------------------------------------------------------
-- CONFIGURACIÓN DE SEGURIDAD Y PERMISOS
-- ---------------------------------------------------------

-- 1. Asignar el dueño al sistema (postgres) para evitar problemas si borras tu usuario
ALTER VIEW public.view_provincias_centros OWNER TO postgres;

-- 2. Conceder permisos de lectura a los roles de API de Supabase
-- 'anon': Usuarios no logueados (Web pública)
-- 'authenticated': Usuarios logueados
-- 'service_role': Servidor (Next.js server actions)
GRANT SELECT ON public.view_provincias_centros TO anon, authenticated, service_role;