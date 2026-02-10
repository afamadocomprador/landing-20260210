import { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS (Interfaces)
// ---------------------------------------------------------
export interface ProvinciaConDatos {
  cod_provincia: string;
  nombre_provincia: string;
  slug_provincia: string | null;
  lat_provincia: number | null;
  lng_provincia: number | null;
  num_centros_provincia: number;
  num_dentistas_provincia: number;
}

export interface DashboardDataComunidad {
  stats: {
    total_comunidad_centros: number;
    total_comunidad_dentistas: number;
  };
  listado: ProvinciaConDatos[];
}

// ---------------------------------------------------------
// 2. LÓGICA DE NEGOCIO
// ---------------------------------------------------------

// Aceptamos el cliente "supabase" como parámetro
export const getDatosProvincias = async (
  supabase: SupabaseClient, 
  codigo_ine_comunidad: string 
): Promise<DashboardDataComunidad> => {


  
  // 1. PETICIÓN A BASE DE DATOS
  const { data, error } = await supabase
    .from('view_provincias_centros')
    .select('*')
    .eq('cod_comunidad', codigo_ine_comunidad);

  if (error) {
    console.error("Error fetching provincias:", error);
    return { 
      stats: { total_comunidad_centros: 0, total_comunidad_dentistas: 0 }, 
      listado: [] 
    };
  }

  // Conversión segura de tipos
  const provincias = data as ProvinciaConDatos[];

  // 2. CÁLCULO DE TOTALES (En memoria)
  // Sumamos los valores individuales para obtener el total de la comunidad
  const totalCentros = provincias.reduce((acc, curr) => acc + curr.num_centros_provincia, 0);
  const totalDentistas = provincias.reduce((acc, curr) => acc + curr.num_dentistas_provincia, 0);

  // 3. RETORNO DE DATOS
  return {
    stats: {
      total_comunidad_centros: totalCentros,
      total_comunidad_dentistas: totalDentistas,
    },
    listado: provincias,
  };
};