import { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS (Interfaces)
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 2. LÓGICA DE NEGOCIO
// ---------------------------------------------------------

// Aceptamos el cliente "supabase" como parámetro
export const getDatosComunidades = async (supabase: SupabaseClient): Promise<DashboardData> => {
  
  // 1. PETICIÓN A BASE DE DATOS
  const { data, error } = await supabase
    .from('view_comunidades_centros')
    .select('*')
    .order('nombre_comunidad', { ascending: true });

  if (error) {
    console.error("Error fetching comunidades:", error);
    return { 
      stats: { total_espana_centros: 0, total_espana_dentistas: 0 }, 
      listado: [] 
    };
  }

  // Conversión segura de tipos
  const comunidades = data as ComunidadConDatos[];

  // 2. CÁLCULO DE TOTALES (En memoria)
  // Sumamos los valores individuales para obtener el total nacional
  const totalCentros = comunidades.reduce((acc, curr) => acc + curr.num_centros_comunidad, 0);
  const totalDentistas = comunidades.reduce((acc, curr) => acc + curr.num_dentistas_comunidad, 0);

  // 3. RETORNO DE DATOS
  return {
    stats: {
      total_espana_centros: totalCentros,
      total_espana_dentistas: totalDentistas,
    },
    listado: comunidades,
  };
};