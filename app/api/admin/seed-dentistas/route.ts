import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ----------------------------------------------------------------------------
// 1. CONFIGURACIÓN
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ----------------------------------------------------------------------------
// 2. LÓGICA DE NORMALIZACIÓN
// ----------------------------------------------------------------------------

/**
 * Normalización:
 * - Guiones/Puntos/Barras -> ESPACIO
 * - Apóstrofes -> ELIMINADOS (Sant Joan d'Alacant -> sant joan dalacant)
 * - Trim y espacios simples
 */
function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Fuera tildes
    .replace(/[-.,/]/g, " ")         // Separadores -> ESPACIO
    .replace(/['´`’]/g, "")          // Apóstrofes -> SE BORRAN (quedan pegados)
    .replace(/\s+/g, " ")            // Colapsar espacios
    .trim();
}

/**
 * DICCIONARIO DE CORRECCIONES
 * Mapea la entrada del dentista a la CLAVE EXACTA que generará el INE.
 */
function fixMunicipalityName(rawName: string): string {
  if (!rawName) return '';
  const clean = normalizeString(rawName);

  switch (clean) {
    // ----------------------------------------------------------
    // CASOS CRÍTICOS REPORTADOS (ALICANTE / GIPUZKOA / GIRONA)
    // ----------------------------------------------------------

    // CASO 1: Sant Joan d'Alacant
    // INE: "Sant Joan d'Alacant" -> norm: "sant joan dalacant" (pegado)
    case 'sant joan dalacant':
    case 'sant joan d alacant': // Por si acaso entra con espacio
    case 'sant joan d´alacant':
      return 'sant joan dalacant'; 

    // CASO 2: Arrasate-Mondragón
    // INE: "Arrasate/Mondragón" -> norm: "arrasate mondragon" (con espacio por la barra)
    case 'arrasate mondragon':
      return 'arrasate mondragon';

    // CASO 3: Castell-Platja d'Aro
    // INE: "Castell d'Aro, Platja d'Aro i s'Agaró" -> norm: "castell daro platja daro i sagaro"
    case 'castell platja daro':
    case 'castell platja d aro':
      return 'castell daro platja daro i sagaro';

    // CASO 4: L'Hospitalet de Llobregat
    // INE (Invertido): "Hospitalet de Llobregat, L'" -> norm: "l hospitalet de llobregat" (con espacio por la coma)
    // El dentista suele poner "L'Hospitalet" -> norm: "lhospitalet" (pegado)
    case 'lhospitalet de llobregat':
    case 'l hospitalet de llobregat': 
      return 'l hospitalet de llobregat'; // Forzamos la versión con espacio del INE invertido

    // ----------------------------------------------------------
    // OTROS CASOS HISTÓRICOS
    // ----------------------------------------------------------
    case 'estella': return 'estella lizarra';
    case 'cambrils miami': return 'cambrils';
    case 'villarreal': return 'vila real';
    case 'sant llorenc dhortons':
    case 'sant llorenc d hortons': return 'sant llorenc dhortons'; // INE: Sant Llorenç d'Hortons -> dhortons
    case 'calafell segur': return 'calafell';
    case 'la vall duixo':
    case 'la vall d uixo': return 'la vall duixo'; // INE: La Vall d'Uixó -> duixo
    case 'l alfas del pi':
    case 'lalfas del pi': return 'l alfas del pi'; // INE: Alfàs del Pi, l' -> con espacio
    case 'ames bertamirans': return 'ames';
    case 'salou la pineda': return 'salou';
    case 'pontes de garcia rodriguez': return 'as pontes de garcia rodriguez';
    case 'l alcudia':
    case 'lalcudia': return 'l alcudia';
    case 'la bisbal demporda':
    case 'la bisbal d emporda': return 'la bisbal demporda'; // INE: La Bisbal d'Empordà -> demporda
    case 'jalon': return 'xalo';
    case 'ibiza': return 'eivissa';
    case 'palma de mallorca': return 'palma';
    case 'rafelbunol': return 'rafelbunyol';
    case 'calpe': return 'calp';
    case 'las rozas': return 'las rozas de madrid';
    case 'ejido el': return 'el ejido';
    case 'laracha': return 'a laracha';
    case 'torre del campo': return 'torredelcampo';
    case 'sant carles de la rapita': return 'la rapita';
    case 'puig': return 'el puig de santa maria';
    case 'maliano': return 'camargo';
    case 'rodilana': return 'medina del campo';
    case 'la hoya': return 'lorca';
    case 'maspalomas': return 'san bartolome de tirajana';
    case 'sangonera la verde': return 'murcia';
    case 'gomeznarro': return 'medina del campo';
    case 'coruna a': return 'a coruna';
    case 'alacant': return 'alicante';
    case 'castello de la plana': return 'castellon de la plana';
    case 'elx': return 'elche';
    case 'palmas de gran canaria las': 
    case 'las palmas': return 'las palmas de gran canaria';

    default: return clean;
  }
}

function generateNameVariations(rawName: string): string[] {
  const clean = normalizeString(rawName);
  const variations = new Set<string>();
  
  // 1. Clave base
  variations.add(clean);

  // 2. Separadores del nombre ORIGINAL
  const separators = ['/', '-'];
  separators.forEach(sep => {
    if (rawName.includes(sep)) {
      const parts = rawName.split(sep);
      parts.forEach(p => {
        const pClean = normalizeString(p);
        if (pClean.length > 2) variations.add(pClean);
      });
      // Versión con espacios para nombres compuestos con barra (Arrasate/Mondragon -> Arrasate Mondragon)
      const combined = parts.map(p => normalizeString(p)).join(' ');
      variations.add(combined);
    }
  });

  // 3. Inversión de Comas (Hospitalet de Llobregat, L')
  if (rawName.includes(',')) {
    const parts = rawName.split(',');
    if (parts.length === 2) {
      // Invertimos y añadimos espacio: "L'" + " " + "Hospitalet..." -> "l hospitalet..."
      variations.add(`${normalizeString(parts[1])} ${normalizeString(parts[0])}`.trim());
    }
  }

  return Array.from(variations);
}

// ----------------------------------------------------------------------------
// 3. ENDPOINT
// ----------------------------------------------------------------------------

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Endpoint solo disponible en desarrollo' }, { status: 403 });
  }

  try {
    console.log("🚀 [SEED] Carga Final Dentistas...");
    const startTime = Date.now();

    // A. INE
    console.log("📦 [INE] Cargando...");
    let allIneData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('ine_municipios')
        .select('codigo, nombre')
        .range(page * pageSize, (page * pageSize) + pageSize - 1);

      if (error) throw new Error(error.message);
      if (data && data.length > 0) {
        allIneData = allIneData.concat(data);
        if (data.length < pageSize) hasMore = false;
        page++;
      } else { hasMore = false; }
    }
    
    // B. INDEXAR
    const municipalityMap = new Map<string, string>();
    allIneData.forEach((m) => {
      const derivedProvinceCode = m.codigo.substring(0, 2);
      const variations = generateNameVariations(m.nombre);
      variations.forEach(v => {
        municipalityMap.set(`${derivedProvinceCode}-${v}`, m.codigo);
      });
    });

    // C. JSON
    const filePath = path.join(process.cwd(), 'nopublic/data_dentistas08.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // D. PROCESAR
    let successMatches = 0;
    const failedList: string[] = [];

    const records = jsonData.results.map((item: any) => {
      const doc = item.document; 
      const rawPostalCode = doc.PostalCode ? doc.PostalCode.toString().padStart(5, '0') : null;
      const calculatedIneProvince = rawPostalCode ? rawPostalCode.substring(0, 2) : null;

      let calculatedIneMunicipality = null;
      if (calculatedIneProvince && doc.Town) {
        const cleanTownName = fixMunicipalityName(doc.Town);
        const searchKey = `${calculatedIneProvince}-${cleanTownName}`;
        calculatedIneMunicipality = municipalityMap.get(searchKey) || null;
        
        if (calculatedIneMunicipality) {
            successMatches++;
        } else {
            if (failedList.length < 15) {
               failedList.push(`[${calculatedIneProvince}] '${doc.Town}' -> Norm: '${cleanTownName}'`);
            }
        }
      }

      // Resto de campos...
      const locGis = (doc.Latitude && doc.Longitude) ? `SRID=4326;POINT(${doc.Longitude} ${doc.Latitude})` : null;
      return {
        medical_directory_id: String(doc.MedicalDirectoryId),
        postal_code: rawPostalCode,
        ine_province_code: calculatedIneProvince, 
        ine_municipality_code: calculatedIneMunicipality,
        location_gis: locGis,
        town: doc.Town, 
        province: doc.Province,
        sp_customer_telephone_1: doc.SpCustomerTelephone1 ? String(doc.SpCustomerTelephone1) : null,
        sp_customer_telephone_2: doc.SpCustomerTelephone2 ? String(doc.SpCustomerTelephone2) : null,
        latitude: doc.Latitude,
        longitude: doc.Longitude,
        speciality_cod: doc.SpecialityCod,
        speciality: doc.Speciality,
        online_appointment: doc.OnlineAppointment,
        electronic_prescription: doc.ElectronicPrescription,
        virtual_consultation: doc.VirtualConsultation,
        attention_type_id: doc.AttentionTypeId,
        biller: doc.Biller,
        company_cod: doc.CompanyCod,
        networks: doc.Networks,
        professional_id: doc.ProfessionalId,
        professional_nif: doc.ProfessionalNif,
        professional_name: doc.ProfessionalName,
        professional_last_name_1: doc.ProfessionalLastName1,
        professional_last_name_2: doc.ProfessionalLastName2,
        professional_nick_name: doc.ProfessionalNickName,
        professional_membership_number: doc.ProfessionalMembershipNumber ? String(doc.ProfessionalMembershipNumber) : null,
        professional_province: doc.ProfessionalProvince,
        professional_expert_in: doc.ProfessionalExpertIn,
        professional_curriculum_vitae: doc.ProfessionalCurriculumVitae,
        professional_average_rating: doc.ProfessionalAverageRating ? String(doc.ProfessionalAverageRating) : null,
        sp_id: doc.SpId,
        sp_preferential: doc.SpPreferential,
        sp_name: doc.SpName,
        sp_last_name_1: doc.SpLastName1,
        sp_last_name_2: doc.SpLastName2,
        sp_email_1: doc.SpEmail1,
        sp_email_2: doc.SpEmail2,
        sp_schedule_1: doc.SpSchedule1,
        sp_schedule_2: doc.SpSchedule2,
        sp_web_site: doc.SpWebSite,
        sp_point_contact_id: doc.SpPointContactId ? String(doc.SpPointContactId) : null,
        sp_is_health_space: doc.SpIsHealthSpace,
        sp_average_rating: doc.SpAverageRating ? String(doc.SpAverageRating) : null,
        sp_is_colaborator: doc.SpIsColaborator,
        nature_cod: doc.NatureCod,
        nature: doc.Nature,
        road_type: doc.RoadType,
        road: doc.Road,
        address_id: doc.AddressId,
        address_cod: doc.AddressCod,
        address: doc.Address,
        merge_order: doc.MergeOrder ? String(doc.MergeOrder) : null,
        weight_sorting: doc.WeightSorting,
        combined_name: doc.CombinedName,
        prescription_without_authorization: doc.PrescriptionWithoutAuthorization,
        is_center: doc.isCenter,
        last_modified: doc.lastModified,
        specialists_01: doc.Specialists01,
        specialists_02: doc.Specialists02,
        specialists_03: doc.Specialists03,
        specialists_04: doc.Specialists04,
        canonical: doc.canonical,
        ofuscate_document_id: doc.ofuscateDocumentId
      };
    });

    // E. UPSERT
    const BATCH_SIZE = 50; 
    console.log(`💾 Guardando ${records.length}...`);
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await supabaseAdmin.from('medical_directory_raw').upsert(batch, { onConflict: 'medical_directory_id' });
    }

    const duration = (Date.now() - startTime) / 1000;
    const matchRate = Math.round((successMatches / records.length) * 100);

    return NextResponse.json({ 
      success: true, 
      stats: { total: records.length, matches: successMatches, rate: `${matchRate}%`, duration },
      fails: failedList,
      message: "Proceso completado."
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}