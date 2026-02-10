import { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS (Interfaces)
// ---------------------------------------------------------
export interface CentroConDatos {
  cod_municipio: string;
  nombre_centro: string;
  slug_centro: string;
  lat_centro: number | null;
  lng_centro: number | null;
  num_centros_centro: number;
  num_dentistas_centro: number;
}

export interface DashboardDataCentro {
  stats: {
    //total_centro_centros: number;
    //total_centro_dentistas: number;
    total_municipio_centros: number;
    total_municipio_dentistas: number;
  };
  listado: CentroConDatos[];
}

// ---------------------------------------------------------
// 2. LÓGICA DE NEGOCIO
// ---------------------------------------------------------

// Aceptamos el cliente "supabase" como parámetro
export const getDatosCentros = async (
  supabase: SupabaseClient, 
  codigo_ine_municipio: string 
): Promise<DashboardDataCentro> => {


  
  // 1. PETICIÓN A BASE DE DATOS
  const { data, error } = await supabase
    .from('view_centros_centros')
    .select('*')
    .eq('cod_municipio', codigo_ine_municipio);

  if (error) {
    console.error("Error fetching centros:", error);
    return { 
      //stats: { total_centro_centros: 0, total_centro_dentistas: 0 }, 
      stats: { total_municipio_centros: 0, total_municipio_dentistas: 0 }, 
      listado: [] 
    };
  }

  // Conversión segura de tipos
  const centros = data as CentroConDatos[];

  // 2. CÁLCULO DE TOTALES (En memoria)
  // Sumamos los valores individuales para obtener el total de la provincia
  const totalCentros = centros.reduce((acc, curr) => acc + curr.num_centros_centro, 0);
  const totalDentistas = centros.reduce((acc, curr) => acc + curr.num_dentistas_centro, 0);

  //console.log('totalCentros:',totalCentros);
  //console.log('totalDentistas:',totalDentistas);


  // 3. RETORNO DE DATOS
  return {
    stats: {
      total_municipio_centros: totalCentros,
      total_municipio_dentistas: totalDentistas,
    },
    listado: centros,
  };
};