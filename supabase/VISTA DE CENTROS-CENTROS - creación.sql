DROP VIEW IF EXISTS public.view_centros_centros;

CREATE OR REPLACE VIEW public.view_centros_centros AS
SELECT 
    -- 1. Jerarquía (Desde la Comarca obtenemos la provincia)
    m.codigo AS cod_municipio,
    
    -- 2. Datos Visuales / SEO
    -- Prioridad: Breadcrumb de landing > Nombre oficial INE
    vc.name AS nombre_centro,

    'slug-centro' AS slug_centro,
   
    -- Coordenadas: Prioridad Landing > Coordenadas INE > Null
    vc.latitude AS lat_centro,
    vc.longitude AS lng_centro,
    
    -- 3. Agregación (Métricas)
    1 AS num_centros_centro,
    vc.staff_count AS num_dentistas_centro

FROM 
    public.ine_municipios m

-- JOIN 1: Clínicas (INNER JOIN para filtrar SOLO municipios con centros)
JOIN 
    public.view_clinics vc ON m.codigo = vc.ine_city_code
;

-- ---------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------
ALTER VIEW public.view_centros_centros OWNER TO postgres;
GRANT SELECT ON public.view_centros_centros TO anon, authenticated, service_role;