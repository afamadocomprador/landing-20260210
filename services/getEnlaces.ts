import { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// 1. DEFINICIÓN DE TIPOS
// =============================================================================

export interface LinkSection {
  title: string;
  items: LinkItem[];
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface RelatedLinksData {
  madre: LinkSection | null;
  cercanas: LinkSection | null;
  hermanas: LinkSection | null;
  comarcas: LinkSection | null; 
  hijas: LinkSection | null; 
  comarcas_sin_dentistas: LinkSection | null; 
}

// =============================================================================
// 2. MATRICES DE ADYACENCIA & HELPERS
// =============================================================================

const CCAA_NEIGHBORS: Record<string, string[]> = {
  '01': ['08', '14', '12', '05'], 
  '02': ['09', '10', '08', '07', '17', '15'], 
  '03_ccaa': ['06', '07', '11'], 
  '04': [], '05': [], 
  '06': ['16', '07', '03'], 
  '07': ['06', '16', '17', '02', '08', '13', '12', '11', '03'], 
  '08': ['07', '02', '10', '14', '01', '12', '13'], 
  '09': ['02', '10'], 
  '10': ['09', '02', '08', '14'], 
  '11': ['03', '07'], 
  '12': ['07', '08', '01'], 
  '13': ['07', '08'], 
  '14': ['10', '08', '01'], 
  '15': ['16', '02', '17'], 
  '16': ['06', '15', '17', '07'], 
  '17': ['16', '15', '02', '07'], 
};

const PROVINCIAS_NEIGHBORS: Record<string, string[]> = {
  '50': ['22', '25', '43', '44', '19', '42', '26', '31'],
  '22': ['25', '50', '31'],
  '44': ['50', '43', '12', '46', '16', '19'],
  '19': ['42', '50', '44', '16', '28', '40'],
  '31': ['20', '22', '50', '26', '01'],
  '25': ['22', '50', '43', '08', '17'],
  '43': ['25', '08', '12', '44', '50'],
  '42': ['26', '50', '19', '40', '09'],
  '26': ['31', '50', '42', '09', '01'],
  '28': ['40', '19', '16', '45', '05'],
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999999;
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

const getOrderedNeighbors = (allCandidates: any[], manualCodes: string[], idField: string) => {
  if (!manualCodes || manualCodes.length === 0) return [];
  return manualCodes
    .map(code => allCandidates.find(item => {
        const itemCode = String(item[idField]);
        const targetCode = String(code);
        return itemCode === targetCode || itemCode === `CA-${targetCode}` || itemCode.replace('CA-', '') === targetCode;
    }))
    .filter(item => item !== undefined); 
};

// =============================================================================
// 3. FUNCIÓN PRINCIPAL
// =============================================================================

export const getRelatedLinks = async (
  supabase: SupabaseClient,
  landing: { 
    nivel: string; 
    subnivel?: string; // Opcional, pero vital para Hubs
    codigo_ine: string; 
    latitude: number; 
    longitude: number; 
    nombre: string; 
  }
): Promise<RelatedLinksData> => {
  
  // Debug (opcional, puedes quitarlo en producción)
  // console.log(`[getRelatedLinks] Nivel: ${landing.nivel} | Subnivel: ${landing.subnivel} | INE: ${landing.codigo_ine}`);

  const results: RelatedLinksData = { 
      madre: null, cercanas: null, hermanas: null, 
      comarcas: null, hijas: null, comarcas_sin_dentistas: null 
  };
  
  const hasCoords = landing.latitude && landing.longitude;

  const fetchByLevel = async (lvl: string) => 
    supabase
      .from('landings_search_dentistry')
      .select('breadcrumb, slug, latitude:latitud_gps, longitude:longitud_gps, codigo_ine, poblacion')
      .eq('nivel', lvl)
      .order('breadcrumb', { ascending: true });
  

  // =================================================================================================
  // NIVEL 01: ESPAÑA
  // =================================================================================================
  if (landing.nivel === '01') {
    const { data: comunidades } = await fetchByLevel('02');
    if (comunidades && comunidades.length > 0) {
      results.hijas = {
        title: "Buscar dentistas en comunidades y ciudades autónomas",
        items: comunidades.map(c => ({ label: c.breadcrumb, href: `/dentistas/${c.slug}` }))
      };
    }
  }

  // =================================================================================================
  // NIVEL 02: COMUNIDAD AUTÓNOMA
  // =================================================================================================
  else if (landing.nivel === '02') {
    results.madre = { title: `Volver a buscar dentistas en España`, items: [{ label: "España", href: "/dentistas" }] };
    
    const { data: allComunidades } = await fetchByLevel('02');
    
    if (allComunidades) {
      const others = allComunidades.filter(c => c.codigo_ine !== landing.codigo_ine);
      const cleanCode = landing.codigo_ine.replace('CA-', '');
      const lookupCode = cleanCode === '03' ? '03_ccaa' : cleanCode;
      const neighborCodes = CCAA_NEIGHBORS[lookupCode] || [];
      
      let limitrofes = getOrderedNeighbors(others, neighborCodes, 'codigo_ine');
      if (limitrofes.length === 0 && hasCoords && neighborCodes.length === 0) {
        limitrofes = [...others].sort((a,b) => getDistance(landing.latitude, landing.longitude, a.latitude, a.longitude) - getDistance(landing.latitude, landing.longitude, b.latitude, b.longitude)).slice(0, 4);
      }

      if (limitrofes.length > 0) {
        results.cercanas = { title: `Buscar dentistas en comunidades limítrofes a ${landing.nombre}`, items: limitrofes.map((c: any) => ({ label: c.breadcrumb, href: `/dentistas/${c.slug}` })) };
      }
      results.hermanas = { title: `Buscar dentistas en otras comunidades`, items: others.map(c => ({ label: c.breadcrumb, href: `/dentistas/${c.slug}` })) };
    }

    const cleanCode = landing.codigo_ine.replace('CA-', '');
    const { data: provs } = await supabase.from('ine_provincias').select('codigo').eq('comunidad_codigo', cleanCode);
    if (provs && provs.length > 0) {
      const { data: provinciasLanding } = await supabase
        .from('landings_search_dentistry')
        .select('breadcrumb, slug')
        .in('codigo_ine', provs.map(p => p.codigo))
        .eq('nivel', '03')
        .order('breadcrumb', { ascending: true });

      if (provinciasLanding) {
        results.hijas = { title: `Buscar dentistas en las provincias de ${landing.nombre}`, items: provinciasLanding.map(p => ({ label: p.breadcrumb, href: `/dentistas/${p.slug}-provincia` })) };
      }
    }
  }

  // =================================================================================================
  // NIVEL 03: PROVINCIA
  // =================================================================================================
  else if (landing.nivel === '03') {
    const { data: ineProv } = await supabase.from('ine_provincias').select('comunidad_codigo').eq('codigo', landing.codigo_ine).single();
    let nombreComunidad = "la comunidad";
    let slugComunidad = "";
    if (ineProv) {
       const { data: landingCom } = await supabase.from('landings_search_dentistry').select('breadcrumb, slug').eq('codigo_ine', `CA-${ineProv.comunidad_codigo}`).eq('nivel','02').single();
       if (landingCom) { nombreComunidad = landingCom.breadcrumb; slugComunidad = landingCom.slug; }
    }
    
    results.madre = { title: `Volver a buscar dentistas en ${nombreComunidad}`, items: slugComunidad ? [{ label: nombreComunidad, href: `/dentistas/${slugComunidad}` }] : [] };

    const { data: allProvs } = await fetchByLevel('03');
    
    // CERCANAS
    if (allProvs) {
       const neighborCodes = PROVINCIAS_NEIGHBORS[landing.codigo_ine];
       let limitrofes = (neighborCodes && neighborCodes.length > 0) ? getOrderedNeighbors(allProvs, neighborCodes, 'codigo_ine') : [];
       
       if (limitrofes.length === 0 && hasCoords) {
           limitrofes = allProvs.filter(p => p.codigo_ine !== landing.codigo_ine).sort((a,b) => getDistance(landing.latitude, landing.longitude, a.latitude, a.longitude) - getDistance(landing.latitude, landing.longitude, b.latitude, b.longitude)).slice(0, 6);
       }
       if (limitrofes.length > 0) {
          results.cercanas = { title: `Buscar dentistas en provincias limítrofes a ${landing.nombre}`, items: limitrofes.map(p => ({ label: p.breadcrumb, href: `/dentistas/${p.slug}-provincia` })) };
       }
    }

    // HERMANAS
    if (ineProv && allProvs) {
      const { data: provsHermanas } = await supabase.from('ine_provincias').select('codigo').eq('comunidad_codigo', ineProv.comunidad_codigo);
      const codes = provsHermanas?.map(p => p.codigo) || [];
      const hermanas = allProvs.filter(p => codes.includes(p.codigo_ine) && p.codigo_ine !== landing.codigo_ine);
      if (hermanas.length > 0) {
        results.hermanas = { title: `Buscar dentistas en otras provincias de ${nombreComunidad}`, items: hermanas.map(p => ({ label: p.breadcrumb, href: `/dentistas/${p.slug}-provincia` })) };
      }
    }

    // -----------------------------------------------------------
    // COMARCAS (Restaurado para Nivel 03)
    // -----------------------------------------------------------
    const { data: activeCities } = await supabase
        .from('view_clinics_con_dentistas')
        .select('ine_city_code')
        .eq('ine_province_code', landing.codigo_ine);

    if (activeCities && activeCities.length > 0) {
        //asteriscado pq typescript viejo no permite ... array sobre un set
        //const cityCodes = [...new Set(activeCities.map(c => c.ine_city_code))];
        const cityCodes = Array.from(new Set(activeCities.map(c => c.ine_city_code)));
        const { data: munisComarcas } = await supabase
            .from('ine_municipios')
            .select('comarca_codigo')
            .in('codigo', cityCodes);
        
        if (munisComarcas && munisComarcas.length > 0) {
            //const activeComarcaCodes = [...new Set(munisComarcas.map(m => m.comarca_codigo))];
            const activeComarcaCodes = Array.from(new Set(munisComarcas.map(m => m.comarca_codigo)));
            const { data: comarcasLanding } = await supabase
                .from('landings_search_dentistry')
                .select('breadcrumb, slug')
                .in('codigo_ine', activeComarcaCodes)
                .eq('nivel', '06')
                .order('breadcrumb', { ascending: true });

            if (comarcasLanding && comarcasLanding.length > 0) {
                results.comarcas = {
                    title: `Buscar por comarcas de la provincia de ${landing.nombre}`,
                    items: comarcasLanding.map(c => ({ label: c.breadcrumb, href: `/dentistas/${c.slug}` }))
                };
            }
        }
    }

    // HIJAS (Municipios)
    const { data: munis } = await supabase
      .from('landings_search_dentistry')
      .select('breadcrumb, slug')
      .eq('nivel', '04')
      .ilike('codigo_ine', `${landing.codigo_ine}%`)
      .order('breadcrumb', { ascending: true })
      .limit(30);

    if (munis && munis.length > 0) {
      results.hijas = { 
        title: `Localidades con dentistas en la provincia de ${landing.nombre}`, 
        items: munis.map(m => ({ label: m.breadcrumb, href: `/dentistas/${m.slug}` })) 
      };
    }
  }

  // =================================================================================================
  // NIVEL 04: MUNICIPIO (LÓGICA CON HUBS INTEGRADA)
  // =================================================================================================
  else if (landing.nivel === '04') {
      const codProvincia = landing.codigo_ine.substring(0, 2);
      
      // 1. MADRE: Provincia
      const { data: landingProv } = await supabase
        .from('landings_search_dentistry')
        .select('breadcrumb, slug')
        .eq('codigo_ine', codProvincia)
        .eq('nivel', '03')
        .maybeSingle();

      const nombreProvincia = landingProv?.breadcrumb || "la provincia";

      if (landingProv) {
        results.madre = {
          title: `Volver a buscar dentistas en ${nombreProvincia}`,
          items: [{ label: landingProv.breadcrumb, href: `/dentistas/${landingProv.slug}-provincia` }]
        };
      }

      // 2. HERMANAS: Otras localidades de la misma provincia
      const { data: allMunis } = await supabase
         .from('landings_search_dentistry')
         .select('breadcrumb, slug, codigo_ine, latitude:latitud_gps, longitude:longitud_gps')
         .eq('nivel', '04')
         .like('codigo_ine', `${codProvincia}%`) 
         .limit(100); 

      if (allMunis && hasCoords) {
         // Filtramos el actual y ordenamos por cercanía
         const cercanas = allMunis
            .filter(m => m.codigo_ine !== landing.codigo_ine)
            .sort((a,b) => getDistance(landing.latitude, landing.longitude, a.latitude, a.longitude) - getDistance(landing.latitude, landing.longitude, b.latitude, b.longitude))
            .slice(0, 8);
         
         if (cercanas.length > 0) {
             results.cercanas = { 
                 title: `Buscar dentistas en localidades cercanas a ${landing.nombre}`, 
                 items: cercanas.map(m => ({ label: m.breadcrumb, href: `/dentistas/${m.slug}` })) 
             };
         }
      }

      // 3. HIJAS (HUBS/ZONAS): Solo si es municipio grande (04.a)
      // Buscamos nivel '05' cuyo codigo_ine sea igual al municipio actual
      if (landing.subnivel === 'a') {
          const { data: hubs } = await supabase
            .from('landings_search_dentistry')
            .select('breadcrumb, slug')
            .eq('nivel', '05')
            .eq('codigo_ine', landing.codigo_ine) // Los hubs tienen codigo_ine = municipio padre
            .order('breadcrumb', { ascending: true });

          if (hubs && hubs.length > 0) {
              results.hijas = {
                  title: `Buscar por zonas en ${landing.nombre}`,
                  items: hubs.map(h => ({ label: h.breadcrumb, href: `/dentistas/${h.slug}` }))
              };
          }
      }
  }

  // =================================================================================================
  // NIVEL 06: COMARCA
  // =================================================================================================
  else if (landing.nivel === '06') {
      const codProvincia = landing.codigo_ine.substring(0, 2);
      
      // MADRE: Provincia
      const { data: landingProv } = await supabase
        .from('landings_search_dentistry')
        .select('breadcrumb, slug')
        .eq('codigo_ine', codProvincia)
        .eq('nivel', '03')
        .maybeSingle();

      const nombreProvincia = landingProv?.breadcrumb || "la provincia";

      if (landingProv) {
         results.madre = {
           title: `Volver a buscar dentistas en ${nombreProvincia}`,
           items: [{ label: landingProv.breadcrumb, href: `/dentistas/${landingProv.slug}-provincia` }]
         };
      }

      // --- LOGICA DE COMARCAS ---
      const { data: allComarcasProvincia } = await supabase
          .from('landings_search_dentistry')
          .select('breadcrumb, slug, codigo_ine, latitude:latitud_gps, longitude:longitud_gps')
          .eq('nivel', '06')
          .like('codigo_ine', `${codProvincia}%`)
          .order('breadcrumb', { ascending: true });

      if (allComarcasProvincia && allComarcasProvincia.length > 0) {
          
          // Ciudades activas
          const { data: activeCities } = await supabase
            .from('view_clinics_con_dentistas')
            .select('ine_city_code')
            .eq('ine_province_code', codProvincia);
          
          let activeComarcaCodes = new Set<string>();

          if (activeCities && activeCities.length > 0) {
              //const cityCodes = [...new Set(activeCities.map(c => c.ine_city_code))];
              const cityCodes = Array.from(new Set(activeCities.map(c => c.ine_city_code)));
              const { data: munisComarcas } = await supabase
                  .from('ine_municipios')
                  .select('comarca_codigo')
                  .in('codigo', cityCodes);
              
              if (munisComarcas) {
                  munisComarcas.forEach(m => activeComarcaCodes.add(m.comarca_codigo));
              }
          }

          const hermanasConDentistas = allComarcasProvincia.filter(
              c => c.codigo_ine !== landing.codigo_ine && activeComarcaCodes.has(c.codigo_ine)
          );
          
          const hermanasSinDentistas = allComarcasProvincia.filter(
              c => c.codigo_ine !== landing.codigo_ine && !activeComarcaCodes.has(c.codigo_ine)
          );

          if (hermanasConDentistas.length > 0) {
              results.hermanas = {
                  title: `Buscar en comarcas de la provincia de ${nombreProvincia} con algún dentista`,
                  items: hermanasConDentistas.map(c => ({ label: c.breadcrumb, href: `/dentistas/${c.slug}` }))
              };
          }

          if (hermanasSinDentistas.length > 0 && hasCoords) {
               hermanasSinDentistas.sort((a,b) => 
                  getDistance(landing.latitude, landing.longitude, a.latitude, a.longitude) - 
                  getDistance(landing.latitude, landing.longitude, b.latitude, b.longitude)
               );

               results.comarcas_sin_dentistas = {
                  title: `Buscar más cercano en comarcas sin dentistas de la provincia de ${nombreProvincia}`,
                  items: hermanasSinDentistas.slice(0, 8).map(c => ({ label: c.breadcrumb, href: `/dentistas/${c.slug}` }))
               };
          } else if (hermanasSinDentistas.length > 0) {
               results.comarcas_sin_dentistas = {
                  title: `Comarcas sin dentistas de la provincia de ${nombreProvincia}`,
                  items: hermanasSinDentistas.slice(0, 8).map(c => ({ label: c.breadcrumb, href: `/dentistas/${c.slug}` }))
               };
          }
      }
  }

  // =================================================================================================
  // OTROS NIVELES (07, etc.)
  // =================================================================================================
  else if (['07'].includes(landing.nivel)) {
      const codProvincia = landing.codigo_ine.substring(0, 2);
      const { data: landingProv } = await supabase.from('landings_search_dentistry').select('breadcrumb, slug').eq('codigo_ine', codProvincia).eq('nivel', '03').maybeSingle();
      const nombreProvincia = landingProv?.breadcrumb || "la provincia";

      if (landingProv) {
        results.madre = {
          title: `Volver a buscar dentistas en ${nombreProvincia}`,
          items: [{ label: landingProv.breadcrumb, href: `/dentistas/${landingProv.slug}-provincia` }]
        };
      }

      const { data: allItems } = await fetchByLevel(landing.nivel);
      if (allItems && hasCoords) {
        const sorted = allItems.filter(i => i.codigo_ine !== landing.codigo_ine).sort((a,b) => getDistance(landing.latitude, landing.longitude, a.latitude, a.longitude) - getDistance(landing.latitude, landing.longitude, b.latitude, b.longitude)).slice(0, 8);
        const tipoZona = 'localidades';
        results.cercanas = { title: `Buscar dentistas en ${tipoZona} limítrofes a ${landing.nombre}`, items: sorted.map(i => ({ label: i.breadcrumb, href: `/dentistas/${i.slug}` })) };
      }
  }

  return results;
};