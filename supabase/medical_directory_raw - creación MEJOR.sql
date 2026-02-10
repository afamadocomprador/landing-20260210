-- 1. Habilitar extensión PostGIS (Obligatorio para location_gis)
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Útil para búsquedas sin tildes

-- 2. Limpieza (Solo si quieres reiniciar)
-- DROP TABLE IF EXISTS public.medical_directory_raw;

-- 3. CREACIÓN DE LA TABLA
CREATE TABLE public.medical_directory_raw (
  medical_directory_id text not null,
  
  -- Datos Profesionales
  speciality_cod integer null,
  speciality text null,
  online_appointment integer null,
  electronic_prescription integer null,
  virtual_consultation integer null,
  attention_type_id integer null,
  biller text null,
  company_cod integer null,
  networks text[] null,
  professional_id integer null,
  professional_nif text null,
  professional_name text null,
  professional_last_name_1 text null,
  professional_last_name_2 text null,
  professional_nick_name text null,
  professional_membership_number text null,
  professional_province integer null,
  professional_expert_in text null,
  professional_curriculum_vitae text null,
  professional_average_rating text null,
  
  -- Datos del Centro (SP)
  sp_id integer null,
  sp_preferential text null,
  sp_name text null,
  sp_last_name_1 text null,
  sp_last_name_2 text null,
  
  -- CORRECCIÓN: Teléfonos como TEXT (para prefijos y formatos)
  sp_customer_telephone_1 text null,
  sp_customer_telephone_2 text null,
  
  sp_email_1 text null,
  sp_email_2 text null,
  sp_schedule_1 text null,
  sp_schedule_2 text null,
  sp_web_site text null,
  sp_point_contact_id text null,
  sp_is_health_space integer null,
  sp_average_rating text null,
  sp_is_colaborator integer null,
  
  -- Ubicación
  nature_cod text null,
  nature text null,
  road_type text null,
  road text null,
  address_id integer null,
  address_cod integer null,
  address text null,
  town text null,     -- Dato sucio original
  province text null, -- Dato sucio original
  
  -- CORRECCIÓN: Código postal como TEXT (mantiene el '0' inicial: '01001')
  postal_code text null,
  
  latitude double precision null,
  longitude double precision null,
  location_gis geography(Point, 4326) null, -- Definición estricta geográfica
  
  -- Metadatos
  merge_order text null,
  weight_sorting integer null,
  combined_name text null,
  prescription_without_authorization integer null,
  is_center integer null,
  last_modified timestamp without time zone null,
  specialists_01 text null,
  specialists_02 text null,
  specialists_03 text null,
  specialists_04 text null,
  canonical integer null,
  ofuscate_document_id text null,

  -- NUEVAS COLUMNAS (Normalización INE)
  ine_province_code text null,      -- Ej: '50'
  ine_municipality_code text null,  -- Ej: '50297'

  CONSTRAINT medical_directory_raw_pkey PRIMARY KEY (medical_directory_id)
) TABLESPACE pg_default;


-- 4. SEGURIDAD (RLS - ROW LEVEL SECURITY)
-- ========================================================
ALTER TABLE public.medical_directory_raw ENABLE ROW LEVEL SECURITY;

-- POLÍTICA DE LECTURA: PÚBLICA
-- Permitimos que cualquiera (anon y autenticado) pueda leer para pintar el mapa.
CREATE POLICY "Public Read Access" 
ON public.medical_directory_raw 
FOR SELECT 
USING (true);

-- POLÍTICA DE ESCRITURA: DENEGADA IMPLÍCITAMENTE
-- Al no crear políticas de INSERT/UPDATE/DELETE para roles 'anon' o 'authenticated',
-- Supabase bloquea cualquier escritura desde el Frontend.

-- NOTA: Tu script 'route.ts' usa la SERVICE_ROLE_KEY, la cual es "Dios"
-- y se salta estas reglas automáticamente. Por eso funcionará tu carga.


-- 5. ÍNDICES DE RENDIMIENTO (Performance Tuning)
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_md_raw_postal_code ON public.medical_directory_raw(postal_code);
CREATE INDEX IF NOT EXISTS idx_md_raw_ine_prov ON public.medical_directory_raw(ine_province_code);
CREATE INDEX IF NOT EXISTS idx_md_raw_ine_muni ON public.medical_directory_raw(ine_municipality_code);
-- Índice espacial para búsquedas geográficas rápidas ("dentistas cerca de mí")
CREATE INDEX IF NOT EXISTS idx_md_raw_gis ON public.medical_directory_raw USING GIST (location_gis);