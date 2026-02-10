"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react'; // Adaptado a Lucide

const locations = [
  { name: "Comunidad de Madrid", count: 124 },
  { name: "Cataluña", count: 98 },
  { name: "Andalucía", count: 85 },
  { name: "Aragón", count: 42 },
  { name: "Comunidad Valenciana", count: 65 },
];

export default function LocationSheet() {
  return (
    // -mt-6 para solaparse ligeramente con el mapa y crear efecto "Sheet"
    <div className="relative -mt-6 bg-white w-full min-h-[40vh] rounded-t-3xl shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-bottom-sheet pb-10">
      
      {/* Tirador visual (Affordance) */}
      <div className="w-full flex justify-center pt-3 pb-2">
        <div className="w-12 h-1.5 bg-dkv-gray-border rounded-full opacity-70"></div>
      </div>

      <div className="px-safe-x pt-2">
        <h2 className="font-lemon text-dkv-green-dark text-lg mb-1">
          O selecciona tu zona
        </h2>
        <p className="font-fsme text-dkv-gray text-xs mb-4">
          Navega por el listado oficial de centros
        </p>

        {/* LISTA DE NAVEGACIÓN */}
        <ul className="flex flex-col">
          {locations.map((loc, index) => (
            <li 
              key={index} 
              className="group flex justify-between items-center py-4 border-b border-dkv-gray-border cursor-pointer hover:bg-dkv-gray-light transition-colors -mx-safe-x px-safe-x"
            >
              <div className="flex flex-col">
                <span className="font-fsme text-dkv-gray font-bold text-base">
                  {loc.name}
                </span>
                <span className="font-fsme text-dkv-gray/60 text-xs mt-0.5">
                  {loc.count} centros disponibles
                </span>
              </div>
              
              <ChevronRight className="w-5 h-5 text-dkv-green group-hover:translate-x-1 transition-transform" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}