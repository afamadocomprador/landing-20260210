"use client";

import { useState } from "react";
import { Clinic } from "@/types/database";
import { MapPin, Phone, Users, ArrowRight, Plus, Minus } from "lucide-react";
import { formatPhoneNumber } from "@/lib/text-formatter"; // Importamos tu utilidad

// Extendemos el tipo Clinic para incluir los campos que inyectamos en el servidor
interface ExtendedClinic extends Clinic {
 /*
  staff_names?: string[];
  zip_code?: string;
 */
  // Aquí puedes poner propiedades que calcules TÚ en el código React/Node
  // y que NO vengan de la base de datos.
  
  distance_km?: number;         // Ejemplo: Distancia calculada al usuario
  formatted_phone?: string;     // Ejemplo: Teléfono formateado bonito
  
  // NOTA: Como 'staff_names' y 'zip_code' ya vienen de la BBDD, 
  // ya no hace falta definirlos aquí obligatoriamente, 
  // pero si quieres redefinir su tipo para asegurarte de que no sean nulos:
  //staff_names?: string[];

}

interface ClinicCardProps {
  clinic: ExtendedClinic;
  onSelectClinic: (id: string) => void;
}

export default function ClinicCard({ clinic, onSelectClinic }: ClinicCardProps) {
  const [showStaff, setShowStaff] = useState(false);

  return (
    <div 
      onClick={() => onSelectClinic(clinic.clinic_id)}
      className="group bg-white p-6 rounded-[28px] border border-gray-100 hover:border-dkv-green/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Línea lateral de marca */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-dkv-green transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex-1 min-w-0 w-full">
          
          {/* 1. BADGE "ÉLITE" */}
          {clinic.is_propio && (
            <div className="mb-3">
              <span className="bg-dkv-green text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wide shadow-sm">
                Centro Élite
              </span>
            </div>
          )}

          {/* 2. TÍTULO DEL CENTRO */}
          <h3 className="font-lemon text-dkv-green-dark text-lg md:text-xl leading-tight mb-3 group-hover:text-dkv-green transition-colors">
            {clinic.name}
          </h3>

          {/* 3. ETIQUETA DE DENTISTAS */}
          {clinic.staff_count > 0 && (
            <div className="mb-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setShowStaff(!showStaff);
                }}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300
                  ${showStaff 
                    ? 'bg-dkv-green text-white shadow-md' 
                    : 'bg-dkv-green/10 text-dkv-green-dark hover:bg-dkv-green/20 border border-dkv-green/20'
                  }
                `}
              >
                <Users className={`w-4 h-4 ${showStaff ? 'text-white' : 'text-dkv-green'}`} />
                <span>{clinic.staff_count} Especialistas</span>
                {showStaff ? <Minus className="w-3.5 h-3.5 ml-1" /> : <Plus className="w-3.5 h-3.5 ml-1 animate-pulse" />}
              </button>

              {/* ACORDEÓN DE DENTISTAS */}
              <div className={`
                overflow-hidden transition-all duration-500 ease-in-out
                ${showStaff ? 'max-h-[500px] opacity-100 mt-3 mb-2' : 'max-h-0 opacity-0'}
              `}>
                <div className="bg-gray-50/80 rounded-xl p-4 border border-dashed border-gray-200">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Equipo Médico disponible:</p>
                  <ul className="grid grid-cols-1 gap-y-2">
                    {clinic.staff_names && clinic.staff_names.length > 0 ? (
                      clinic.staff_names.map((doctor, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700 font-fsme">
                          <div className="w-1.5 h-1.5 rounded-full bg-dkv-green"></div>
                          {doctor}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-400 italic">Lista disponible en el centro</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* 4. DIRECCIÓN */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-dkv-green/5 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-dkv-green" />
            </div>
            <div className="flex flex-col font-fsme leading-tight">
              <span className="text-gray-800 font-bold text-base md:text-lg mb-0.5">{clinic.address}</span>
              <span className="text-gray-500 font-medium text-sm md:text-base">
                {clinic.zip_code || ""} {clinic.city}
              </span>
            </div>
          </div>

          {/* 5. BOTÓN TELÉFONO ACTUALIZADO */}
          <div className="flex items-center">
            {clinic.phone && (
              <a 
                href={`tel:${clinic.phone.toString().replace(/\D/g, "")}`} // Limpio para el sistema
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-3 px-6 py-3.5 bg-dkv-green-dark text-white rounded-2xl text-base font-bold shadow-md hover:bg-dkv-green transition-all active:scale-95"
              >
                <Phone className="w-5 h-5" />
                {/* Formateado 3-3-3 para el usuario */}
                <span>{formatPhoneNumber(clinic.phone)}</span>
              </a>
            )}
          </div>
        </div>

        {/* FLECHA DECORATIVA */}
        <div className="hidden sm:flex shrink-0 self-center">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-dkv-green group-hover:bg-dkv-green group-hover:text-white transition-all shadow-sm border border-gray-100">
            <ArrowRight className="w-7 h-7" />
          </div>
        </div>
      </div>
    </div>
  );

}
