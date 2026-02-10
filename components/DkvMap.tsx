"use client";
import React, { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRouter } from 'next/navigation';

// ICONO PIN CORPORATIVO DKV
const DkvPinIcon = ({ isHovered }: { isHovered: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={`w-8 h-8 md:w-10 md:h-10 drop-shadow-md -mt-10 transition-transform duration-300 ${isHovered ? 'scale-125 z-50' : 'scale-100 z-10'}`}
    style={{ fill: isHovered ? '#43752B' : '#849700' }} 
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    <circle cx="12" cy="9" r="3.5" fill="white" />
  </svg>
);

// DATOS DE COMUNIDADES (Tus Coordenadas Visuales)
const COMMUNITIES = [
  // PENÍNSULA
  { id: 'andalucia', name: 'Andalucía', lat: 37.4633, lng: -4.5756 },
  { id: 'aragon', name: 'Aragón', lat: 41.5118, lng: -0.6637 },
  { id: 'asturias', name: 'Asturias', lat: 43.3925, lng: -5.6608 },
  { id: 'cantabria', name: 'Cantabria', lat: 43.1977, lng: -4.0294 },
  { id: 'castilla-la-mancha', name: 'Castilla-La Mancha', lat: 39.5960, lng: -3.0450 },
  { id: 'castilla-leon', name: 'Castilla y León', lat: 41.6391, lng: -4.4302 },
  { id: 'cataluna', name: 'Cataluña', lat: 41.8375, lng: 1.5378 },
  { id: 'madrid', name: 'Comunidad de Madrid', lat: 40.3086, lng: -3.6844 },
  { id: 'comunidad-valenciana', name: 'C. Valenciana', lat: 39.4050, lng: -0.5250 },
  { id: 'extremadura', name: 'Extremadura', lat: 39.2260, lng: -6.1550 },
  { id: 'galicia', name: 'Galicia', lat: 42.7570, lng: -7.9108 },
  { id: 'rioja', name: 'La Rioja', lat: 42.2350, lng: -2.5000 },
  { id: 'murcia', name: 'Murcia', lat: 38.0000, lng: -1.5000 },
  { id: 'navarra', name: 'Navarra', lat: 42.6490, lng: -1.6090 },
  { id: 'pais-vasco', name: 'País Vasco', lat: 42.8841, lng: -1.9315 },
  
  // ISLAS Y CIUDADES AUTÓNOMAS
  { id: 'baleares', name: 'Islas Baleares', lat: 39.6000, lng: 3.0000 },
  { id: 'canarias', name: 'Canarias', lat: 28.4500, lng: -15.7000 },
  { id: 'ceuta', name: 'Ceuta', lat: 35.8894, lng: -5.3213 },
  { id: 'melilla', name: 'Melilla', lat: 35.2923, lng: -2.9501 },
];

export default function DkvMap() {
  const router = useRouter();
  const [hoveredInfo, setHoveredInfo] = useState<{id: string, name: string} | null>(null);

  const [viewState, setViewState] = useState({
    // AJUSTE MÓVIL: Bajamos latitud (39.5) para centrar visualmente y zoom 4.5 para que quepa todo el ancho
    latitude: 39.5000, 
    longitude: -3.703790,
    zoom: 4.5 // Zoom ideal para ver la península completa en pantallas estrechas
  });

  return (
    <div className="w-full h-full relative bg-dkv-gray-border">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        // CAMBIO CLAVE: 'positron-nolabels' elimina TODOS los textos del mapa base.
        mapStyle="https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        minZoom={3.5}
        maxZoom={12}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {COMMUNITIES.map((comm) => (
          <Marker 
            key={comm.id} 
            latitude={comm.lat} 
            longitude={comm.lng}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              router.push(`/dentistas/${comm.id}`);
            }}
          >
            <div 
              className="relative cursor-pointer group flex flex-col items-center"
              onMouseEnter={() => setHoveredInfo({ id: comm.id, name: comm.name })}
              onMouseLeave={() => setHoveredInfo(null)}
            >
              {/* Etiqueta Flotante (Tooltip) - Solo sale al interactuar */}
              <div className={`
                absolute bottom-full mb-2 px-3 py-1.5 bg-white border border-dkv-green rounded shadow-xl 
                whitespace-nowrap transition-all duration-200 z-50 pointer-events-none
                ${hoveredInfo?.id === comm.id ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
              `}>
                <span className="text-xs font-bold text-dkv-green-dark font-lemon uppercase tracking-wider">
                  {comm.name}
                </span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-dkv-green transform rotate-45"></div>
              </div>

              {/* Icono Pin */}
              <DkvPinIcon isHovered={hoveredInfo?.id === comm.id} />
            </div>
          </Marker>
        ))}

      </Map>
    </div>
  );
}