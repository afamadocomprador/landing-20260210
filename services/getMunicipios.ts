import { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS (Interfaces)
// ---------------------------------------------------------
export interface MunicipioConDatos {
  cod_municipio: string;
  nombre_municipio: string;
  slug_municipio: string | null;
  lat_municipio: number | null;
  lng_municipio: number | null;
  num_centros_municipio: number;
  num_dentistas_municipio: number;
}

export interface DashboardDataProvincia {
  stats: {
    total_provincia_centros: number;
    total_provincia_dentistas: number;
  };
  listado: MunicipioConDatos[];
}

// ---------------------------------------------------------
// 2. LÓGICA DE NEGOCIO
// ---------------------------------------------------------

// Aceptamos el cliente "supabase" como parámetro
export const getDatosMunicipios = async (
  supabase: SupabaseClient, 
  codigo_ine_provincia: string 
): Promise<DashboardDataProvincia> => {


  
  // 1. PETICIÓN A BASE DE DATOS
  const { data, error } = await supabase
    .from('view_municipios_centros')
    .select('*')
    .eq('cod_provincia', codigo_ine_provincia);

  if (error) {
    console.error("Error fetching municipios:", error);
    return { 
      stats: { total_provincia_centros: 0, total_provincia_dentistas: 0 }, 
      listado: [] 
    };
  }

  // Conversión segura de tipos
  const municipios = data as MunicipioConDatos[];

  // 2. CÁLCULO DE TOTALES (En memoria)
  // Sumamos los valores individuales para obtener el total de la provincia
  const totalCentros = municipios.reduce((acc, curr) => acc + curr.num_centros_municipio, 0);
  const totalDentistas = municipios.reduce((acc, curr) => acc + curr.num_dentistas_municipio, 0);

  // 3. RETORNO DE DATOS
  return {
    stats: {
      total_provincia_centros: totalCentros,
      total_provincia_dentistas: totalDentistas,
    },
    listado: municipios,
  };
};