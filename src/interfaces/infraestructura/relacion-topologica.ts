/**
 * Relación Topológica entre Puntos de Medición
 *
 * Modela las relaciones hidráulicas y operativas entre puntos de la red de agua.
 * Permite representar la topología de la red: qué punto alimenta a cuál, circuitos, backups, etc.
 *
 * Casos de uso:
 * - "Perforación Edén" alimenta a "Booster Hospital"
 * - "Booster Hospital" distribuye a "Zona Residencial A" (50 medidores)
 * - Análisis de propagación de fallos: si cae "Booster X", ¿qué zonas se afectan?
 * - Cálculo de balance por sector: agua que entra vs agua que sale en un sub-circuito
 */

import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Tipos de relaciones topológicas entre puntos
 */
export type TipoRelacionTopologica =
  | 'alimenta_a'          // Punto A alimenta agua a punto B
  | 'controla'            // Punto A controla operación de punto B
  | 'pertenece_a_circuito' // Punto forma parte de un circuito específico
  | 'backup_de'           // Punto A es respaldo/redundancia de B
  | 'paralelo_con';       // Punto A trabaja en paralelo con B

/**
 * Estados posibles de una relación topológica
 */
export type EstadoRelacionTopologica =
  | 'activa'           // Relación operativa normal
  | 'inactiva'         // Relación desactivada temporalmente (mantenimiento)
  | 'desactivada';     // Relación eliminada permanentemente

/**
 * Relación direccional entre dos puntos de medición
 */
export interface IRelacionTopologica {
  _id?: string;

  // Multi-tenancy
  idCliente: string;
  idDistrito?: string; // Opcional - puede ser una relación a nivel división

  // Relación direccional (desde → hacia)
  idPuntoOrigen: string;  // "Desde" (upstream)
  idPuntoDestino: string; // "Hacia" (downstream)
  tipoRelacion: TipoRelacionTopologica;

  // Características técnicas de la relación
  capacidadNominal?: number; // m³/h que puede transferir esta conexión
  distanciaAproximada?: number; // metros de tubería entre puntos
  diametroTuberia?: number;  // mm de diámetro (si aplica)

  // Prioridad en caso de múltiples relaciones
  prioridad?: number; // 1 = principal, 2 = secundario, etc.

  // Estado
  estado: EstadoRelacionTopologica;
  fechaActivacion?: string;
  fechaDesactivacion?: string;

  // Metadatos operativos
  descripcion?: string;
  notas?: string;
  metadatosAuditoria?: IMetadatosAuditoria;

  // Virtuals (poblados por backend)
  puntoOrigen?: any;  // IPuntoMedicion
  puntoDestino?: any; // IPuntoMedicion
  distrito?: any;     // IDistrito
}

/**
 * DTO para crear relación topológica
 */
export interface ICreateRelacionTopologica extends Omit<
  Partial<IRelacionTopologica>,
  '_id' | 'metadatosAuditoria' | 'puntoOrigen' | 'puntoDestino' | 'distrito'
> {
  // Campos requeridos
  idCliente: string;
  idPuntoOrigen: string;
  idPuntoDestino: string;
  tipoRelacion: TipoRelacionTopologica;
  estado: EstadoRelacionTopologica;
}

/**
 * DTO para actualizar relación topológica
 */
export interface IUpdateRelacionTopologica extends Omit<
  Partial<IRelacionTopologica>,
  '_id' | 'idCliente' | 'idPuntoOrigen' | 'idPuntoDestino' | 'metadatosAuditoria' | 'puntoOrigen' | 'puntoDestino' | 'distrito'
> {}

/**
 * Array de tipos para iteración
 */
export const TIPOS_RELACION_TOPOLOGICA: TipoRelacionTopologica[] = [
  'alimenta_a',
  'controla',
  'pertenece_a_circuito',
  'backup_de',
  'paralelo_con',
];

export const ESTADOS_RELACION_TOPOLOGICA: EstadoRelacionTopologica[] = [
  'activa',
  'inactiva',
  'desactivada',
];
