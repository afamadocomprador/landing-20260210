DROP VIEW IF EXISTS public.view_hubs_centros;


CREATE OR REPLACE VIEW public.view_hubs_centros AS
WITH hub_structure AS (
    -- Bajamos por toda la jerarquía usando LEFT JOIN
    SELECT DISTINCT
        h.codigo_ine_municipio,
        h.codigo AS codigo_hub,
        h.nombre AS nombre_hub,
        
        l.slug AS slug_hub,

        -- >>> CAMBIO: Las coordenadas vienen ahora de la tabla landings
        l.latitud_gps AS lat_hub,
        l.longitud_gps AS lng_hub,
        
        rbcp.codigo_postal
    FROM 
        public.hubs h
        
    -- 1. UNIÓN CON LANDINGS (Para obtener coordenadas)
    LEFT JOIN public.landings_search_dentistry l 
        ON h.codigo_ine_municipio = l.codigo_ine 
        AND h.codigo = l.subcodigo_ine
        AND l.nivel = '05' -- Aseguramos que sea la landing del Hub

    -- 2. JERARQUÍA DE TERRITORIO (Hacia abajo)
    LEFT JOIN public.rel_hubs_distritos rhd ON h.id = rhd.hub_id
    LEFT JOIN public.distritos d ON rhd.distrito_id = d.id
    LEFT JOIN public.rel_distritos_barrios rdb ON d.id = rdb.distrito_id
    LEFT JOIN public.barrios b ON rdb.barrio_id = b.id
    LEFT JOIN public.rel_barrios_codigos_postales rbcp ON b.id = rbcp.barrio_id
)
SELECT 
    hs.codigo_ine_municipio,
    hs.codigo_hub,
    hs.nombre_hub,
    
    hs.slug_hub,

    hs.lat_hub,
    hs.lng_hub,

    -- Métricas
    COUNT(DISTINCT vc.clinic_id) AS num_centros_hub,
    COALESCE(SUM(vc.staff_count), 0) AS num_dentistas_hub
    
FROM 
    hub_structure hs
-- Cruzamos con las clínicas
LEFT JOIN 
    public.view_clinics_con_dentistas vc 
    ON hs.codigo_postal IS NOT NULL 
    AND hs.codigo_postal = vc.zip_code

GROUP BY 
    hs.codigo_ine_municipio,
    hs.codigo_hub,
    hs.nombre_hub,
    hs.slug_hub,
    hs.lat_hub,
    hs.lng_hub;

-- Permisos
GRANT SELECT ON public.view_hubs_centros TO anon, authenticated, service_role;