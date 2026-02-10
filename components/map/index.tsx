"use client";

import dynamic from "next/dynamic";
import { Clinic } from "@/types/database";

// Importación dinámica deshabilitando SSR (Server Side Rendering)
const DentalMapClient = dynamic(() => import("./DentalMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-4 border-dkv-green border-t-transparent rounded-full animate-spin"></div>
      <span className="text-dkv-green font-lemon text-sm animate-pulse">Cargando mapa...</span>
    </div>
  ),
});

//export default function DentalMap(props: { clinics: Clinic[] }) {
export default function DentalMap({ clinics }: { clinics: Clinic[] }) {

  // Verificación de seguridad por si clinics llega undefined
  if (!clinics) return null;


  // 1. TRANSFORMACIÓN:
  // Convertimos el array de 'Clinic' (BBDD) al formato 'MapMarkerData' (Mapa)
  const mapMarks = clinics.map((c) => ({
    name: c.name,
    lat: c.latitude,
    lng: c.longitude,
    count: c.staff_count, // El número que sale en el icono
    slug: c.clinic_id     // El ID para la URL al hacer clic
  }));



  //return <DentalMapClient {...props} />;
  // 2. RENDERIZADO:
  // Pasamos 'marks' explícitamente y configuramos el modo de zoom
  return (
    <DentalMapClient 
      marks={mapMarks} 
      modo={mapMarks.length > 0 ? "FIT_BOUNDS" : "CENTER_ZOOM"} 
    />
  );
}