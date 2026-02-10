"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronUp, ChevronDown, Stethoscope } from "lucide-react";
import { useNavigation, NavigationState } from "@/context/NavigationContext";
import ClinicList from "@/components/dentists/ClinicList";

const DentalMapClient = dynamic(() => import("@/components/map/DentalMapClient"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa...</div>
});

export default function DentistsContainer({ initialData }: { initialData: NavigationState }) {
  const { updateNavigation } = useNavigation();

  useEffect(() => {
    updateNavigation(initialData);
  }, [initialData, updateNavigation]);

  const activeMarks = initialData.mapa.marks;
  const activeMapaConfig = initialData.mapa;
  const activeStats = initialData.lista;

  const [isListOpen, setIsListOpen] = useState(initialData.lista.estadoInicial !== 'CLOSED');
  const formatter = new Intl.NumberFormat('es-ES');

  return (
    <div className="relative w-full h-[600px] md:h-[700px] bg-white flex flex-col pt-4 pb-12 px-4 md:px-10 font-fsme">
      <div className="relative w-full h-full bg-white rounded-[40px] overflow-hidden border-8 border-white shadow-xl z-20">
        
        <div className="absolute inset-0 z-10">
            <DentalMapClient 
                marks={activeMarks} 
                modo={activeMapaConfig.modo}
                initialCenter={activeMapaConfig.centro} 
                initialZoom={activeMapaConfig.zoom}
                tileStyle={activeMapaConfig.tileStyle}
            /> 
        </div>

        <div className={`absolute bottom-0 left-0 right-0 z-30 bg-white transition-all duration-500 flex flex-col ${isListOpen ? 'h-[70%]' : 'h-[80px]'}`}>
          <div onClick={() => setIsListOpen(!isListOpen)} className="h-[80px] px-6 flex items-center justify-between cursor-pointer border-b shrink-0">
            <div className="flex items-center gap-4">
              <Stethoscope className="w-5 h-5 text-dkv-green" />
              <h3 className="font-lemon text-dkv-green-dark uppercase tracking-tight">
                <span className="text-dkv-green">{formatter.format(activeStats.totalDentistas)}</span> DENTISTAS
              </h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              {isListOpen ? <ChevronDown /> : <ChevronUp />}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="max-w-5xl mx-auto py-2">
              <ClinicList clinics={activeStats.clinics} onSelectClinic={() => setIsListOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}