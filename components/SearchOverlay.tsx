"use client";

import React from 'react';
import { Search, MapPin } from 'lucide-react'; // Usamos Lucide en lugar de Heroicons

export default function SearchOverlay() {
  return (
    <div className="absolute top-[20px] left-0 w-full px-safe-x z-map-overlay">
      
      {/* CONTENEDOR INPUT */}
      <div className="flex w-full h-12 bg-white rounded-btn shadow-dkv-card items-center border border-dkv-gray-border overflow-hidden">
        
        {/* Icono Lupa (Decorativo) */}
        <div className="pl-4 text-dkv-gray opacity-50">
          <Search className="w-5 h-5" />
        </div>

        {/* Input Restrictivo */}
        <input 
          type="text" 
          placeholder="Código postal o municipio..." 
          className="w-full h-full px-3 text-dkv-gray font-fsme placeholder-dkv-gray/50 focus:outline-none text-sm"
        />

        {/* Separador Vertical */}
        <div className="h-6 w-[1px] bg-dkv-gray-border mx-1"></div>

        {/* Botón Geo (Acción Principal) */}
        <button className="flex items-center px-4 h-full text-dkv-green hover:bg-dkv-gray-light transition-colors group">
          <MapPin className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
          <span className="font-fsme font-bold text-sm whitespace-nowrap">Cerca de mí</span>
        </button>
      </div>

    </div>
  );
}