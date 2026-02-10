// Ya tenías esta:
export interface Clinic {
/*
  clinic_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  zip_code: string | null;
  phone: string | null;
  staff_count: number;
  specialties: string[];
*/

// Identificadores
  clinic_id: string;
  
  // Datos Principales
  name: string;
  latitude: number;
  longitude: number;
  
  // Dirección y Ubicación
  address: string | null;
  city: string | null;
  province: string | null;
  zip_code: string | null;
  
  // Códigos INE (Importantes para el filtrado)
  ine_city_code: string | null;
  ine_province_code: string | null;
  ine_comarca_code: string | null; // <--- NUEVO (Vital para nivel 06)
  
  // Datos de Contacto y Estado
  phone: string | null;
  is_propio: boolean; // <--- NUEVO
  
  // Datos de Negocio
  staff_count: number;
  specialties: string[] | null;
  
  // Ahora la vista "view_clinics_con_dentistas" devuelve esto directamente
  staff_names?: string[] | null;

}

// AÑADE ESTA NUEVA:
export interface Professional {
  clinic_id: string;      // Para filtrar: .eq('clinic_id', clinic.clinic_id)
  full_name: string;
  license_number: string | null;
  specialties: string[];  // Ej: ["Ortodoncia", "Implantología"]
}

export interface LandingSearchDentistry {
  codigo_ine: string;
  subcodigo_ine: string;
  nivel: string;
  subnivel: string;
  nombre_ine: string; // Ej: "Madrid"
  breadcrumb: string | null; // Ej: "España > Madrid"
  slug: string; // Ej: "dentistas/madrid"
  query_filter: string | null; // Ej: "province='Madrid'" (Lo parsearemos)
  latitud_gps: number | null;
  longitud_gps: number | null;
  poblacion: number | null;
}

// Tabla de Relaciones (Interlinking)
export interface LandingRelationship {
  origen_codigo_ine: string;
  origen_subcodigo_ine: string;
  destino_codigo_ine: string;
  destino_subcodigo_ine: string;
  tipo_relacion: string | null;
  // Propiedad extendida para el join con la tabla destino
  destination?: {
    slug: string;
    nombre_ine: string;
  };
}

// Tabla de Secciones de Texto (H2 y Párrafos)
export interface SectionByLevel {
  nivel: string;
  subnivel: string;
  seccion_cod: string; // Título o Identificador
  situacion: number;   // Orden
  seccion_cont: string | null; // El contenido con variables {{Variable}}
  seccion_int: string | null;
}



export interface ProfessionalEnriched {
  // --- 1. Relación (Hash MD5) ---
  clinic_id: string;        // El ID generado por md5(concat(...))

  // --- 2. Datos del Doctor (Mapeados de tu SELECT) ---
  full_name: string;        // professional_name
  license_number: string | null; // professional_membership_number
  
  /**
   * Especialidades: Al ser un array_agg en Postgres, 
   * Supabase lo entrega como un array de strings en JS.
   */
  specialties: string[]; 

  // --- 3. Datos de la Clínica (Enriquecidos por el JOIN) ---
  province: string;  // c.province
  clinic_town: string;      // c.city
  clinic_zip: string;       // c.zip_code
  clinic_is_propio: boolean; // c.is_propio
}




  /**
   * Estas dos responden a la vista view_comunidades_centros
   * Supabase lo entrega como un array de strings en JS.
   */

export interface ComunidadConDatos {
  cod_comunidad: string;
  nombre_comunidad: string;
  slug_comunidad: string | null;
  lat_comunidad: number | null;
  lng_comunidad: number | null;
  num_centros_comunidad: number;
  num_dentistas_comunidad: number;
}

export interface DashboardData {
  stats: {
    total_espana_centros: number;
    total_espana_dentistas: number;
  };
  listado: ComunidadConDatos[];
}