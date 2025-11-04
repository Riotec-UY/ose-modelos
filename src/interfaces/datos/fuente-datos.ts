
/**
 * Tipo de fuente de datos externa
 */
export type TipoFuenteDatos =
  | 'scada'              // Sistema SCADA (Zeus, iFIX, etc.)
  | 'gestion_comercial'  // Sistema de gestión comercial (ATLAS)
  | 'gis'                // Sistema de información geográfica
  | 'sensor_iot'         // Sensores IoT directos
  | 'manual'             // Carga manual
  | 'otro';              // Otros sistemas

/**
 * Estado de la fuente de datos
 */
export type EstadoFuenteDatos =
  | 'activa'        // Operativa y sincronizando
  | 'inactiva'      // Desactivada temporalmente
  | 'error'         // Con errores de conexión
  | 'mantenimiento' // En mantenimiento
  | 'desactivada';  // Eliminada permanentemente

/**
 * Fuente de Datos - Sistema externo de origen
 *
 * Representa un sistema externo que provee datos al sistema RIOTEC.
 *
 * Ejemplos:
 * - ATLAS Maldonado (gestión comercial)
 * - Zeus SCADA (infraestructura)
 * - ArcGIS (geoespacial)
 */
export interface IFuenteDatos {
  _id?: string;
  idCliente: string;               // Referencia a Cliente

  // Identificación
  nombre: string;                  // ej: "ATLAS Maldonado"
  codigo?: string;                 // Código interno único
  tipo: TipoFuenteDatos;           // Tipo de fuente

  // Configuración de conexión
  configuracion?: {
    url?: string;                  // URL base del sistema
    tipoAutenticacion?: 'basic' | 'bearer' | 'apikey' | 'oauth2' | 'none';
    metodoIntegracion?: 'api_rest' | 'opc_ua' | 'mqtt' | 'database' | 'csv' | 'manual';
    frecuenciaSincronizacion?: number; // Minutos entre sincronizaciones
    ultimaSincronizacion?: string; // ISO 8601 timestamp
    proximaSincronizacion?: string; // ISO 8601 timestamp
  };

  // Estado
  estado: EstadoFuenteDatos;
  mensajeEstado?: string;          // Mensaje descriptivo del estado
  erroresRecientes?: {
    timestamp: string;
    mensaje: string;
    codigoError?: string;
  }[];

  // Metadatos adicionales
  metadatos?: Record<string, any>; // Configuraciones específicas por tipo

  // Auditoría
  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;  // Auto-generado (ISO 8601), inmutable

  // Virtuals
  cliente?: any; // ICliente
}

/**
 * DTO para crear una fuente de datos
 */
export interface ICreateFuenteDatos extends Omit<
  Partial<IFuenteDatos>,
  '_id' | 'cliente' | 'fechaCreacion'
> {
  idCliente: string;    // Requerido
  nombre: string;       // Requerido
  tipo: TipoFuenteDatos; // Requerido
  estado: EstadoFuenteDatos; // Requerido
}

/**
 * DTO para actualizar una fuente de datos
 */
export interface IUpdateFuenteDatos extends Omit<
  Partial<IFuenteDatos>,
  '_id' | 'cliente' | 'fechaCreacion'
> {}
