import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

// Motor de datos
import { getLevelData } from "@/lib/level-engine";

// Componentes UI
import DentistsContainer from "@/components/dentists/DentistsContainer";
import DentistHero from "@/components/hero/DentistHero";
import FixedBreadcrumb from "@/components/layout/FixedBreadcrumb";
import ScrollToMapButton from "@/components/dentists/ScrollToMapButton";
import RelatedLinks from "@/components/dentists/links/RelatedLinks"; // <--- Componente Nuevo

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug?: string[] };
}

export default async function DentistasPage({ params }: PageProps) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const currentSlug = params.slug && params.slug.length > 0 ? params.slug[0] : "";
  const level = currentSlug === "" ? "01" : "02"; 

  try {
    // 1. Obtener datos (Incluye ahora relatedLinks en la respuesta)
    const navigationData = await getLevelData(
      supabase,
      "sin informar",
      level,
      currentSlug
    );

    return (
      <div className="flex flex-col min-h-screen bg-white font-fsme">
        <FixedBreadcrumb items={navigationData.seo.breadcrumbs} />

        <DentistHero 
          h1={navigationData.seo.h1}
          totalDentistas={navigationData.seo.totalDentistasHero}
          totalCentros={navigationData.seo.totalCentrosHero}
        />

        <div className="pt-10">
          <ScrollToMapButton />
        </div>

        <section id="mapa-buscador" className="relative flex-1 flex flex-col pt-4">
          <DentistsContainer initialData={navigationData} />
        </section>

        {/* 2. NUEVO: Componente de Enlaces Relacionados (datos vienen del engine) */}
        <RelatedLinks data={navigationData.relatedLinks} />

      </div>
    );
  } catch (e) {
    console.error("❌ PAGE ERROR:", e);
    return notFound();
  }
}
