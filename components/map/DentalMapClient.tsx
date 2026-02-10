"use client";

import { MapContainer, TileLayer, Marker, useMap, ZoomControl, GeoJSON } from "react-leaflet"; // <--- 1. Importar GeoJSON
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export interface MapMarkerData {
  name: string; lat: number; lng: number; count: number; slug: string;
}

interface MapProps {
  marks?: MapMarkerData[];
  initialCenter?: [number, number];
  initialZoom?: number;
  modo?: 'FIT_BOUNDS' | 'CENTER_ZOOM';
  tileStyle?: string; 
  geoJsonUrl?: string; // <--- SOLO EL TIPO (sin el valor)
}

const createCustomIcon = (count: number, name: string) => {
  const displayName = name.length > 15 ? name.substring(0, 12) + "..." : name;
  const htmlContent = `
    <div style="display: flex; flex-direction: column; align-items: center; width: 80px; cursor: pointer;">
      <div style="position: relative; width: 38px; height: 46px;">
        <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 0.5C8.78273 0.5 0.5 8.78273 0.5 19C0.5 30.5 19 45.5 19 45.5C19 45.5 37.5 30.5 37.5 19C37.5 8.78273 29.2173 0.5 19 0.5Z" fill="#849700" stroke="white" stroke-width="1"/>
          <circle cx="19" cy="19" r="14" fill="white"/>
        </svg>
        <div style="position: absolute; top: 6px; left: 0; width: 38px; height: 26px; display: flex; align-items: center; justify-content: center; color: #033B37; font-weight: 700; font-size: 14px; font-family: sans-serif; pointer-events: none;">${count}</div>
      </div>
      <div style="margin-top: 4px; background-color: white; border: 1px solid #849700; color: #033B37; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); line-height: 1.1;">${displayName}</div>
    </div>`.replace(/\s+/g, ' ').trim();
  return L.divIcon({ className: 'custom-pin', html: htmlContent, iconSize: [80, 75], iconAnchor: [40, 46] });
};

function MapController({ marks, modo, initialCenter, initialZoom, setReady }: any) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    setReady(true);
    map.invalidateSize();
    if (modo === 'CENTER_ZOOM' && initialCenter) {
      map.setView(initialCenter, initialZoom || 6);
    } else if (modo === 'FIT_BOUNDS' && marks && marks.length > 0) {
      const pts = marks.filter((m: any) => m.lat != null).map((m: any) => [m.lat, m.lng]);
      if (pts.length > 0) map.fitBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 12 });
    }
  }, [marks, modo, initialCenter, initialZoom, map, setReady]);
  return null;
}

export default function DentalMapClient({ 
  marks = [], 
  initialCenter = [40.41, -3.70],
  initialZoom = 6,
  modo = 'CENTER_ZOOM',
  tileStyle = 'light_all',
  geoJsonUrl = "/maps/autonomous_regions.geojson" // <--- AQUÍ VA EL VALOR POR DEFECTO
}: MapProps) {
  const [mapIsReady, setMapIsReady] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null); // <--- 4. Estado para los datos
  const router = useRouter();

  const tileUrl = `https://{s}.basemaps.cartocdn.com/${tileStyle}/{z}/{x}/{y}{r}.png`;

  // --- 5. Efecto para cargar el fichero externo ---
  useEffect(() => {
    if (!geoJsonUrl) {
        setGeoJsonData(null);
        return;
    }
    
    fetch(geoJsonUrl)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar GeoJSON");
            return response.json();
        })
        .then(data => setGeoJsonData(data))
        .catch(err => console.error("Error cargando contorno:", err));
  }, [geoJsonUrl]);

  const renderedMarkers = useMemo(() => {
    if (!mapIsReady) return null;
    return marks.filter(m => m.lat != null).map((m, idx) => (
      <Marker 
        key={`m-${idx}-${m.slug}`} 
        position={[m.lat, m.lng]} 
        icon={createCustomIcon(m.count, m.name)}
        eventHandlers={{
          click: () => {
            if (m.slug) router.push(`/dentistas/${m.slug}`); // Aquí podrías añadir también ?origen=mapa si usas la estrategia de URL
          },
        }}
      />
    ));
  }, [marks, mapIsReady, router]);

  // Estilo del contorno (puedes parametrizarlo también si quieres)
  const geoJsonStyle = {
    color: "#033B37", // Color del borde (Naranja/Rojo)
    weight: 1,        // Grosor
    opacity: 0.2,        // Grosor
    fillColor: "#FFFFFF",
    fillOpacity: 0.5  // Transparencia del relleno (muy sutil)
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <MapController marks={marks} modo={modo} initialCenter={initialCenter} initialZoom={initialZoom} setReady={setMapIsReady} />
        <ZoomControl position="topright" />
        <TileLayer url={tileUrl} attribution='&copy; CARTO' />
        
        {/* --- 6. Renderizado del Contorno --- */}
        {geoJsonData && <GeoJSON data={geoJsonData} style={geoJsonStyle} filter={(feature) => {
    // A veces la propiedad es "name", "nombre" o "NAME_1". Revisa tu archivo.
    return feature.properties.name === "Aragón" || feature.properties.nombre === "Aragón";
  }}/>}

        {renderedMarkers}
      </MapContainer>
    </div>
  );
}