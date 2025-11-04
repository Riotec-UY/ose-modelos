import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Acción sobre un recurso
 */
export type AccionPermiso = 'crear' | 'leer' | 'actualizar' | 'eliminar' | 'ejecutar';

/**
 * Constante con todas las acciones posibles
 */
export const ACCIONES_PERMISO: AccionPermiso[] = ['crear', 'leer', 'actualizar', 'eliminar', 'ejecutar'];

/**
 * Módulo/recurso del sistema
 * Define las áreas funcionales sobre las que se aplican permisos
 */
export type ModuloRecurso =
  // Organización
  | 'clientes'
  | 'divisiones'
  | 'jefaturas'
  | 'distritos'
  // Infraestructura
  | 'puntos_medicion'
  | 'relaciones_topologicas'
  | 'configuraciones_lectura'
  // Datos
  | 'lecturas'
  | 'fuentes_datos'
  | 'referencias_externas'
  // Análisis
  | 'balances_hidricos'
  | 'anomalias'
  | 'series_temporales'
  // Seguridad
  | 'usuarios'
  | 'roles'
  | 'permisos'
  | 'sesiones'
  | 'logs_auditoria'
  // Sistema
  | 'configuracion_sistema'
  | 'notificaciones'
  | 'reglas_alerta'
  | 'registros_sincronizacion'
  // Dashboards
  | 'dashboard_operativo'
  | 'dashboard_gerencial'
  | 'reportes';

/**
 * Constante con todos los módulos/recursos
 */
export const MODULOS_RECURSO: ModuloRecurso[] = [
  'clientes',
  'divisiones',
  'jefaturas',
  'distritos',
  'puntos_medicion',
  'relaciones_topologicas',
  'configuraciones_lectura',
  'lecturas',
  'fuentes_datos',
  'referencias_externas',
  'balances_hidricos',
  'anomalias',
  'series_temporales',
  'usuarios',
  'roles',
  'permisos',
  'sesiones',
  'logs_auditoria',
  'configuracion_sistema',
  'notificaciones',
  'reglas_alerta',
  'registros_sincronizacion',
  'dashboard_operativo',
  'dashboard_gerencial',
  'reportes'
];

/**
 * Permiso
 *
 * Define una acción específica sobre un recurso del sistema.
 * Los permisos se agrupan en roles y se asignan a usuarios.
 *
 * Modelo de permisos basado en RBAC (Role-Based Access Control)
 * con granularidad a nivel de recurso + acción.
 */
export interface IPermiso {
  /** Identificador único canónico (UUID) */
  _id: string;

  /** Cliente al que pertenece (para permisos personalizados por cliente) */
  idCliente?: string;

  /** Nombre del permiso (legible) */
  nombre: string;

  /** Código único del permiso (ej: "usuarios:crear", "balances:leer") */
  codigo: string;

  /** Descripción del permiso */
  descripcion?: string;

  /** Módulo o recurso sobre el que se aplica */
  modulo: ModuloRecurso;

  /** Acción permitida sobre el recurso */
  accion: AccionPermiso;

  /** Estado del permiso */
  activo: boolean;

  /**
   * Es un permiso del sistema (no se puede eliminar)
   * true para permisos predefinidos del sistema
   */
  permisoSistema: boolean;

  /** Metadatos de auditoría */
  metadatosAuditoria?: IMetadatosAuditoria;
}
