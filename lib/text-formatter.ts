import { LandingSearchDentistry } from "@/types/database";

/**
 * Formatea el contenido HTML de las landings realizando las sustituciones de variables.
 */
export function formatLandingText(htmlContent: string | null, landing: LandingSearchDentistry): string {
  if (!htmlContent) return "";

  let text = htmlContent;
  const nombre = landing.nombre_ine;

  // LÓGICA DE SUSTITUCIÓN SEGÚN EL DOCUMENTO
  const replacements: Record<string, string> = {
    "{{Nombre}}": nombre,
    
    // Nivel 01 es España, Nivel 02 es Comunidad Autónoma
    "{{Autonomía}}": landing.nivel === "02" ? nombre : (landing.nivel === "01" ? "España" : nombre),
    
    "{{Provincia}}": landing.nivel === "02" ? nombre : nombre,
    
    "{{Ciudad}}": landing.nivel === "05" || landing.nivel === "07" ? nombre : nombre,
    
    "{{Comarca}}": landing.nivel === "06" ? nombre : nombre,
    
    "{{Lista_Provincias}}": "todas las provincias",
  };

  // Ejecutar reemplazos
  Object.entries(replacements).forEach(([key, value]) => {
    // Escapamos las llaves por si acaso y usamos regex global
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(escapedKey, "gi"), value);
  });

  return text;
}

/**
 * Formatea un número de teléfono de 9 dígitos en grupos de 3 (XXX XXX XXX).
 * Si la longitud es distinta, lo devuelve tal cual.
 */
export function formatPhoneNumber(phone: string | number | undefined | null): string {
  if (!phone) return "";

  // Convertimos a string y eliminamos cualquier carácter que no sea número
  const cleanPhone = phone.toString().replace(/\D/g, "");

  // Si tiene el estándar de 9 dígitos de España
  if (cleanPhone.length === 9) {
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 9)}`;
  }

  // Fallback: si viene con espacios o es formato internacional, devolvemos el original
  return phone.toString();
}