import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Estado del personal operativo
 */
export type EstadoPersonal = 'activo' | 'inactivo' | 'suspendido';

/**
 * Constante con todos los estados posibles
 */
export const ESTADOS_PERSONAL: EstadoPersonal[] = ['activo', 'inactivo', 'suspendido'];

/**
 * Personal Operativo (Usuario del Sistema)
 *
 * Representa usuarios con acceso operacional al sistema RIOTEC.
 * Incluye operadores, supervisores, gerentes y administradores.
 *
 * Niveles de acceso:
 * - Sin División/Jefatura asignada: Acceso a todo el cliente (nivel nacional)
 * - Con División asignada: Acceso limitado a esa División
 * - Con Jefatura asignada: Acceso limitado a esa Jefatura específica
 */
export interface IPersonalOperativo {
  /** Identificador único canónico (UUID) */
  _id: string;

  /** Cliente al que pertenece (tenant) */
  idCliente: string;

  /** División asignada (opcional - si no tiene, acceso a todo el cliente) */
  idDivision?: string;

  /** Jefatura asignada (opcional - si tiene jefatura, debe tener división) */
  idJefatura?: string;

  /** Nombre completo del usuario */
  nombreCompleto: string;

  /** Email único (usado para login) */
  email: string;

  /** Hash de contraseña (bcrypt, argon2, etc.) - nunca almacenar en texto plano */
  passwordHash: string;

  /** Estado del usuario */
  estado: EstadoPersonal;

  /** Fecha de último acceso al sistema (opcional) */
  fechaUltimoAcceso?: string; // ISO 8601

  /** Configuración de notificaciones por email */
  notificacionesEmail?: boolean;

  /** Configuración de notificaciones push */
  notificacionesPush?: boolean;

  /** Teléfono de contacto (opcional) */
  telefono?: string;

  /** Foto de perfil URL (opcional) */
  fotoUrl?: string;

  /** Metadatos de auditoría (creación, modificación) */
  metadatosAuditoria?: IMetadatosAuditoria;
}
