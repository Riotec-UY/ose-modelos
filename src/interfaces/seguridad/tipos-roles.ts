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

