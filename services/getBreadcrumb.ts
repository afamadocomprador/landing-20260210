import { SupabaseClient } from '@supabase/supabase-js';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Genera el breadcrumb completo recorriendo la jerarquía hacia atrás.
 * Utiliza las tablas relacionales (ine_*) para encontrar los códigos padres
 * y luego hidrata los textos y slugs desde la tabla de landings.
 */
export const getBreadcrumbTrail = async (
  supabase: SupabaseClient,
  nivel: string,
  codigoIne: string
): Promise<BreadcrumbItem[]> => {

  // 1. LISTA DE CÓDIGOS A BUSCAR
  // Empezamos incluyendo el código de la ubicación actual (o su padre directo).
  let codigosA_Buscar: string[] = [codigoIne];

  // --------------------------------------------------------------------------------
  // LÓGICA DE PADRES (Recursividad jerárquica)
  // Dependiendo del nivel, buscamos a los antepasados en las tablas INE
  // --------------------------------------------------------------------------------

  // --- NIVEL 02: COMUNIDAD AUTÓNOMA ---
  if (nivel === "02") {
    // Las landings usan "CA-01", pero la tabla ine_comunidades usa "01". Limpiamos.
    const cleanCode = codigoIne.replace('CA-', '');

    const { data: com } = await supabase
      .from('ine_comunidades')
      .select('pais_codigo') 
      .eq('codigo', cleanCode) 
      .single();
      
    if (com?.pais_codigo) codigosA_Buscar.push(com.pais_codigo); // Añade '00'
  } 
  
  // --- NIVEL 03: PROVINCIA ---
  else if (nivel === "03") {
    const { data: prov } = await supabase
      .from('ine_provincias')
      .select('comunidad_codigo')
      .eq('codigo', codigoIne)
      .single();
    
    if (prov) {
        const codComunidadLandings = `CA-${prov.comunidad_codigo}`; 
        codigosA_Buscar.push(codComunidadLandings); 

        const { data: com } = await supabase
            .from('ine_comunidades')
            .select('pais_codigo')
            .eq('codigo', prov.comunidad_codigo) 
            .single();
        
        if (com?.pais_codigo) codigosA_Buscar.push(com.pais_codigo);
    }
  } 
  
  // --- NIVEL 04 (MUNICIPIO) Y NIVEL 05 (DISTRITO/HUB) ---
  // La lógica de ancestros es idéntica: El padre es la Provincia.
  // En Nivel 05, el 'codigoIne' de entrada es el del Municipio (ej: 28079),
  // por lo que ya está en la lista y solo necesitamos subir hacia Provincia.
  else if (nivel === "04" || nivel === "05") {
    
    // 1. Obtenemos PROVINCIA (Los 2 primeros dígitos del municipio)
    const codProvincia = codigoIne.substring(0, 2); 
    codigosA_Buscar.push(codProvincia);
    
    // 2. Buscamos la COMUNIDAD de esa Provincia
    const { data: prov } = await supabase
      .from('ine_provincias')
      .select('comunidad_codigo')
      .eq('codigo', codProvincia)
      .single();

    if (prov) {
        const codComunidadLandings = `CA-${prov.comunidad_codigo}`;
        codigosA_Buscar.push(codComunidadLandings);

        // 3. Buscamos el PAÍS de esa Comunidad
        const { data: com } = await supabase
            .from('ine_comunidades')
            .select('pais_codigo')
            .eq('codigo', prov.comunidad_codigo)
            .single();

        if (com?.pais_codigo) codigosA_Buscar.push(com.pais_codigo);
    }
  }

  // --- NIVEL 06: COMARCA (Opcional) ---
  else if (nivel === "06") {
     const { data: comarca } = await supabase.from('ine_comarcas').select('provincia_codigo').eq('codigo', codigoIne).single();
     if(comarca) {
        codigosA_Buscar.push(comarca.provincia_codigo); // + Provincia
        const { data: prov } = await supabase.from('ine_provincias').select('comunidad_codigo').eq('codigo', comarca.provincia_codigo).single();
        if(prov) {
           codigosA_Buscar.push(`CA-${prov.comunidad_codigo}`); // + Comunidad
           const { data: com } = await supabase.from('ine_comunidades').select('pais_codigo').eq('codigo', prov.comunidad_codigo).single();
           if(com?.pais_codigo) codigosA_Buscar.push(com.pais_codigo); // + País
        }
     }
  }


  // --------------------------------------------------------------------------------
  // 2. HIDRATACIÓN (Consulta única a DB)
  // --------------------------------------------------------------------------------
  // IMPORTANTE: Solicitamos también 'subcodigo_ine' para poder filtrar.
  const { data: landings } = await supabase
    .from('landings_search_dentistry')
    .select('codigo_ine, subcodigo_ine, breadcrumb, slug, nivel')
    .in('codigo_ine', codigosA_Buscar);

  if (!landings || landings.length === 0) return [];


  // --------------------------------------------------------------------------------
  // 3. CONSTRUCCIÓN Y FILTRADO
  // --------------------------------------------------------------------------------
  
  // CORRECCIÓN CLAVE:
  // Filtramos los resultados para evitar duplicados o "hermanos".
  // Si pedimos breadcrumb para un Hub (05), la query por 'codigo_ine' (28079) devuelve:
  // 1. El Municipio (28079) -> Lo queremos (Nivel 04).
  // 2. TODOS los Hubs (28079) -> No los queremos aquí (Nivel 05).
  // El Hub actual se suele pintar en el componente final, no como link padre.
  
  const landingsFiltradas = landings.filter(l => {
      // Si el elemento recuperado es un Hub (05), lo excluimos del trail automático
      // para evitar que salgan todos los distritos en la barra.
      if (l.nivel === '05') return false;
      return true;
  });

  // Ordenamos por nivel numérico ascendente:
  // 01 (País) -> 02 (Comunidad) -> 03 (Provincia) -> 04 (Municipio)
  const sortedLandings = landingsFiltradas.sort((a, b) => a.nivel.localeCompare(b.nivel));

  const trail: BreadcrumbItem[] = [];

  sortedLandings.forEach(l => {
    let href = "";

    // Lógica de generación de URLs SEO
    if (l.nivel === '01') { 
        href = "/dentistas"; 
    } 
    else if (l.nivel === '03') {
        href = `/dentistas/${l.slug}-provincia`;
    } 
    else {
        href = `/dentistas/${l.slug}`;
    }

    trail.push({
      label: l.breadcrumb || "Ubicación",
      href: href
    });
  });

  return trail;
};