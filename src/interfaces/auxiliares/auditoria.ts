/**
 * Auditoría - Trazabilidad completa de cambios en el sistema
 *
 * Patrón GAS/INSIDE: Colección separada con snapshots completos.
 *
 * Este patrón permite:
 * - Trazabilidad completa: Quién, cuándo, qué cambió
 * - Snapshots inmutables: Se guarda el estado completo del dato
 * - Auditoría de borrados: Los datos eliminados quedan registrados
 * - Compliance regulatorio: Cumple con requisitos de servicios públicos
 * - Entidades limpias: No contamina documentos principales con metadatos
 *
 * Implementación:
 * - Interceptor automático en NestJS que captura POST/PUT/DELETE
 * - Índices optimizados por cliente, fecha y entidad
 * - TTL opcional para retención de datos según políticas
 *
 * @see GAS/INSIDE - Patrón probado en producción
 */

/**
 * Métodos HTTP auditables
 */
export type MetodoAuditoria = 'post' | 'put' | 'delete';


/**
 * Tipos de entidades auditables
 *
 * Lista de todas las entidades del sistema que se auditan.
 * Actualizar cuando se agreguen nuevas entidades críticas.
 */
export type EntidadAuditable =
  // Organizacional
  | 'clientes'
  | 'divisiones'
  | 'jefaturas'
  | 'distritos'
  // Infraestructura
  | 'puntosMedicion'
  | 'relacionesTopologicas'
  // Datos
  | 'fuentesDatos'
  | 'referenciasExternas'
  // Análisis
  | 'balancesHidricos'
  | 'anomalias'
  // Seguridad
  | 'usuarios'
  | 'sesiones';

export const ENTIDADES_AUDITABLES: EntidadAuditable[] = [
  'clientes',
  'divisiones',
  'jefaturas',
  'distritos',
  'puntosMedicion',
  'relacionesTopologicas',
  'fuentesDatos',
  'referenciasExternas',
  'balancesHidricos',
  'anomalias',
  'usuarios',
  'sesiones',
];

/**
 * Auditoría - Registro inmutable de cambios
 *
 * Cada auditoría registra UN cambio (creación, modificación o borrado)
 * con el snapshot completo del dato en ese momento.
 *
 * Ejemplos:
 *
 * POST (Creación):
 * {
 *   entidad: 'clientes',
 *   metodo: 'post',
 *   dato: { _id: 'cli-001', nombre: 'OSE Uruguay', ... },
 *   idUsuario: 'user-123',
 *   fechaCreacion: '2025-11-04T10:00:00Z'
 * }
 *
 * PUT (Modificación):
 * {
 *   entidad: 'clientes',
 *   metodo: 'put',
 *   dato: { _id: 'cli-001', nombre: 'OSE Uruguay v2', ... },  // ← Estado NUEVO completo
 *   idUsuario: 'user-456',
 *   fechaCreacion: '2025-11-04T15:00:00Z'
 * }
 *
 * DELETE (Borrado):
 * {
 *   entidad: 'clientes',
 *   metodo: 'delete',
 *   dato: { _id: 'cli-001', nombre: 'OSE Uruguay v2', ... },  // ← Estado antes de borrar
 *   idUsuario: 'user-admin',
 *   fechaCreacion: '2025-11-04T20:00:00Z'
 * }
 */
export interface IAuditoria {
  _id?: string;

  /** Nombre de la entidad modificada (plural, lowercase) */
  entidad: EntidadAuditable;

  /** Método HTTP que disparó el cambio */
  metodo: MetodoAuditoria;

  /**
   * Snapshot completo del dato en este momento
   *
   * - POST: El dato recién creado
   * - PUT: El dato después de la modificación
   * - DELETE: El dato antes de eliminarse
   */
  dato: Object;

  /** ID del usuario que realizó el cambio */
  idUsuario: string;

  /** ID del cliente (multi-tenant) */
  idCliente: string;

  /** Fecha y hora del cambio (auto-generado) */
  fechaCreacion?: string;

  /** TTL opcional: Fecha de expiración automática (políticas de retención) */
  expireAt?: string;

  // Virtuals (populados por query)
  usuario?: any;  // IUsuario
  cliente?: any;  // ICliente
}

/**
 * DTO para crear auditoría
 *
 * Usado por el interceptor automático.
 */
export interface ICreateAuditoria {
  entidad: EntidadAuditable;
  metodo: MetodoAuditoria;
  dato: Object;
  idUsuario: string;
  idCliente: string;
}

/**
 * Tipos auxiliares para queries comunes
 */

/**
 * Filtro para consultar auditorías
 */
export interface IFiltroAuditoria {
  /** Filtrar por entidad específica */
  entidad?: EntidadAuditable;

  /** Filtrar por método */
  metodo?: MetodoAuditoria;

  /** Filtrar por usuario que hizo el cambio */
  idUsuario?: string;

  /** Filtrar por cliente */
  idCliente?: string;

  /** Filtrar por ID del dato modificado */
  'dato._id'?: string;

  /** Filtrar por rango de fechas */
  fechaCreacion?: {
    $gte?: string;
    $lte?: string;
  };
}
