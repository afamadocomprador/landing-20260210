-- 1. Índices para búsqueda rápida de landings por slug y nivel
CREATE INDEX IF NOT EXISTS idx_landings_slug ON landings_search_dentistry (slug);
CREATE INDEX IF NOT EXISTS idx_landings_nivel ON landings_search_dentistry (nivel, subnivel);

-- 2. Índices CRÍTICOS para las relaciones (Interlinking)
-- Esto permite encontrar "Hijos de una provincia" en milisegundos entre miles de filas
CREATE INDEX IF NOT EXISTS idx_rel_origen ON landings_search_dentistry_relationships 
(origen_codigo_ine, origen_subcodigo_ine);

CREATE INDEX IF NOT EXISTS idx_rel_destino ON landings_search_dentistry_relationships 
(destino_codigo_ine, destino_subcodigo_ine);

-- 3. Índice para los textos
CREATE INDEX IF NOT EXISTS idx_sections_level ON search_dentistry_sections_by_level 
(nivel, subnivel);