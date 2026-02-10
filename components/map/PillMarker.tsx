import React from 'react';

interface PillMarkerProps {
  label: string;
  count: string | number;
}

const PillMarker: React.FC<PillMarkerProps> = ({ label, count }) => {
  // --- LÓGICA DE ADAPTACIÓN (VERTICAL) ---
  // El ancho depende del nombre de la comunidad (Arial Black es ancho)
  const width = Math.max(65, label.length * 8 + 20);
  const height = 75; // Altura fija para mantener consistencia visual
  const borderRadius = width / 2;

  return (
    <div className="relative flex flex-col items-center justify-center group" 
         style={{ width: `${width + 20}px`, height: `${height + 30}px` }}>
      
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 group-hover:scale-110"
      >
        <defs>
          {/* Sombra de la cápsula */}
          <filter id="capsule-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
            <feOffset dx="0" dy="3" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Degradado Superior (Blanco Glossy) */}
          <linearGradient id="grad-top-white" x1="0" y1="0" x2="0" y2={height / 2} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>

          {/* Degradado Inferior (Verde DKV #849700) */}
          <linearGradient id="grad-bot-green" x1="0" y1={height / 2} x2="0" y2={height} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A5B826" />
            <stop offset="100%" stopColor="#849700" />
          </linearGradient>

          {/* Brillo especular superior curvo */}
          <linearGradient id="grad-specular" x1="0" y1="5" x2="0" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g filter="url(#capsule-shadow)">
          {/* Parte Superior: Blanca / Nombre */}
          <path
            d={`M0 ${borderRadius}C0 ${borderRadius/3} ${borderRadius/3} 0 ${borderRadius} 0C${width - borderRadius/3} 0 ${width} ${borderRadius/3} ${width} ${borderRadius}V${height/2}H0V${borderRadius}Z`}
            fill="url(#grad-top-white)"
          />
          
          {/* Parte Inferior: Verde / Número */}
          <path
            d={`M0 ${height/2}H${width}V${height - borderRadius}C${width} ${height - borderRadius/3} ${width - borderRadius/3} ${height} ${width - borderRadius} ${height}C${borderRadius/3} ${height} 0 ${height - borderRadius/3} 0 ${height - borderRadius}V${height/2}Z`}
            fill="url(#grad-bot-green)"
          />

          {/* Brillo de cristal superior (Highlight) */}
          <ellipse cx={width / 2} cy="12" rx={width * 0.35} ry="6" fill="url(#grad-specular)" />
        </g>

        {/* Texto Nombre (Arriba - Verde Oscuro DKV) */}
        <text
          x={width / 2}
          y={height / 2 - 8}
          fill="#033B37"
          fontSize="9"
          fontWeight="900"
          fontFamily="Arial Black, sans-serif"
          textAnchor="middle"
          className="uppercase"
        >
          {label}
        </text>

        {/* Texto Número (Abajo - Blanco) */}
        <text
          x={width / 2}
          y={height / 2 + 22}
          fill="white"
          fontSize="18"
          fontWeight="900"
          fontFamily="Arial Black, sans-serif"
          textAnchor="middle"
          style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.4))' }}
        >
          {count}
        </text>
      </svg>

      {/* Sombra de suelo (Floor Shadow) ajustada a la forma vertical */}
      <div 
        className="absolute bottom-2 w-10 h-2 bg-black opacity-20"
        style={{ 
          borderRadius: '100%', 
          filter: 'blur(5px)',
          transform: 'scaleX(1)'
        }}
      />
    </div>
  );
};

export default PillMarker;