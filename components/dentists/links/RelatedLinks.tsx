import Link from "next/link";
import { ArrowUp, MapPin, Map, Navigation, Layers, MapPinned } from "lucide-react"; // Añadido MapPinned para la nueva sección
import { RelatedLinksData, LinkSection } from "@/services/getEnlaces"; 

interface RelatedLinksProps {
  data: RelatedLinksData;
}

// Subcomponente reutilizable
const RenderSection = ({ section, icon: Icon, type }: { section: LinkSection, icon: any, type: 'grid' | 'list' }) => (
  <div className="space-y-5">
    <h3 className="text-dkv-gray text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
      <Icon className="w-4 h-4 text-dkv-green" />
      {section.title}
    </h3>
    
    <div className={`
      ${type === 'grid' 
        ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
        : 'columns-2 md:columns-3 lg:columns-4 gap-x-8 space-y-2' 
      }
    `}>
      {section.items.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`
            group transition-all
            ${type === 'grid' 
              ? 'flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-dkv-green hover:shadow-md' 
              : 'block break-inside-avoid text-sm text-gray-500 hover:text-dkv-green hover:underline py-1'
            }
          `}
        >
          <span className={`${type === 'grid' ? 'text-sm font-medium text-gray-700 group-hover:text-dkv-green-dark' : ''}`}>
            {link.label}
          </span>
        </Link>
      ))}
    </div>
  </div>
);

export default function RelatedLinks({ data }: RelatedLinksProps) {
  // Protección (Incluyendo la nueva sección)
  if (!data || (
      !data.madre && 
      !data.cercanas && 
      !data.hermanas && 
      !data.comarcas && 
      !data.hijas && 
      !data.comarcas_sin_dentistas
  )) {
      return null;
  }

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200 font-fsme">
      <div className="container mx-auto px-4 md:px-10 space-y-16">
        
        {/* 1. MADRE */}
        {data.madre && data.madre.items.length > 0 && (
           <div className="w-full">
             <Link 
               href={data.madre.items[0].href}
               className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dkv-gray hover:text-dkv-green transition-colors border-b border-gray-100 pb-2 w-full"
               title={`Ir a ${data.madre.items[0].label}`}
             >
                <ArrowUp className="w-4 h-4 text-dkv-green group-hover:-translate-y-1 transition-transform" />
                <span>{data.madre.title}</span>
             </Link>
           </div>
        )}

        {/* 2. CERCANAS (Listado Vertical) */}
        {data.cercanas && <RenderSection section={data.cercanas} icon={MapPin} type="list" />}

        {/* 3. HERMANAS (Listado Vertical) */}
        {data.hermanas && <RenderSection section={data.hermanas} icon={Navigation} type="list" />}

        {/* 4. COMARCAS (Listado Vertical) */}
        {data.comarcas && <RenderSection section={data.comarcas} icon={Layers} type="list" />}

        {/* 5. COMARCAS SIN DENTISTAS (NUEVO - Listado Vertical) */}
        {data.comarcas_sin_dentistas && <RenderSection section={data.comarcas_sin_dentistas} icon={MapPinned} type="list" />}

        {/* 6. HIJAS (HUBS / LOCALIDADES) - RESTAURADO A LISTADO VERTICAL */}
        {data.hijas && <RenderSection section={data.hijas} icon={Map} type="list" />}

      </div>
    </section>
  );
}