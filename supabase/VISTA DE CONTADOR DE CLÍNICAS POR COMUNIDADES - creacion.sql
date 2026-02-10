DROP VIEW IF EXISTS view_community_counters;

CREATE OR REPLACE VIEW view_community_counters AS
SELECT 
    prov.comunidad_codigo,
    COUNT(*) as total_centros
FROM view_clinics c
JOIN ine_provincias prov ON c.ine_province_code = prov.codigo
GROUP BY prov.comunidad_codigo;

-- Permisos
GRANT SELECT ON view_community_counters TO anon, authenticated, service_role;