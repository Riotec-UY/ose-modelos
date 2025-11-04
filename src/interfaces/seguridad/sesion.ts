/**
 * Estado de la sesión
 */
export type EstadoSesion = 'activa' | 'cerrada' | 'expirada' | 'invalida';

/**
 * Constante con todos los estados de sesión posibles
 */
export const ESTADOS_SESION: EstadoSesion[] = ['activa', 'cerrada', 'expirada', 'invalida'];

/**
 * Sesión
 *
 * Representa una sesión de usuario activa en el sistema.
 * Gestiona tokens JWT, seguimiento de actividad y control de acceso.
 *
 * Ciclo de vida:
 * 1. Usuario hace login → crea sesión con estado 'activa'
 * 2. Sistema genera token JWT
 * 3. Cliente usa token en cada request
 * 4. Sistema valida token contra sesión activa
 * 5. Usuario hace logout O token expira → sesión cambia a 'cerrada'/'expirada'
 *
 * Cada sesión tiene un tiempo de vida configurable (ej: 8 horas)
 */
export interface ISesion {
  /** Identificador único canónico (UUID) */
  _id: string;

  /** ID del usuario (IUsuario) */
  idUsuario: string;

  /** Token JWT generado para esta sesión */
  token: string;

  /** Refresh token (para renovar sesión sin re-login) */
  refreshToken?: string;

  /** Fecha/hora de inicio de sesión */
  fechaInicio: string; // ISO 8601

  /** Fecha/hora de última actividad */
  fechaUltimaActividad: string; // ISO 8601

  /** Fecha/hora de cierre de sesión (null si activa) */
  fechaFin?: string; // ISO 8601

  /** Fecha/hora de expiración del token */
  fechaExpiracion: string; // ISO 8601

  /** Estado de la sesión */
  estado: EstadoSesion;

  /** IP desde donde se inició la sesión */
  ip: string;

  /** User-Agent del navegador/cliente */
  userAgent?: string;

  /** Dispositivo (web, mobile_ios, mobile_android, desktop) */
  dispositivo?: string;

  /** Ubicación geográfica estimada (país, ciudad) - opcional */
  ubicacion?: {
    pais?: string;
    ciudad?: string;
  };

  /**
   * Contexto de la sesión (cliente, división, jefatura)
   * Define el alcance organizacional de la sesión actual
   */
  contextoOrganizacional?: {
    idCliente: string;
    idDivision?: string;
    idJefatura?: string;
  };
}
