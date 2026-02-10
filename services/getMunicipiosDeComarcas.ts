import { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS (Interfaces)
// ---------------------------------------------------------
export interface MunicipioDeComarcaConDatos {
  cod_municipio_de_comarca: string;
  nombre_municipio_de_comarca: string;
  slug_municipio_de_comarca: string | null;
  lat_municipio_de_comarca: number | null;
  lng_municipio_de_comarca: number | null;
  num_centros_municipio_de_comarca: number;
  num_dentistas_municipio_de_comarca: number;
}

export interface DashboardDataComarca2 {
  stats: {
    total_comarca_centros: number;
    total_comarca_dentistas: number;
  };
  listado: MunicipioDeComarcaConDatos[];
}

// ---------------------------------------------------------
// 2. LÓGICA DE NEGOCIO
// ---------------------------------------------------------

// Aceptamos el cliente "supabase" como parámetro
export const getDatosMunicipiosDeComarca = async (
  supabase: SupabaseClient, 
  codigo_ine_comarca: string 
): Promise<DashboardDataComarca2> => {


  
  // 1. PETICIÓN A BASE DE DATOS
  const { data, error } = await supabase
    .from('view_municipios_de_comarca_centros')
    .select('*')
    .eq('cod_comarca', codigo_ine_comarca);

  if (error) {
    console.error("Error fetching municipios:", error);
    return { 
      stats: { total_comarca_centros: 0, total_comarca_dentistas: 0 }, 
      listado: [] 
    };
  }

  // Conversión segura de tipos
  const municipios_de_comarca = data as MunicipioDeComarcaConDatos[];

  // 2. CÁLCULO DE TOTALES (En memoria)
  // Sumamos los valores individuales para obtener el total de la comarca
  const totalCentros = municipios_de_comarca.reduce((acc, curr) => acc + curr.num_centros_municipio_de_comarca, 0);
  const totalDentistas = municipios_de_comarca.reduce((acc, curr) => acc + curr.num_dentistas_municipio_de_comarca, 0);

  // 3. RETORNO DE DATOS
  return {
    stats: {
      total_comarca_centros: totalCentros,
      total_comarca_dentistas: totalDentistas,
    },
    listado: municipios_de_comarca,
  };
};