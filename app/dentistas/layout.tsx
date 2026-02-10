// app/dentistas/layout.tsx
import { NavigationProvider } from "@/context/NavigationContext";

export default function DentistasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      {/* Este layout envuelve a todas las páginas 
          dentro de la carpeta /dentistas 
      */}
      {children}
    </NavigationProvider>
  );
}