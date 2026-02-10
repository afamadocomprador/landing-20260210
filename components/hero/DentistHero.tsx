"use client";

import React from "react";

interface DentistHeroProps {
  h1: { dark: string; normal: string; };
  totalDentistas: number;
  totalCentros: number;
}

export default function DentistHero({ h1, totalDentistas, totalCentros }: DentistHeroProps) {
  const formatter = new Intl.NumberFormat('de-DE');
  
  // LÓGICA DE TEXTO: "Más de" solo para 300 o más dentistas
  // En nivel 02 (Aragón, etc.) locationName no será 'España', por lo que no saldrá el prefijo.
  const locationName = h1.normal; 
  const isSpain = locationName.toLowerCase() === 'españa';
  const showPlusPrefix = totalDentistas > 300; 

  const formattedProfessionals = formatter.format(totalDentistas);
  const formattedClinics = formatter.format(totalCentros);

  return (
    <section className="relative pt-16 pb-8 px-safe-x md:px-6 container mx-auto">
      <div className="max-w-4xl relative">
        <div className="relative pl-8 md:pl-10 pb-8 pr-4">
          {/* Hilo conductor (Línea y Puntos) */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1 left-0 w-4 h-4 bg-white border-2 border-dkv-green-dark rounded-full z-20"></div>
            <div className="absolute top-3 left-[7px] right-[7px] h-[calc(100%-15px)] border-l-2 border-b-2 border-dkv-green-dark rounded-bl-[30px] z-10">
              <div className="absolute -right-[9px] -bottom-[9px] w-4 h-4 bg-white border-2 border-dkv-green-dark rounded-full z-20"></div>
            </div>
          </div>

          <div className="relative z-20 space-y-5 pt-1">
            <div>
              <span className="inline-block py-1 px-3 bg-dkv-green/10 text-dkv-green-dark font-bold text-xs uppercase tracking-wider rounded-full mb-2">
                DKV Dentisalud Élite
              </span>
            </div>

            <h1 className="font-lemon text-4xl md:text-5xl lg:text-6xl text-dkv-green-dark leading-tight text-left">
               {h1.dark} <br />
               <span className="text-dkv-green">{h1.normal}.</span>
            </h1>
            
            {/* TEXTO ORIGINAL RESTAURADO CON TU LÓGICA EXACTA */}
            <p className="font-fsme text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl text-left">
              Accede al Cuadro Médico Dental DKV. {showPlusPrefix && "Más de "} 
              <strong className="text-dkv-green"> {formattedProfessionals} </strong> dentistas disponibles en 
              <strong className="text-dkv-green"> {formattedClinics} </strong> centros dentales y precios pactados en 
              {isSpain ? " todo el territorio nacional" : ` ${locationName}`}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}