
/**
 * Tipo de operación de sincronización
 */
export type TipoOperacionSincronizacion =
  | 'ingesta_lecturas'       // Importar lecturas desde sistema externo
  | 'ingesta_puntos'         // Importar/actualizar puntos de medición
  | 'ingesta_infraestructura' // Importar estaciones, equipos
  | 'reconciliacion'         // Re-sincronizar datos históricos
  | 'validacion'             // Validar integridad de datos
  | 'heartbeat'              // Verificación de conectividad
  | 'webhook'                // Evento push desde sistema externo
  | 'manual';                // Ejecución manual por operador


/**
 * Resultado de la sincronización
 */
export type ResultadoSincronizacion =
  | 'exito'           // Completado sin errores
  | 'exito_parcial'   // Completado con algunos errores no críticos
  | 'error'           // Falló completamente
  | 'timeout'         // Excedió tiempo máximo
  | 'cancelado'       // Cancelado manualmente
  | 'en_progreso';    // Aún ejecutándose

/**
 * Array de resultados (para iterar)
 */
export const RESULTADOS_SINCRONIZACION: ResultadoSincronizacion[] = [
  'exito',
  'exito_parcial',
  'error',
  'timeout',
  'cancelado',
  'en_progreso'
];

/**
 * Error individual durante sincronización
 */
export interface IErrorSincronizacion {
  timestamp: string;              // Momento del error (ISO 8601)
  tipo: string;                   // Tipo de error (ej: "TIMEOUT", "VALIDATION_ERROR", "API_ERROR")
  mensaje: string;                // Descripción del error
  codigoError?: string;           // Código HTTP o error code del sistema externo
  entidadAfectada?: {
    tipo: string;                 // "PuntoMedicion", "Lectura", etc.
    id?: string;                  // ID canónico (si existe)
    idExterno?: string;           // ID en sistema externo
  };
  contexto?: Record<string, any>; // Información adicional para debugging
}

/**
 * Estadísticas detalladas de la sincronización
 */
export interface IEstadisticasSincronizacion {
  // Contadores básicos
  totalRegistrosOrigen?: number;       // Total disponible en origen
  registrosProcesados: number;         // Registros procesados
  registrosCreados: number;            // Nuevos insertados
  registrosActualizados: number;       // Existentes actualizados
  registrosSinCambios: number;         // Sin cambios detectados
  registrosConErrores: number;         // Con errores
  registrosIgnorados?: number;         // Ignorados por reglas de negocio

  // Métricas de calidad
  porcentajeExito?: number;            // % de registros procesados OK
  tasaError?: number;                  // % de registros con error

  // Métricas de performance
  duracionMs: number;                  // Duración total en milisegundos
  duracionPromedioRegistroMs?: number; // Tiempo promedio por registro

  // Datos específicos por tipo de operación
  lecturasValidas?: number;            // Lecturas con calidad "valida"
  lecturasSospechosas?: number;        // Lecturas con calidad "sospechosa"
  lecturasError?: number;              // Lecturas con calidad "error"
  puntosConNuevosValores?: number;     // Puntos que recibieron nuevas lecturas
  puntosSinComunicacion?: number;      // Puntos sin lecturas

  // Metadatos adicionales
  otros?: Record<string, any>;         // Estadísticas específicas por fuente
}

/**
 * Registro de Sincronización - Auditoría de integraciones
 *
 * Documenta cada ejecución de sincronización con sistemas externos.
 *
 * Casos de uso:
 * - Debugging: "¿Por qué el medidor ATL-123 no tiene datos?"
 * - Monitoreo: Dashboard de salud de integraciones
 * - Alertas: Detectar degradación o fallos
 * - SLA: "Datos con máximo 30 min de antigüedad"
 * - Métricas: Tasa de éxito, duración promedio, calidad de datos
 *
 * Tipos de sincronización:
 * - Polling periódico (ej: ATLAS cada 15 min)
 * - Webhooks / Push events (ej: Zeus envía alerta)
 * - Reconciliación manual (operador ejecuta re-sync)
 * - Heartbeat (verificar conectividad)
 */
export interface IRegistroSincronizacion {
  _id?: string;

  // Identificación
  idCliente: string;                   // Cliente (multi-tenancy)
  idFuenteDatos: string;               // Fuente de datos sincronizada
  tipoOperacion: TipoOperacionSincronizacion;

  // Ejecución
  timestampInicio: string;             // Inicio de sincronización (ISO 8601)
  timestampFin?: string;               // Fin de sincronización (ISO 8601)
  resultado: ResultadoSincronizacion;
  mensajeResultado?: string;           // Descripción del resultado

  // Estadísticas
  estadisticas: IEstadisticasSincronizacion;

  // Errores
  errores?: IErrorSincronizacion[];    // Lista de errores (si hubo)
  erroresCriticos?: number;            // Cantidad de errores críticos
  erroresTotales?: number;             // Cantidad total de errores

  // Contexto
  usuarioEjecucion?: string;           // ID usuario (si fue manual)
  esManual?: boolean;                  // true si fue ejecutado manualmente
  parametros?: Record<string, any>;    // Parámetros de la sincronización

  // Metadatos
  metadatosAdicionales?: Record<string, any>; // Info específica por tipo de operación

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;              // Auto-generado (ISO 8601), inmutable

  // Virtuals (populados por query)
  cliente?: any;        // ICliente
  fuenteDatos?: any;    // IFuenteDatos
  usuario?: any;        // IUsuario
}

/**
 * DTO para crear un registro de sincronización
 *
 * Típicamente creado al INICIO de la sincronización con resultado='en_progreso',
 * luego actualizado al finalizar con resultado final y estadísticas.
 */
export interface ICreateRegistroSincronizacion extends Omit<
  Partial<IRegistroSincronizacion>,
  '_id' | 'cliente' | 'fuenteDatos' | 'usuario' | 'fechaCreacion'
> {
  idCliente: string;                           // Requerido
  idFuenteDatos: string;                       // Requerido
  tipoOperacion: TipoOperacionSincronizacion;  // Requerido
  timestampInicio: string;                     // Requerido
  resultado: ResultadoSincronizacion;          // Requerido (inicialmente 'en_progreso')
  estadisticas: IEstadisticasSincronizacion;   // Requerido (inicialmente todos en 0)
}

/**
 * DTO para actualizar un registro de sincronización
 *
 * Usado para actualizar el registro cuando la sincronización finaliza.
 */
export interface IUpdateRegistroSincronizacion extends Omit<
  Partial<IRegistroSincronizacion>,
  '_id' | 'idCliente' | 'idFuenteDatos' | 'tipoOperacion' | 'timestampInicio' | 'cliente' | 'fuenteDatos' | 'usuario' | 'fechaCreacion'
> {}
