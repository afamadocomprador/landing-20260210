DROP VIEW IF EXISTS view_province_counters;

CREATE OR REPLACE VIEW view_province_counters AS
SELECT 
    -- Recuperamos el código de provincia
    prov.codigo,
    COUNT(*) as total_centros
FROM view_clinics c
-- Hacemos JOIN con provincias usando los 2 primeros dígitos del CP
JOIN ine_provincias prov ON LEFT(c.zip_code, 2) = prov.codigo
GROUP BY prov.codigo;

-- Permisos
GRANT SELECT ON view_province_counters TO anon, authenticated, service_role;