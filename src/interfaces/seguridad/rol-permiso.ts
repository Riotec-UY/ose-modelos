import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Rol-Permiso (Relación Many-to-Many)
 *
 * Relaciona roles con permisos específicos.
 * Un rol puede tener múltiples permisos.
 * Un permiso puede estar asociado a múltiples roles.
 *
 * Esta entidad representa la configuración de qué permisos tiene cada rol.
 */
export interface IRolPermiso {
  /** Identificador único canónico (UUID) */
  _id: string;

  /** ID del rol */
  idRol: string;

  /** ID del permiso */
  idPermiso: string;

  /** Fecha de asignación del permiso al rol */
  fechaAsignacion: string; // ISO 8601

  /** Usuario que realizó la asignación (opcional) */
  asignadoPor?: string;

  /** Metadatos de auditoría */
  metadatosAuditoria?: IMetadatosAuditoria;
}
