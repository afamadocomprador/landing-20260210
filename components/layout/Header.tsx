"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  onOpenCalculator?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Seguros", href: "#seguros", ariaLabel: "Ver tipos de seguros dentales" },
  { label: "Clínicas", href: "#clinicas", ariaLabel: "Buscar clínicas dentales" },
  { label: "Promociones", href: "#promociones", ariaLabel: "Ver ofertas actuales" },
];

export default function Header({ onOpenCalculator }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCta, setShowCta] = useState(false);

  const handleScroll = useCallback(() => {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      setShowCta(scrollY > 350);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 w-full z-[1020] transition-all duration-300 ease-in-out border-b border-white/10 ${
        isScrolled
          ? "h-[70px] bg-dkv-green/95 backdrop-blur-sm shadow-dkv-card" 
          : "h-[110px] bg-dkv-green" 
      }`}
    >
      <div className="container mx-auto h-full px-safe-x md:px-6 flex items-center justify-between">
        
        {/* --- LOGOTIPO --- */}
        <div className="relative flex items-center h-full shrink-0">
           <Link 
             href="/" 
             aria-label="Volver al inicio - DKV Dentisalud"
             className="relative flex items-center transition-all duration-300"
           >
             <div 
               className={`relative transition-all duration-300 overflow-hidden flex items-center ${
                 isScrolled ? 'w-[140px]' : 'w-[180px] md:w-[220px]'
               }`}
             >
                {/* CORRECCIÓN APLICADA: dkv-logo.png */}
                <Image 
                  src="/images/dkv-logo.png"
                  alt="DKV Seguros Médicos" 
                  width={220}
                  height={90}
                  className="w-full h-auto object-contain object-left"
                  priority 
                />
             </div>
           </Link>
        </div>

        {/* --- NAVEGACIÓN DESKTOP --- */}
        <div className="flex items-center gap-6 lg:gap-10">
          <nav className="hidden md:flex gap-6 lg:gap-8" role="navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.ariaLabel}
                className="text-white font-fsme text-sm lg:text-base font-bold hover:text-white/80 transition-colors uppercase tracking-widest relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
          
          {/* --- BOTÓN CTA (STICKY) --- */}
          <div 
            className={`transition-all duration-500 ease-out transform ${
              showCta 
                ? "opacity-100 translate-y-0 pointer-events-auto" 
                : "opacity-0 translate-y-4 pointer-events-none hidden md:block"
            }`}
            aria-hidden={!showCta}
          >
            <button
              onClick={onOpenCalculator}
              className="
                bg-white text-dkv-green hover:bg-gray-100 
                font-lemon tracking-widest text-xs md:text-sm 
                h-10 px-6 
                rounded-btn 
                shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                transition-all duration-300
                flex items-center justify-center
                uppercase font-bold
              "
              aria-label="Abrir calculadora de precios"
            >
              Calcula tu precio
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}