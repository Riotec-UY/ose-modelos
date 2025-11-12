import { SistemaExternoConocido } from './sistema-externo';

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
 * Fuente de Datos - Instancia de sistema externo
 *
 * Representa una INSTANCIA específica de un sistema externo que provee datos.
 * La forma de interactuar con el sistema externo está dada por la implementación del conector específico.
 *
 * Ejemplos:
 * - "Zeus UGD Maldonado" → sistemaExterno: 'zeus-scada'
 * - "Zeus UGD Colonia" → sistemaExterno: 'zeus-scada'
 * - "ATLAS Maldonado" → sistemaExterno: 'atlas-telemetria'
 */
export interface IFuenteDatos {
  _id?: string;
  idCliente: string;               // Referencia a Cliente

  // Identificación
  nombre: string;                  // ej: "Zeus UGD Maldonado"
  codigo?: string;                 // Código interno único
  sistemaExterno: SistemaExternoConocido; // Sistema externo (requerido)

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
  sistemaExterno: SistemaExternoConocido; // Requerido
  estado: EstadoFuenteDatos; // Requerido
}

/**
 * DTO para actualizar una fuente de datos
 */
export interface IUpdateFuenteDatos extends Omit<
  Partial<IFuenteDatos>,
  '_id' | 'cliente' | 'fechaCreacion'
> {}
