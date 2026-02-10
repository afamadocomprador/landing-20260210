-- ==============================================================================
-- 1. TABLA: localizaciones_seo (El Cerebro)
-- Define la arquitectura de URLs y la estrategia de contenido por Tier.
-- ==============================================================================

DROP TABLE IF EXISTS localizaciones_seo CASCADE;

CREATE TABLE localizaciones_seo (
    slug TEXT PRIMARY KEY,
    parent_slug TEXT REFERENCES localizaciones_seo(slug) ON DELETE SET NULL,
    
    -- Datos de Negocio
    nombre_visible TEXT NOT NULL,     -- Ej: "Madrid Norte: Tetuán y Chamberí"
    query_filter TEXT NOT NULL,       -- WHERE clause para filtrar dentistas (Ej: town = 'Madrid' AND cp IN ('28001'))
    tier_classification TEXT CHECK (tier_classification IN ('tier1.a', 'tier2', 'tier3')),
    
    -- Datos SEO On-Page
    seo_title TEXT NOT NULL,          -- <title> optimizado
    h1_hero TEXT NOT NULL,            -- Título visible en la página
    copy_contextual TEXT NOT NULL,    -- Texto E-E-A-T sobre la zona
    
    -- Nuevos campos solicitados
    h1 TEXT,
    h2a TEXT,
    h2b TEXT,
    contenido1 TEXT,
    contenido2 TEXT,
    breadcrumb TEXT,
    nivel TEXT CHECK (nivel IN ('1', '2', '3', '4', '5', '6', '7')),
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Seguridad RLS para localizaciones_seo
ALTER TABLE localizaciones_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de SEO" 
ON localizaciones_seo FOR SELECT 
USING (true);

-- ==============================================================================
-- 2. ÍNDICES DE RENDIMIENTO
-- ==============================================================================
CREATE INDEX idx_seo_parent ON localizaciones_seo(parent_slug);
CREATE INDEX idx_seo_tier ON localizaciones_seo(tier_classification);

-- ==============================================================================
-- 3. INSERCIÓN DE DATOS
-- ==============================================================================

INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'barcelona', NULL, 'Barcelona Ciudad', 'province ILIKE ''Barcelona'' AND town ILIKE ''Barcelona''', 'tier1.a', 
    'Dentistas en Barcelona: Precios Pactados DKV y Red Propia | Bernardo Sobrecasas', 'TU DENTISTA EN BARCELONA CIUDAD', 'Cobertura total en los 10 distritos y 73 barrios de Barcelona. Acceso a la red de Espacios de Salud DKV (Gran Via, Urgell, Meridiana) y clínicas de referencia.', '2026-01-26 19:32:54.138449+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'granada', NULL, 'Granada Capital', 'province ILIKE ''Granada'' AND town ILIKE ''Granada''', 'tier1.a', 
    'Dentistas en Granada: Precios Pactados DKV y Red Propia | Bernardo Sobrecasas', 'TU DENTISTA EN GRANADA CAPITAL', 'Cobertura integral en los 8 distritos y 36 barrios de Granada. Acceso a clínicas de referencia en el eje de Gran Vía, Camino de Ronda y Zaidín.', '2026-01-26 19:39:48.907154+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'granada-centro-realejo-norte', 'granada', 'Granada Centro y Norte', 'postal_code IN (''18001'', ''18002'', ''18005'', ''18009'', ''18010'', ''18011'', ''18012'', ''18013'', ''18182'')', 'tier1.a', 
    'Dentistas en Granada Centro y Realejo: Calidad DKV | B. Sobrecasas', 'TU DENTISTA EN EL CENTRO DE GRANADA Y REALEJO', 'Atención especializada en el corazón histórico, desde la Catedral hasta los Jardines del Triunfo. Clínicas accesibles y de confianza.', '2026-01-26 19:39:48.907154+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'granada-ronda-zaidin-chana', 'granada', 'Granada Ronda, Zaidín y Chana', 'postal_code IN (''18003'', ''18004'', ''18006'', ''18007'', ''18008'', ''18014'', ''18015'')', 'tier1.a', 
    'Dentista en Zaidín, Ronda y Chana: Ahorro Familiar | DKV', 'TU DENTISTA EN GRANADA SUR (ZAIDÍN - RONDA)', 'Red dental potente en los barrios más poblados. Desde el Parque de las Ciencias hasta la Chana, precios pactados para familias y estudiantes.', '2026-01-26 19:39:48.907154+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'madrid', NULL, 'Madrid Capital', 'province ILIKE ''Madrid'' AND town ILIKE ''Madrid''', 'tier1.a', 
    'Dentistas en Madrid: Precios Pactados y Red Propia', 'TU DENTISTA EN MADRID CAPITAL', 'Accede a la mayor red de salud dental de España con 21 distritos cubiertos y el Espacio de Salud Dental DKV de Príncipe de Vergara como referencia tecnológica.', '2026-01-20 11:27:37.868987+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'madrid-chamartin-hortaleza-moncloa', 'madrid', 'Chamartín, Hortaleza y Moncloa', 'postal_code IN (''28002'', ''28008'', ''28016'', ''28020'', ''28023'', ''28029'', ''28034'', ''28035'', ''28036'', ''28039'', ''28040'', ''28046'', ''28048'', ''28049'', ''28054'', ''28017'', ''28022'', ''28027'', ''28033'', ''28037'', ''28042'', ''28043'', ''28050'', ''28055'')', 'tier1.a', 
    'Dentista en Chamartín, Hortaleza y Moncloal: Red Abierta', 'TU DENTISTA EN CHAMARTIN, HORTALEZA Y MONCLOA', 'Cobertura total en el Arco Norte: Desde Aravaca y Puerta de Hierro hasta Chamartín y Hortaleza. Clínicas de confianza en áreas residenciales y financieras.', '2026-01-20 11:27:37.868987+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'madrid-vallecas-moratalaz', 'madrid', 'Vallecas y Moratalaz', 'postal_code IN (28018, 28030, 28031, 28032, 28038, 28051, 28052, 28053)', 'tier1.a', 
    'Dentista en Vallecas y Moratalaz: Ahorro Familiar', 'TU DENTISTA EN VALLECAS Y MORATALAZ', 'Centros de referencia en el eje de Vallecas. Atención cercana desde Portazgo hasta el Casco Histórico de Villa de Vallecas.', '2026-01-20 11:27:37.868987+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'madrid-carabanchel-latina-usera', 'madrid', 'Carabanchel, Latina y Usera', 'postal_code IN (''28011'', ''28019'', ''28021'', ''28024'', ''28025'', ''28026'', ''28041'', ''28044'', ''28047'')', 'tier1.a', 
    'Dentista en Carabanchel, Latina y Usera - Ortodoncia y Familia ', 'TU DENTISTA EN CARABANCHEL, LATINA Y USERA', 'Líderes en el Sur de Madrid: Cobertura total en Carabanchel, Latina y Villaverde. Incluye el Instituto Médico Odontológico en Usera. Calidad y cercanía.', '2026-01-20 11:27:37.868987+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'madrid-centro-salamanca-chamberi', 'madrid', 'Madrid Centro, Salamanca y Chamberí', 'postal_code IN (''28001'', ''28003'', ''28004'', ''28005'', ''28006'', ''28007'', ''28009'', ''28010'', ''28012'', ''28013'', ''28014'', ''28015'', ''28028'', ''28045'')', 'tier1.a', 
    'Dentistas en Madrid Centro, Salamanca y Chamberí: Implantes y Estética', 'TU DENTISTA EN CENTRO, SALAMANCA Y CHAMBERI', 'Liderada por el Espacio de Salud DKV en Salamanca (Príncipe de Vergara) y centros de diagnóstico avanzado en Chamberí. Tu red premium entre Retiro y Argüelles.', '2026-01-20 11:27:37.868987+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'barcelona-eixample-gracia-sagrada-familia', 'barcelona', 'Eixample, Gràcia y Centro', 'postal_code IN (08001, 08002, 08003, 08004, 08007, 08008, 08009, 08010, 08011, 08012, 08013, 08015, 08023, 08024, 08025, 08036, 08037)', 'tier1.a', 
    'Dentistas en Eixample, Gràcia y Centro', 'TU DENTISTA EN BARCELONA CENTRO, EIXAMPLE Y GRACIA', 'Centros en los ejes vitales de Barcelona, conectando el Barrio Gótico y Gran Via con la zona médica de Gràcia y Quirónsalud. Cobertura desde Plaça Catalunya hasta el entorno de Sagrada Família y Sant Antoni, ofreciéndote especialistas de primer nivel en el corazón de la ciudad.', '2026-01-26 19:32:54.138449+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'barcelona-sants-montjuic-poble-sec', 'barcelona', 'Sants y Montjuïc', 'postal_code IN (08004, 08014, 08028, 08038)', 'tier1.a', 
    'Dentista en Sants y Montjuïc', 'TU DENTISTA EN SANTS Y MONTJUIC', 'Localiza tu dentista en el histórico eje comercial de Sants y Hostafrancs, con consultas situadas estratégicamente cerca de Carrer de Badal y Plaça d''Espanya. Ofrecemos atención bucodental de proximidad conectada con la Estación de Sants, cubriendo desde La Bordeta hasta el límite con Les Corts.', '2026-01-26 19:32:54.138449+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'barcelona-sarria-sant-gervasi-les-corts', 'barcelona', 'Sarrià, Sant Gervasi y Les Corts', 'postal_code IN (08006, 08014, 08017, 08021, 08022, 08023, 08028, 08029, 08034)', 'tier1.a', 
    'Dentista en Sarrià, Sant Gervasi y Les Corts: Proximidad', 'TU DENTISTA EN LOS BARRIOS DE BARCELONA (SARRIA, SANT GERVASI Y LES CORTS)', 'Ubica tu clínica ideal en los ejes exclusivos de Muntaner, Bonanova y Via Augusta, o accede a servicios dentales en Les Corts conectando con Sants-Badal. Nuestra red abarca desde zonas residenciales como Tres Torres y el Putxet hasta áreas estratégicas cerca de la Diagonal y Hostafrancs.', '2026-01-26 19:32:54.138449+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'barcelona-poblenou-sant-marti-diagonal-mar', 'barcelona', 'Poblenou y Sant Martí', 'postal_code IN (08005, 08018, 08019, 08020)', 'tier1.a', 
    'Dentistas en Poblenou y Sant Martí', 'TU DENTISTA EN POBLENOU Y SANT MARTI', 'Cuida tu sonrisa con nuestra red en el distrito marítimo, abarcando desde la exclusiva Vila Olímpica hasta el núcleo de Sant Martí y La Verneda. Disponemos de ubicaciones clave en Rambla de Guipúscoa y el histórico barrio del Clot, ofreciendo cobertura dental completa cerca del litoral y el eje de Gran Via', '2026-01-28 13:03:11.43432+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
INSERT INTO localizaciones_seo (
    slug, parent_slug, nombre_visible, query_filter, tier_classification, 
    seo_title, h1_hero, copy_contextual, created_at,
    h1, h2a, h2b, contenido1, contenido2, breadcrumb, nivel
) VALUES (
    'barcelona-sant-andreu-horta-nou-barris', 'barcelona', 'Sant Andreu, Horta y Nou Barris', 'postal_code IN (08016, 08027, 08030, 08031, 08032, 08033, 08035, 08041, 08042)', 'tier1.a', 
    'Dentista en Sant Andreu, Horta y Nou Barris', 'TU DENTISTA EN Sant Andreu, Horta y Nou Barris', 'Tu centro dental en el eje de Avinguda Meridiana y La Sagrera, conectando con el barrio del Guinardó. Ofrecemos atención especializada en el corazón de Nou Barris, cerca de la comercial Via Júlia, garantizando servicios de odontología de proximidad en toda la zona norte de Barcelona.', '2026-01-26 19:32:54.138449+00',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
