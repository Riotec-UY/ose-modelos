import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Nivel de acceso del rol
 * Define el alcance del acceso dentro de la jerarquía organizacional
 */
export type NivelAccesoRol = 'nacional' | 'division' | 'jefatura';

/**
 * Constante con todos los niveles de acceso posibles
 */
export const NIVELES_ACCESO_ROL: NivelAccesoRol[] = ['nacional', 'division', 'jefatura'];

/**
 * Tipos de roles predefinidos
 * Estos son sugeridos pero el sistema puede definir roles personalizados
 */
export type TipoRol =
  | 'administrador_sistema'    // Acceso total al sistema
  | 'administrador_cliente'    // Administrador de un cliente específico
  | 'gerente_division'         // Gerente de una división/UGD
  | 'supervisor_jefatura'      // Supervisor de una jefatura
  | 'operador_avanzado'        // Operador con permisos extendidos
  | 'operador_basico'          // Operador con permisos básicos
  | 'analista'                 // Analista de datos (solo lectura avanzada)
  | 'viewer'                   // Solo visualización
  | 'personalizado';           // Rol personalizado

/**
 * Constante con todos los tipos de roles
 */
export const TIPOS_ROL: TipoRol[] = [
  'administrador_sistema',
  'administrador_cliente',
  'gerente_division',
  'supervisor_jefatura',
  'operador_avanzado',
  'operador_basico',
  'analista',
  'viewer',
  'personalizado'
];

/**
 * Rol
 *
 * Define un conjunto de permisos que pueden ser asignados a usuarios.
 * Los roles determinan qué acciones puede realizar un usuario en el sistema.
 *
 * Un usuario puede tener múltiples roles con diferentes alcances.
 */
export interface IRol {
  /** Identificador único canónico (UUID) */
  _id: string;

  /** Cliente al que pertenece el rol */
  idCliente: string;

  /** Nombre del rol */
  nombre: string;

  /** Código alfanumérico único del rol (ej: "ADMIN", "OPER_AVZ") */
  codigo: string;

  /** Tipo de rol (predefinido o personalizado) */
  tipo: TipoRol;

  /** Descripción del rol */
  descripcion?: string;

  /** Nivel de acceso que otorga este rol */
  nivelAcceso: NivelAccesoRol;

  /** Estado del rol (activo/inactivo) */
  activo: boolean;

  /**
   * Es un rol del sistema (no se puede eliminar ni modificar permisos)
   * true para roles predefinidos del sistema
   */
  rolSistema: boolean;

  /** Metadatos de auditoría */
  metadatosAuditoria?: IMetadatosAuditoria;
}
