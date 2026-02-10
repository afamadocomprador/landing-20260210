"use client";
import { ChevronDown } from "lucide-react";

export default function ScrollToMapButton() {
  const handleScroll = () => {
    const target = document.getElementById("mapa-buscador");
    if (target) {
      // Offset de 80px: esto evita que el mapa quede tapado por el breadcrumb
      const offset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="flex justify-center mb-8 relative z-20">
      <button
        onClick={handleScroll}
        className="bg-dkv-green text-white p-4 rounded-full shadow-xl hover:bg-dkv-green-dark transition-all animate-bounce"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
}