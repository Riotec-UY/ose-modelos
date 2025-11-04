import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Alcance (scope) de la asignación del rol
 * Define a qué nivel de la jerarquía organizacional aplica el rol
 */
export type AlcanceRol = 'global' | 'division' | 'jefatura';

/**
 * Constante con todos los alcances posibles
 */
export const ALCANCES_ROL: AlcanceRol[] = ['global', 'division', 'jefatura'];

/**
 * Usuario-Rol (Relación Many-to-Many con alcance)
 *
 * Relaciona usuarios con roles específicos.
 * Un usuario puede tener múltiples roles con diferentes alcances.
 * Un rol puede estar asignado a múltiples usuarios.
 *
 * El alcance define el contexto organizacional donde el rol es válido:
 * - global: El usuario tiene ese rol en todo el cliente (acceso nacional)
 * - division: El usuario tiene ese rol solo en una división específica
 * - jefatura: El usuario tiene ese rol solo en una jefatura específica
 *
 * Ejemplo:
 * - Usuario "Juan Pérez" puede tener rol "operador_basico" con alcance "jefatura" (Jefatura Edén)
 * - Usuario "María Gómez" puede tener rol "gerente_division" con alcance "division" (UGD Maldonado)
 * - Usuario "Admin Sistema" puede tener rol "administrador_sistema" con alcance "global"
 */
export interface IUsuarioRol {
  /** Identificador único canónico (UUID) */
  _id: string;

  /** ID del usuario (PersonalOperativo) */
  idUsuario: string;

  /** ID del rol */
  idRol: string;

  /** Alcance del rol para este usuario */
  alcance: AlcanceRol;

  /**
   * ID de la división donde aplica el rol (requerido si alcance = 'division' o 'jefatura')
   * Opcional si alcance = 'global'
   */
  idDivision?: string;

  /**
   * ID de la jefatura donde aplica el rol (requerido si alcance = 'jefatura')
   * Debe tener idDivision si tiene idJefatura
   */
  idJefatura?: string;

  /** Fecha de asignación del rol */
  fechaAsignacion: string; // ISO 8601

  /** Fecha de expiración del rol (opcional - para roles temporales) */
  fechaExpiracion?: string; // ISO 8601

  /** Usuario que realizó la asignación */
  asignadoPor?: string;

  /** Estado de la asignación */
  activo: boolean;

  /** Metadatos de auditoría */
  metadatosAuditoria?: IMetadatosAuditoria;
}
