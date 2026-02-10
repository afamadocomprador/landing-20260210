"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Clinic } from '@/types/database';

export interface NavigationState {
  nivelInicial: string;
  nivelFinal: string;
  entidadId: string | null;
  mapa: {
    marks: any[];
    modo: 'FIT_BOUNDS' | 'CENTER_ZOOM';
    centro?: [number, number];
    zoom?: number;
    tileStyle: string; // <--- NUEVO: Para elegir el estilo de tiles
  };
  lista: {
    totalDentistas: number;
    totalCentros: number;
    clinics: Clinic[];
    estadoInicial: 'CLOSED' | 'HALF' | 'EXPANDED';
  };
  seo: {
    totalDentistasHero: number;
    totalCentrosHero: number;
    h1: { dark: string; normal: string; };
    breadcrumbs: Array<{ label: string; href: string }>;
    enlacesSugeridos: Array<{ label: string; href: string; tipo: string }>;
    title: string;
    description: string;
  };
}

const initialState: NavigationState = {
  nivelInicial: "sin informar",
  nivelFinal: "01",
  entidadId: null,
  mapa: { 
    marks: [], 
    modo: 'CENTER_ZOOM', 
    centro: [40.41, -3.70], 
    zoom: 6,
    tileStyle: 'light_all' 
  },
  lista: { totalDentistas: 0, totalCentros: 0, clinics: [], estadoInicial: 'CLOSED' },
  seo: {
    totalDentistasHero: 0,
    totalCentrosHero: 0,
    h1: { dark: "", normal: "" },
    breadcrumbs: [],
    enlacesSugeridos: [],
    title: "",
    description: ""
  }
};

interface NavigationContextType {
  state: NavigationState;
  updateNavigation: (newState: Partial<NavigationState>) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>(initialState);

  const updateNavigation = useCallback((newState: Partial<NavigationState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  return (
    <NavigationContext.Provider value={{ state, updateNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation debe ser usado dentro de un NavigationProvider');
  }
  return context;
}