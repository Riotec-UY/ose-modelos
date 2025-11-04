/**
 * Tipos de roles en el sistema
 *
 * Roles predefinidos siguiendo el modelo de IRIX.
 * Estos son valores simples, NO entidades separadas.
 */
export type TipoRol =
  | 'administrador_sistema'    // Acceso total al sistema
  | 'administrador_cliente'    // Administrador de un cliente específico
  | 'gerente_division'         // Gerente de una división/UGD
  | 'supervisor_jefatura'      // Supervisor de una jefatura
  | 'operador_avanzado'        // Operador con permisos extendidos
  | 'operador_basico'          // Operador con permisos básicos
  | 'analista'                 // Analista de datos (solo lectura avanzada)
  | 'tecnico'                  // Técnico de soporte/mantenimiento
  | 'viewer';                  // Solo visualización

/**
 * Array de todos los tipos de roles disponibles
 */
export const TIPOS_ROL: TipoRol[] = [
  'administrador_sistema',
  'administrador_cliente',
  'gerente_division',
  'supervisor_jefatura',
  'operador_avanzado',
  'operador_basico',
  'analista',
  'tecnico',
  'viewer'
];

/**
 * Descripciones de cada rol
 */
export const DESCRIPCIONES_ROL: Record<TipoRol, string> = {
  'administrador_sistema': 'Acceso total al sistema, gestiona todos los clientes',
  'administrador_cliente': 'Administrador de un cliente específico',
  'gerente_division': 'Gerente de una división/UGD',
  'supervisor_jefatura': 'Supervisor de una jefatura específica',
  'operador_avanzado': 'Operador con permisos extendidos (crear/modificar)',
  'operador_basico': 'Operador con permisos básicos (lectura + reportar anomalías)',
  'analista': 'Analista de datos con acceso de solo lectura avanzada',
  'tecnico': 'Técnico de soporte y mantenimiento del sistema',
  'viewer': 'Solo visualización de dashboards'
};
