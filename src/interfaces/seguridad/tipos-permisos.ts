/**
 * Acciones disponibles sobre recursos
 */
export type AccionPermiso = 'crear' | 'leer' | 'actualizar' | 'eliminar' | 'ejecutar';

/**
 * Array de todas las acciones disponibles
 */
export const ACCIONES_PERMISO: AccionPermiso[] = ['crear', 'leer', 'actualizar', 'eliminar', 'ejecutar'];

/**
 * Permisos por módulo del sistema
 *
 * Siguiendo el patrón MongoDB de IRIX, los permisos se almacenan
 * como un objeto con flags booleanos por acción en cada módulo.
 *
 * Cada módulo tiene las acciones que aplican a ese recurso.
 */
export interface IPermisosModulos {
  // === ORGANIZACIÓN ===
  clientes?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  divisiones?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  jefaturas?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  distritos?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  // === INFRAESTRUCTURA ===
  puntos_medicion?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  relaciones_topologicas?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  configuraciones_lectura?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  // === DATOS ===
  lecturas?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  fuentes_datos?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  referencias_externas?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  // === ANÁLISIS ===
  balances_hidricos?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
    ejecutar?: boolean; // Ejecutar cálculo de balance
  };

  anomalias?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  series_temporales?: {
    leer?: boolean;
  };

  // === SEGURIDAD ===
  usuarios?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  sesiones?: {
    leer?: boolean;
    eliminar?: boolean; // Cerrar sesiones
  };

  logs_auditoria?: {
    leer?: boolean;
  };

  // === SISTEMA ===
  configuracion_sistema?: {
    leer?: boolean;
    actualizar?: boolean;
  };

  notificaciones?: {
    crear?: boolean;
    leer?: boolean;
  };

  reglas_alerta?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  registros_sincronizacion?: {
    leer?: boolean;
    ejecutar?: boolean; // Ejecutar sincronización manual
  };

  // === DASHBOARDS ===
  dashboard_operativo?: {
    leer?: boolean;
  };

  dashboard_gerencial?: {
    leer?: boolean;
  };

  reportes?: {
    leer?: boolean;
    ejecutar?: boolean; // Generar reporte
  };
}

/**
 * Helper: Permisos completos (todas las acciones = true)
 */
export const PERMISOS_COMPLETOS: IPermisosModulos = {
  clientes: { crear: true, leer: true, actualizar: true, eliminar: true },
  divisiones: { crear: true, leer: true, actualizar: true, eliminar: true },
  jefaturas: { crear: true, leer: true, actualizar: true, eliminar: true },
  distritos: { crear: true, leer: true, actualizar: true, eliminar: true },
  puntos_medicion: { crear: true, leer: true, actualizar: true, eliminar: true },
  relaciones_topologicas: { crear: true, leer: true, actualizar: true, eliminar: true },
  configuraciones_lectura: { crear: true, leer: true, actualizar: true, eliminar: true },
  lecturas: { crear: true, leer: true, actualizar: true, eliminar: true },
  fuentes_datos: { crear: true, leer: true, actualizar: true, eliminar: true },
  referencias_externas: { crear: true, leer: true, actualizar: true, eliminar: true },
  balances_hidricos: { crear: true, leer: true, actualizar: true, eliminar: true, ejecutar: true },
  anomalias: { crear: true, leer: true, actualizar: true, eliminar: true },
  series_temporales: { leer: true },
  usuarios: { crear: true, leer: true, actualizar: true, eliminar: true },
  sesiones: { leer: true, eliminar: true },
  logs_auditoria: { leer: true },
  configuracion_sistema: { leer: true, actualizar: true },
  notificaciones: { crear: true, leer: true },
  reglas_alerta: { crear: true, leer: true, actualizar: true, eliminar: true },
  registros_sincronizacion: { leer: true, ejecutar: true },
  dashboard_operativo: { leer: true },
  dashboard_gerencial: { leer: true },
  reportes: { leer: true, ejecutar: true }
};

/**
 * Helper: Permisos de solo lectura
 */
export const PERMISOS_SOLO_LECTURA: IPermisosModulos = {
  clientes: { leer: true },
  divisiones: { leer: true },
  jefaturas: { leer: true },
  distritos: { leer: true },
  puntos_medicion: { leer: true },
  relaciones_topologicas: { leer: true },
  configuraciones_lectura: { leer: true },
  lecturas: { leer: true },
  fuentes_datos: { leer: true },
  referencias_externas: { leer: true },
  balances_hidricos: { leer: true },
  anomalias: { leer: true },
  series_temporales: { leer: true },
  usuarios: { leer: true },
  sesiones: { leer: true },
  logs_auditoria: { leer: true },
  configuracion_sistema: { leer: true },
  notificaciones: { leer: true },
  reglas_alerta: { leer: true },
  registros_sincronizacion: { leer: true },
  dashboard_operativo: { leer: true },
  dashboard_gerencial: { leer: true },
  reportes: { leer: true }
};
