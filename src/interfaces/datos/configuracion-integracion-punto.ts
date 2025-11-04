/**
 * Configuración de Integración por Punto de Medición
 *
 * Define CÓMO sincronizar datos de un punto específico desde sistemas externos.
 * Mapea variables/tags externos a tipos de lectura canónicos.
 *
 * Casos de uso:
 * - Para "Booster Hospital" desde Zeus SCADA:
 *   • Variable "ZEUS-BOOST-HOSP.PressureIn" → Lectura "Booster Presión Entrada"
 *   • Variable "ZEUS-BOOST-HOSP.PressureOut" → Lectura "Booster Presión Salida"
 *   • Variable "ZEUS-BOOST-HOSP.Flow" → Lectura "Booster Caudal"
 *   • Sincronizar cada 5 minutos vía polling OPC UA
 *
 * - Para "Medidor Residencial 001" desde ATLAS:
 *   • Variable "ATL-RES-00123.accumulated_m3" → Lectura "Medidor Residencial Consumo"
 *   • Sincronizar cada 15 minutos vía API REST
 */

import { TipoLectura } from './lectura';
import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Métodos de sincronización disponibles
 */
export type MetodoSincronizacion =
  | 'polling'     // Sistema RIOTEC consulta periódicamente
  | 'push'        // Sistema externo envía datos cuando cambian
  | 'on_change'   // Sistema externo notifica cambios (webhook/MQTT)
  | 'manual';     // Sincronización manual/bajo demanda

/**
 * Estados de una configuración de integración
 */
export type EstadoConfiguracionIntegracion =
  | 'activa'           // Sincronización operativa
  | 'pausada'          // Pausada temporalmente
  | 'error'            // Error en última sincronización
  | 'desactivada';     // Desactivada permanentemente

/**
 * Mapeo de una variable externa a un tipo de lectura canónico
 */
export interface IMapeoVariable {
  // Identificación en sistema externo
  variableExterna: string;     // Tag/ID en sistema externo (ej: "ZEUS-BOOST-HOSP.PressureIn")
  tipoVariableExterna?: string; // Tipo en sistema externo (opcional)

  // Mapeo a modelo canónico
  tipoLecturaDestino: TipoLectura; // A qué tipo de lectura canónica mapea

  // Transformación de valores (opcional)
  transformacion?: string; // Expresión o fórmula de conversión (ej: "x * 0.1" para cambiar unidades)
  factorConversion?: number; // Factor multiplicador simple (alternativa a transformación)

  // Metadatos de mapeo
  descripcion?: string;
  activo: boolean;
}

/**
 * Configuración de integración para un punto de medición específico
 */
export interface IConfiguracionIntegracionPunto {
  _id?: string;

  // Relación con punto y fuente
  idPuntoMedicion: string;
  idFuenteDatos: string;
  idCliente: string;

  // Mapeo de variables externas → tipos de lectura
  mapaVariables: IMapeoVariable[];

  // Configuración de sincronización
  metodoSincronizacion: MetodoSincronizacion;
  frecuenciaSincronizacion?: number; // minutos (obligatorio si método es 'polling')

  // Configuración específica del protocolo
  configuracionProtocolo?: {
    // Para OPC UA
    nodeId?: string;
    browsePath?: string;

    // Para API REST
    endpoint?: string;
    metodoHTTP?: 'GET' | 'POST';
    parametrosQuery?: Record<string, string>;

    // Para MQTT
    topic?: string;

    // Genérico
    parametrosAdicionales?: Record<string, any>;
  };

  // Estado y monitoreo
  estado: EstadoConfiguracionIntegracion;
  ultimaSincronizacionExitosa?: string;
  ultimaSincronizacionIntento?: string;
  proximaSincronizacionProgramada?: string;

  // Errores
  ultimoError?: {
    timestamp: string;
    mensaje: string;
    codigo?: string;
  };
  contadorErroresConsecutivos?: number;

  // Metadatos operativos
  descripcion?: string;
  notas?: string;
  activa: boolean;
  fechaActivacion?: string;
  fechaDesactivacion?: string;

  metadatosAuditoria?: IMetadatosAuditoria;

  // Virtuals (poblados por backend)
  puntoMedicion?: any;  // IPuntoMedicion
  fuenteDatos?: any;    // IFuenteDatos
}

/**
 * DTO para crear configuración de integración
 */
export interface ICreateConfiguracionIntegracionPunto extends Omit<
  Partial<IConfiguracionIntegracionPunto>,
  '_id' | 'metadatosAuditoria' | 'puntoMedicion' | 'fuenteDatos' | 'ultimaSincronizacionExitosa' | 'ultimaSincronizacionIntento' | 'proximaSincronizacionProgramada' | 'ultimoError' | 'contadorErroresConsecutivos'
> {
  // Campos requeridos
  idPuntoMedicion: string;
  idFuenteDatos: string;
  idCliente: string;
  mapaVariables: IMapeoVariable[];
  metodoSincronizacion: MetodoSincronizacion;
  estado: EstadoConfiguracionIntegracion;
}

/**
 * DTO para actualizar configuración de integración
 */
export interface IUpdateConfiguracionIntegracionPunto extends Omit<
  Partial<IConfiguracionIntegracionPunto>,
  '_id' | 'idPuntoMedicion' | 'idFuenteDatos' | 'idCliente' | 'metadatosAuditoria' | 'puntoMedicion' | 'fuenteDatos'
> {}

/**
 * Array de métodos para iteración
 */
export const METODOS_SINCRONIZACION: MetodoSincronizacion[] = [
  'polling',
  'push',
  'on_change',
  'manual',
];

export const ESTADOS_CONFIGURACION_INTEGRACION: EstadoConfiguracionIntegracion[] = [
  'activa',
  'pausada',
  'error',
  'desactivada',
];
