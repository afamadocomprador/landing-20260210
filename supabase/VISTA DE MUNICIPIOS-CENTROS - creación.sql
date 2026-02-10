DROP VIEW IF EXISTS public.view_municipios_centros;

CREATE OR REPLACE VIEW public.view_municipios_centros AS
SELECT 
    -- 1. Jerarquía (Desde la Comarca obtenemos la provincia)
    c.provincia_codigo AS cod_provincia,
    m.codigo AS cod_municipio,
    
    -- 2. Datos Visuales / SEO
    -- Prioridad: Breadcrumb de landing > Nombre oficial INE
    COALESCE(l.breadcrumb, m.nombre) AS nombre_municipio,
    l.slug AS slug_municipio,
    
    -- Coordenadas: Prioridad Landing > Coordenadas INE > Null
    COALESCE(l.latitud_gps, m.latitud) AS lat_municipio,
    COALESCE(l.longitud_gps, m.longitud) AS lng_municipio,
    
    -- 3. Agregación (Métricas)
    COUNT(vc.clinic_id) AS num_centros_municipio,
    COALESCE(SUM(vc.staff_count), 0) AS num_dentistas_municipio

FROM 
    public.ine_municipios m

-- JOIN 1: Comarcas (Para obtener el cod_provincia)
JOIN 
    public.ine_comarcas c ON m.comarca_codigo = c.codigo

-- JOIN 2: Clínicas (INNER JOIN para filtrar SOLO municipios con centros)
JOIN 
    public.view_clinics vc ON m.codigo = vc.ine_city_code

-- JOIN 3: Landings (Datos SEO opcionales)
LEFT JOIN 
    public.landings_search_dentistry l ON m.codigo = l.codigo_ine
WHERE l.subcodigo_ine = ' '

GROUP BY 
    c.provincia_codigo,
    m.codigo,
    m.nombre,
    l.breadcrumb,
    l.slug,
    m.latitud,
    m.longitud,
    l.latitud_gps,
    l.longitud_gps;

-- ---------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------
ALTER VIEW public.view_municipios_centros OWNER TO postgres;
GRANT SELECT ON public.view_municipios_centros TO anon, authenticated, service_role;