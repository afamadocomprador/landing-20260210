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

export default function DentalMap(props: { clinics: Clinic[] }) {
  return <DentalMapClient {...props} />;
}