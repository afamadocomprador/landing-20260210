import { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS (Interfaces)
// ---------------------------------------------------------
export interface HubConDatos {
  codigo_ine_municipio: string;
  codigo_hub: string;
  nombre_hub: string;
  slug_hub: string | null;
  lat_hub: number | null;
  lng_hub: number | null;
  num_centros_hub: number;
  num_dentistas_hub: number;
}

export interface DashboardDataMunicipio {
  stats: {
    total_municipio_centros: number;
    total_municipio_dentistas: number;
  };
  listado: HubConDatos[];
}

// ---------------------------------------------------------
// 2. LÓGICA DE NEGOCIO
// ---------------------------------------------------------

// Aceptamos el cliente "supabase" como parámetro
export const getDatosHubs = async (
  supabase: SupabaseClient, 
  codigo_ine_municipio: string 
): Promise<DashboardDataMunicipio> => {


  
  // 1. PETICIÓN A BASE DE DATOS
  const { data, error } = await supabase
    .from('view_hubs_centros')
    .select('*')
    .eq('codigo_ine_municipio', codigo_ine_municipio);

  if (error) {
    console.error("Error fetching hubs:", error);
    return { 
      stats: { total_municipio_centros: 0, total_municipio_dentistas: 0 }, 
      listado: [] 
    };
  }

  // Conversión segura de tipos
  const hubs = data as HubConDatos[];

  // 2. CÁLCULO DE TOTALES (En memoria)
  // Sumamos los valores individuales para obtener el total del municipio
  const totalCentros = hubs.reduce((acc, curr) => acc + curr.num_centros_hub, 0);
  const totalDentistas = hubs.reduce((acc, curr) => acc + curr.num_dentistas_hub, 0);

  // 3. RETORNO DE DATOS
  return {
    stats: {
      total_municipio_centros: totalCentros,
      total_municipio_dentistas: totalDentistas,
    },
    listado: hubs,
  };
};