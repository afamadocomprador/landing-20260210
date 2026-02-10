/**
 * Traduce fragmentos de WHERE SQL a métodos de Supabase (PostgREST)
 * Soporta: =, IN, LIKE e ignores para "TRUE"
 * Optimizado para limpiar comillas simples y dobles en listas IN.
 */
export function translateSqlToSupabase(query: any, sqlClause: string | null | undefined) {
  // 1. Guardrail: Si no hay filtro o es "true", devolvemos la query intacta
  if (!sqlClause || sqlClause.toLowerCase() === "true" || sqlClause.trim() === "") {
    return query;
  }

  // 2. Separamos las condiciones por el operador AND (insensible a mayúsculas/minúsculas)
  const conditions = sqlClause.split(/\s+AND\s+/i);

  conditions.forEach((condition) => {
    const trimmed = condition.trim();

    // CASO: province IN ('Huesca', 'Teruel', 'Zaragoza')
    if (trimmed.toUpperCase().includes(" IN ")) {
      const [column, rest] = trimmed.split(/\s+IN\s+/i);
      
      // Extraemos el contenido entre los paréntesis
      const matches = rest.match(/\(([^)]+)\)/);
      
      if (matches && matches[1]) {
        // Explicación Senior:
        // Usamos una regex para separar por comas, pero limpiando 
        // cualquier combinación de comillas simples ('), dobles (") y espacios.
        const values = matches[1]
          .split(",")
          .map(v => v.trim().replace(/^['"]|['"]$/g, ""))
          .filter(v => v !== ""); // Evitamos strings vacíos

        // Ejecutamos el filtro pasándole el array de strings LIMPIOS
        query = query.in(column.trim(), values);
      }
    } 
    // CASO: province LIKE '%zara%'
    else if (trimmed.toUpperCase().includes(" LIKE ")) {
      const [column, value] = trimmed.split(/\s+LIKE\s+/i);
      const cleanValue = value.trim().replace(/^['"]|['"]$/g, "");
      query = query.ilike(column.trim(), cleanValue);
    }
    // CASO: province = 'Almería'
    else if (trimmed.includes("=")) {
      const [column, value] = trimmed.split("=").map(s => s.trim());
      const cleanValue = value.replace(/^['"]|['"]$/g, "");
      query = query.eq(column, cleanValue);
    }
  });

  return query;
}