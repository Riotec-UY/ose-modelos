/**
 * Parámetros de query para endpoints GET
 * Permite aplicar filtros con formato MongoDB directamente
 *
 * Ejemplo de uso:
 * ```typescript
 * const query: IQueryParams = {
 *   filter: { tipo: 'residencial', 'ubicacion.ciudad': 'Maldonado' },
 *   limit: 100,
 *   skip: 0,
 *   sort: { fechaCreacion: -1 }
 * };
 * ```
 */
export interface IQueryParams {
  filter?: Record<string, any>;      // Filtros MongoDB
  limit?: number;                     // Límite de resultados
  skip?: number;                      // Offset para paginación
  sort?: Record<string, 1 | -1>;     // Ordenamiento (1: ASC, -1: DESC)
  projection?: Record<string, 0 | 1>; // Campos a incluir/excluir
  populate?: string[];                // Referencias a poblar
}

/**
 * Metadatos de paginación para respuestas de listados
 */
export interface IPaginacion {
  total: number;        // Total de documentos que cumplen el filtro
  limit: number;        // Límite aplicado
  skip: number;         // Offset aplicado
  pagina: number;       // Página actual (calculado)
  totalPaginas: number; // Total de páginas (calculado)
}
