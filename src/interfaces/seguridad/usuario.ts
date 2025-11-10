import { TipoRol } from './tipos-roles';
import { IPermisosModulos } from './tipos-permisos';

/**
 * Estado del usuario
 */
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido';

/**
 * Constante con todos los estados posibles
 */

/**
 * Alcance (scope) del permiso
 * Define a qué nivel de la jerarquía organizacional aplica
 */
export type AlcancePermiso = 'global' | 'division' | 'jefatura';

/**
 * Constante con todos los alcances posibles
 */
export const ALCANCES_PERMISO: AlcancePermiso[] = ['global', 'division', 'jefatura'];

/**
 * Permiso de Usuario (embebido en Usuario)
 *
 * Representa un conjunto de permisos en un contexto organizacional específico.
 * Un usuario puede tener múltiples permisos con diferentes alcances.
 *
 * Siguiendo el patrón MongoDB de IRIX: este NO es una entidad separada,
 * sino un objeto embebido dentro del array `permisos` del usuario.
 *
 * Ejemplos:
 * - Usuario con rol "operador_basico" en Jefatura Edén
 * - Usuario con rol "gerente_division" en toda la UGD Maldonado
 * - Usuario con rol "administrador_sistema" a nivel global
 */
export interface IPermisoUsuario {
  /** Cliente donde aplica (siempre requerido) */
  idCliente: string;

  /**
   * División donde aplica (requerido si alcance = 'division' o 'jefatura')
   * null si alcance = 'global'
   */
  idDivision?: string;

  /**
   * Jefatura donde aplica (requerido si alcance = 'jefatura')
   * Debe tener idDivision si tiene idJefatura
   */
  idJefatura?: string;

  /**
   * Alcance del permiso
   * - global: Aplica a todo el cliente
   * - division: Aplica solo a la división especificada
   * - jefatura: Aplica solo a la jefatura especificada
   */
  alcance: AlcancePermiso;

  /**
   * Roles asignados (array de strings, NO referencias!)
   * Un permiso puede tener múltiples roles
   */
  roles: TipoRol[];

  /**
   * Permisos granulares por módulo (objeto embebido)
   * Define exactamente qué acciones puede realizar en cada módulo
   *
   * Ejemplo:
   * {
   *   puntos_medicion: { leer: true, actualizar: true },
   *   lecturas: { leer: true },
   *   anomalias: { crear: true, leer: true }
   * }
   */
  permisos: IPermisosModulos;

  /** Estado del permiso */
  activo: boolean;

  /** Fecha de asignación */
  fechaAsignacion: string; // ISO 8601

  /** Fecha de expiración (opcional - para permisos temporales) */
  fechaExpiracion?: string; // ISO 8601

  /** Usuario que asignó el permiso (opcional) */
  asignadoPor?: string;
}

/**
 * Usuario del Sistema
 *
 * Representa cualquier usuario con acceso al sistema RIOTEC, incluyendo:
 * - Administradores del sistema
 * - Gerentes de división
 * - Supervisores de jefatura
 * - Operadores (básicos y avanzados)
 * - Analistas
 * - Técnicos
 * - Viewers/Consultores
 *
 * **Modelo MongoDB-optimized**: Los permisos están embebidos como array,
 * NO como referencias a entidades separadas. Esto permite obtener
 * el usuario completo con todos sus permisos en 1 solo query.
 *
 * Siguiendo el patrón de IRIX.
 */
export interface IUsuario {
  /** Identificador único canónico (UUID) */
  _id: string;

  /** Cliente al que pertenece (tenant) */
  idCliente: string;

  /**
   * División asignada por defecto (opcional)
   * Define el contexto organizacional por defecto del usuario
   */
  idDivision?: string;

  /**
   * Jefatura asignada por defecto (opcional)
   * Define el contexto organizacional por defecto del usuario
   */
  idJefatura?: string;

  /** Nombre completo del usuario */
  nombreCompleto: string;

  /** Email único (usado para login) */
  email: string;

  /** Username único (usado para login alternativo) */
  username?: string;

  /** Hash de contraseña (bcrypt, argon2, etc.) - nunca almacenar en texto plano */
  passwordHash?: string;

  /**
   * Array de permisos embebidos (NO referencias!)
   *
   * Cada elemento define roles y permisos en un contexto organizacional.
   * Un usuario puede tener múltiples permisos con diferentes alcances.
   *
   * Ejemplos:
   * [
   *   {
   *     alcance: 'jefatura',
   *     idDivision: 'ugd-maldonado',
   *     idJefatura: 'jef-eden',
   *     roles: ['operador_basico'],
   *     permisos: { ... }
   *   },
   *   {
   *     alcance: 'division',
   *     idDivision: 'ugd-maldonado',
   *     roles: ['analista'],
   *     permisos: { ... }
   *   }
   * ]
   */
  permisos: IPermisoUsuario[];

  /** Estado del usuario */
  estado: EstadoUsuario;

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
  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;  // Auto-generado (ISO 8601), inmutable

  // Virtuals (populados por query)
  cliente?: any; // ICliente (evitamos import circular)
}

/**
 * DTO para crear un usuario
 */
export interface ICreateUsuario extends Omit<Partial<IUsuario>, '_id' | 'cliente' | 'fechaCreacion'> {
  idCliente: string; // Requerido
  nombreCompleto: string; // Requerido
  email: string; // Requerido
  passwordHash: string; // Requerido
  permisos: IPermisoUsuario[]; // Requerido
  estado: EstadoUsuario; // Requerido
}

/**
 * DTO para actualizar un usuario
 */
export interface IUpdateUsuario extends Omit<Partial<IUsuario>, '_id' | 'cliente' | 'fechaCreacion'> {}
