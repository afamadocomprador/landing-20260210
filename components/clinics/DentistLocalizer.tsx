'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ClinicMapBrowser from '@/components/clinics/ClinicMapBrowser';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ContentProps {
  h1: string;
  pH1: string;
}

export default function DentistLocalizer({ content }: { content: ContentProps }) {
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  const supabase = createClient();

  // LÓGICA PRINCIPAL DE CARGA
  const fetchClinics = async (lat?: number, lon?: number) => {
    setLoading(true);
    
    let rpcParams: any = { 
      p_province: null, 
      p_town: null, 
      p_postal_code: null,
      p_speciality: null 
    };

    // ESCENARIO A: Ubicación activada (Busca por cercanía 50km)
    if (lat && lon) {
      rpcParams = { ...rpcParams, p_lat: lat, p_long: lon, p_max_dist_meters: 50000 };
    } 
    // ESCENARIO B: Nacional (Carga una muestra o clusters - aquí limito a 100 para no explotar)
    // TODO: Idealmente usaríamos clusters server-side, por ahora cargamos Madrid por defecto o un set amplio
    else {
      rpcParams = { ...rpcParams, p_lat: 40.4168, p_long: -3.7038, p_max_dist_meters: 500000 }; 
    }

    const { data, error } = await supabase.rpc('get_service_points', rpcParams);

    if (!error && data) {
      setClinics(data);
    }
    setLoading(false);
  };

  // Intentar geolocalizar al montar (o esperar clic del usuario)
  useEffect(() => {
    // Estrategia híbrida: Cargamos mapa nacional primero para que no esté vacío
    fetchClinics(); 
    
    // Check permiso silencioso
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        requestLocation();
      }
    });
  }, []);

  const requestLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermission('granted');
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        fetchClinics(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("Ubicación denegada", err);
        setPermission('denied');
        setLoading(false);
      }
    );
  };

  return (
    <div className="w-full flex flex-col">
      {/* HERO SECTION */}
      <div className="bg-dkv-gray-light px-safe-x py-8 md:py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-dkv-green-dark mb-4 max-w-3xl mx-auto">
          {content.h1 || 'Dentistas DKV cerca de ti'}
        </h1>
        <p className="text-dkv-gray text-lg mb-8 max-w-2xl mx-auto">
          {content.pH1}
        </p>
        
        {/* BOTÓN PERMISO GPS */}
        {permission !== 'granted' && (
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4">
            <Button 
              onClick={requestLocation} 
              size="lg" 
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Usar mi ubicación actual
            </Button>
          </div>
        )}
      </div>

      {/* MAPA BROWSER */}
      <div className="relative w-full h-[65vh] border-y border-dkv-gray-border">
        <ClinicMapBrowser 
          clinics={clinics} 
          defaultCenter={userLocation || [40.4168, -3.7038]} // Madrid si no hay userLocation
          userLocation={userLocation}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-[2000] flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-dkv-green border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-dkv-green-dark font-medium">Buscando centros cercanos...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}