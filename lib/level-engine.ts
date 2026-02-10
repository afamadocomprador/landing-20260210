import { SupabaseClient } from "@supabase/supabase-js";
import { NavigationState } from "@/context/NavigationContext";
import { getDatosComunidades } from '@/services/getComunidades';
import { getDatosProvincias } from '@/services/getProvincias';
import { getDatosMunicipios } from '@/services/getMunicipios';
import { getDatosMunicipiosDeComarca } from '@/services/getMunicipiosDeComarcas';
import { getDatosCentros } from '@/services/getCentros';
import { getDatosHubs } from '@/services/getHubs';
import { getBreadcrumbTrail } from '@/services/getBreadcrumb';

// IMPORTAR EL NUEVO SERVICIO Y TIPOS
import { getRelatedLinks, RelatedLinksData } from '@/services/getEnlaces';

export interface ExtendedNavigationState extends NavigationState {
    relatedLinks: RelatedLinksData;
}

export async function getLevelData(
  supabase: SupabaseClient,
  nivelInicial: string,
  nivelFinal: string,
  slug: string | ""
): Promise<ExtendedNavigationState> {
  
  // 1. NORMALIZACIÓN
  const isProvinciaSlug = slug.endsWith("-provincia");
  const baseSlug = isProvinciaSlug ? slug.replace("-provincia", "") : slug;
  const searchLevel = isProvinciaSlug ? "03" : nivelFinal;

  // Búsqueda de landing (IMPORTANTE: Pedimos subnivel)
  let { data: landing } = await supabase
    .from("landings_search_dentistry")
    .select("*, subnivel") // Aseguramos traer subnivel
    .eq("nivel", searchLevel)
    .eq("slug", baseSlug)
    .maybeSingle();

  if (!landing) {
    const { data: retry } = await supabase.from("landings_search_dentistry").select("*, subnivel").eq("slug", slug).maybeSingle();
    landing = retry;
  }

  if (!landing) {
    throw new Error("Página no encontrada");
  }

  // --- TRAZA INICIAL ---
  console.log(`\n[DEBUG ENGINE] Landing: ${landing.nombre_ine} | Nivel: ${landing.nivel} | Subnivel: ${landing.subnivel}`);

  // 2. ESTADÍSTICAS Y LISTADO
  //asteriscado por typescript .... let stats = { a:0, b:0 };
  let stats: any = {};
  let listado: any[] = [];
  let totalHeroDentistas = 0;
  let totalHeroCentros = 0;

  if (landing.nivel === "01") {
     const datos = await getDatosComunidades(supabase);
     stats = datos.stats;
     listado = datos.listado;
     let auxTotal = stats.total_espana_dentistas || 0;
     if (auxTotal > 300) auxTotal = Math.floor(auxTotal / 100) * 100;    
     totalHeroDentistas = auxTotal;
     totalHeroCentros = stats.total_espana_centros;
  } 
  else if (landing.nivel === "02") {
     const datos = await getDatosProvincias(supabase, landing.codigo_ine.replace('CA-', ''));
     stats = datos.stats;
     listado = datos.listado;
     totalHeroDentistas = stats.total_comunidad_dentistas;
     totalHeroCentros = stats.total_comunidad_centros;
  } 
  else if (landing.nivel === "03") {
     const datos = await getDatosMunicipios(supabase, landing.codigo_ine);
     stats = datos.stats;
     listado = datos.listado;
     totalHeroDentistas = stats.total_provincia_dentistas;
     totalHeroCentros = stats.total_provincia_centros;
  } 
  else if (landing.nivel === "04") {
     // Lógica unificada para nivel 04
     if (landing.subnivel === "a") {
        const datos = await getDatosHubs(supabase, landing.codigo_ine);
        stats = datos.stats;
        listado = datos.listado;
        totalHeroDentistas = stats.total_municipio_dentistas;
        totalHeroCentros = stats.total_municipio_centros;
     } 
     else if (["b", "c"].includes(landing.subnivel)) {
        const datos = await getDatosCentros(supabase, landing.codigo_ine);
        stats = datos.stats;
        listado = datos.listado;
        totalHeroDentistas = stats.total_municipio_dentistas;
        totalHeroCentros = stats.total_municipio_centros;
     } else {
        console.warn("[DEBUG] Nivel 04 con subnivel desconocido o nulo:", landing.subnivel);
     }
  } 
  else if (landing.nivel === "06") {
     const datos = await getDatosMunicipiosDeComarca(supabase, landing.codigo_ine);
     stats = datos.stats;
     listado = datos.listado;
     totalHeroDentistas = stats.total_comarca_dentistas;
     totalHeroCentros = stats.total_comarca_centros;
  } 


  // 3. MARCADORES MAPA
  let markers: any[] = [];
  
  if (landing.nivel === "01") {
    //markers = (listado || []).filter(m => m.lat_comunidad).map(m => ({
    //    name: m.nombre_comunidad, lat: m.lat_comunidad, lng: m.lng_comunidad, slug: m.slug_comunidad, count: m.num_dentistas_comunidad 
    //}));

    const SLUG_OVERRIDES: Record<string, string> = {
      // van sin el prefijo 'CA-'
      '06': 'cantabria-provincia',
      '03': 'asturias',
      '13': 'madrid-provincia',
      '18': 'ceuta-municipio',
      '19': 'melilla-municipio',
      '17': 'la-rioja-provincia',
      '15': 'navarra',
      '14': 'murcia-provincia',
      '04': 'illes-balears-provincia'
    };
    const NAME_OVERRIDES: Record<string, string> = {
      // van sin el prefijo 'CA-'
      '03': 'Asturias',
      '13': 'Madrid',
      '15': 'Navarra',
      '14': 'Murcia',
      '10': 'Valencia'
    };

    markers = (listado || []).filter(m => m.lat_comunidad).map(m => ({
        name: NAME_OVERRIDES[m.cod_comunidad] || m.nombre_comunidad, lat: m.lat_comunidad, lng: m.lng_comunidad, slug: SLUG_OVERRIDES[m.cod_comunidad] || m.slug_comunidad, count: m.num_dentistas_comunidad 
    }));



  } 
  else if (landing.nivel === "02") {
    //markers = (listado || []).filter(m => m.lat_provincia).map(m => ({
    //    name: m.nombre_provincia, lat: m.lat_provincia, lng: m.lng_provincia, slug: m.slug_provincia, count: m.num_dentistas_provincia 
    //}));
    markers = (listado || []).filter(m => m.lat_provincia).map(m => ({
        name: m.nombre_provincia.replace("Provincia de ", ""), lat: m.lat_provincia, lng: m.lng_provincia, slug: m.slug_provincia, count: m.num_dentistas_provincia 
    }));
  }
  else if (landing.nivel === "03") {
    markers = (listado || []).filter(m => m.lat_municipio).map(m => ({
        name: m.nombre_municipio, lat: m.lat_municipio, lng: m.lng_municipio, slug: m.slug_municipio, count: m.num_dentistas_municipio
    }));
  }
  else if (landing.nivel === "04") {
     if (landing.subnivel === "a") {
        // Marcadores son los HUBS
        markers = (listado || []).filter(m => m.lat_hub).map(m => ({
             name: m.nombre_hub, lat: m.lat_hub, lng: m.lng_hub, slug: m.slug_hub, count: m.num_dentistas_hub 
        }));
     } 
     else {
        // Marcadores son los CENTROS (Clínicas)
        markers = (listado || []).filter(m => m.lat_centro).map(m => ({
             name: m.nombre_centro, lat: m.lat_centro, lng: m.lng_centro, slug: m.slug_centro, count: m.num_dentistas_centro 
        }));
     } 
  }
  else if (landing.nivel === "06") {
       markers = (listado || [])
         .filter(m => m.lat_municipio_de_comarca != null)
         .map(m => ({
            name: m.nombre_municipio_de_comarca, 
            lat: m.lat_municipio_de_comarca, 
            lng: m.lng_municipio_de_comarca, 
            slug: m.slug_municipio_de_comarca, 
            count: m.num_dentistas_municipio_de_comarca 
       }));
  }


  // 4. BREADCRUMBS
  const breadcrumbItems = await getBreadcrumbTrail(supabase, landing.nivel, landing.codigo_ine);

  // 5. CLÍNICAS (Listado inferior)
  let queryClinicsBuilder = supabase.from("view_clinics_con_dentistas").select("*");
  switch (landing.nivel) {
    case "01": case "02": queryClinicsBuilder = queryClinicsBuilder.eq('is_propio', true); break;
    case "03": queryClinicsBuilder = queryClinicsBuilder.eq('ine_province_code', landing.codigo_ine); break;
    case "04": queryClinicsBuilder = queryClinicsBuilder.eq('ine_city_code', landing.codigo_ine); break;
    case "06": queryClinicsBuilder = queryClinicsBuilder.eq('ine_comarca_code', landing.codigo_ine); break;
  }
  
  const { data: listClinics } = await queryClinicsBuilder;
  
  // ====================================================================
  // 6. ENLACES RELACIONADOS (Con corrección de subnivel)
  // ====================================================================
  const relatedLinks = await getRelatedLinks(supabase, {
    nivel: landing.nivel,
    subnivel: landing.subnivel, // <--- AHORA SÍ SE PASA CORRECTAMENTE
    codigo_ine: landing.codigo_ine,
    latitude: landing.latitud_gps,
    longitude: landing.longitud_gps,
    nombre: landing.nombre_ine 
  });

  // 7. RETORNO FINAL
  return {
    nivelInicial, 
    nivelFinal: landing.nivel, 
    entidadId: slug,
    mapa: {
      marks: markers,
      modo: landing.nivel === "01" ? 'CENTER_ZOOM' : 'FIT_BOUNDS',
      centro: [landing.latitud_gps || 40.41, landing.longitud_gps || -3.70],
      zoom: landing.nivel === "01" ? 6 : 10,
      tileStyle: landing.nivel === "01" ? "light_nolabels" : "light_all"
    },
    lista: {
      totalDentistas: totalHeroDentistas || 0,
      totalCentros: totalHeroCentros || 0,
      clinics: listClinics || [],
      estadoInicial: 'CLOSED' 
    },
    seo: {
      totalDentistasHero: totalHeroDentistas || 0, 
      totalCentrosHero: totalHeroCentros || 0,
      h1: { dark: "Encuentra tu dentista en", normal: landing.nombre_ine },
      breadcrumbs: breadcrumbItems,
      enlacesSugeridos: [], 
      title: `${landing.nombre_ine} | DKV Dentisalud`,
      description: ""
    },
    relatedLinks: relatedLinks // Objeto completo con secciones
  };
}