/**
 * Serie Temporal - Conjunto ordenado de lecturas
 *
 * Representa un conjunto de lecturas ordenadas cronológicamente
 * de un mismo punto de medición.
 *
 * Nota: Esta interfaz es principalmente para respuestas de API
 * que agregan múltiples lecturas. No se persiste directamente en BD.
 *
 * Las lecturas individuales se almacenan en la colección 'lecturas'.
 */
export interface ISerieTemporal {
  // Identificación
  idPuntoMedicion: string;         // Referencia a PuntoMedicion
  tipoLectura?: string;            // Tipo de lectura (opcional, para filtrar)

  // Período
  fechaInicio: string;             // ISO 8601
  fechaFin: string;                // ISO 8601

  // Lecturas ordenadas
  lecturas: any[];                 // ILectura[] - Lecturas en orden cronológico

  // Estadísticas agregadas
  estadisticas?: {
    cantidad: number;              // Cantidad de lecturas
    minimo?: number;               // Valor mínimo
    maximo?: number;               // Valor máximo
    promedio?: number;             // Valor promedio
    mediana?: number;              // Valor mediano
    desviacionEstandar?: number;   // Desviación estándar
    cantidadInterpoladas?: number; // Cantidad de lecturas interpoladas
    cantidadErrores?: number;      // Cantidad de lecturas con error
  };

  // Metadata
  generadoEn?: string;             // ISO 8601 - cuándo se generó esta serie
  duracionQuery?: number;          // Milisegundos que tomó generar la serie
}

/**
 * Parámetros para solicitar una serie temporal
 */
export interface IQuerySerieTemporal {
  idPuntoMedicion: string;         // Requerido
  tipoLectura?: string;            // Opcional - filtrar por tipo
  fechaInicio: string;             // Requerido - ISO 8601
  fechaFin: string;                // Requerido - ISO 8601
  incluirEstadisticas?: boolean;   // Incluir estadísticas agregadas
  interpolarGaps?: boolean;        // Interpolar valores faltantes
  resolucion?: 'raw' | '1min' | '5min' | '15min' | '1h' | '1d'; // Resolución de agregación
}
