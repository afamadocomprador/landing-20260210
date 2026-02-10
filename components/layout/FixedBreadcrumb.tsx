"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface FixedBreadcrumbProps {
  items: BreadcrumbItem[]; 
}

export default function FixedBreadcrumb({ items }: FixedBreadcrumbProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efecto Auto-scroll al final
  useEffect(() => {
    if (navRef.current && items && items.length > 0) {
      requestAnimationFrame(() => {
        if (navRef.current) {
          navRef.current.scrollLeft = navRef.current.scrollWidth;
        }
      });
    }
  }, [items]);

  if (!items) return null;

  return (
    <div
      className={`
        fixed left-0 w-full z-[1015] 
        transition-all duration-300 ease-in-out
        bg-white/95 backdrop-blur-sm border-b border-gray-100
        px-safe-x md:px-6 py-2
        shadow-sm
        ${isScrolled ? "top-[70px]" : "top-[110px]"} 
      `}
    >
      <div className="container mx-auto">
        <nav 
          ref={navRef}
          aria-label="Breadcrumb"
          className="
            flex items-center justify-start gap-2 
            text-xs text-gray-500 font-fsme uppercase tracking-wider 
            whitespace-nowrap
            overflow-x-auto    
            scrollbar-hide     
            mask-linear-fade   
            pr-8               
          "
        >
          {/* ENLACE BASE: DENTISTAS (Antes Inicio) */}
          <Link 
            href="/" 
            className="hover:text-dkv-green flex items-center gap-1 transition-colors shrink-0"
          >
            <Home className="w-3 h-3" /> 
            {/* Texto cambiado aquí */}
            <span className="sr-only">Dentistas</span> 
            <span aria-hidden="true">Dentistas</span>
          </Link>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <div 
                key={item.href} 
                className="flex items-center gap-2 shrink-0"
              >
                <ChevronRight className="w-3 h-3 text-dkv-gray/50" />
                
                <Link
                  href={item.href}
                  aria-current={isLast ? "page" : undefined}
                  className={`
                    transition-colors
                    ${isLast 
                      ? "text-dkv-green-dark font-bold pointer-events-none cursor-default" 
                      : "hover:text-dkv-green"
                    }
                  `}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}