"use client";

import { Clinic } from "@/types/database";
import ClinicCard from "./ClinicCard"; // Importamos el nuevo componente

interface ClinicListProps {
  clinics: Clinic[];
  onSelectClinic: (clinicId: string) => void;
}

export default function ClinicList({ clinics, onSelectClinic }: ClinicListProps) {
  if (!clinics || clinics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-gray-500 font-fsme text-base">
        No se han encontrado centros en esta zona.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 md:px-8 pb-10">
      {clinics.map((clinic) => (
        <ClinicCard 
          key={clinic.clinic_id} 
          clinic={clinic} 
          onSelectClinic={onSelectClinic} 
        />
      ))}
    </div>
  );
}