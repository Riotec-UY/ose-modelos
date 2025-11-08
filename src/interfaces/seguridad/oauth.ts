/**
 * Cliente OAuth2
 *
 * Representa una aplicación cliente que puede autenticarse
 * y obtener tokens de acceso (ej: app web, app mobile)
 */
export interface IClient {
  /** ID único del cliente */
  id: string;

  /** Secret del cliente (para validación) */
  clientSecret: string;

  /** Grant types permitidos */
  grants: string[];

  /** URIs de redirección permitidas */
  redirectUris: string[];

  /** Tiempo de vida del access token en segundos */
  accessTokenLifetime?: number;

  /** Tiempo de vida del refresh token en segundos */
  refreshTokenLifetime?: number;
}

/**
 * DTO para crear un cliente OAuth2
 */
export interface ICreateClient extends IClient {}

/**
 * Token OAuth2
 *
 * Representa un access token y refresh token generado
 * para un usuario autenticado
 */
export interface IToken {
  /** Access token */
  accessToken: string;

  /** Fecha de expiración del access token */
  accessTokenExpiresAt?: string; // ISO 8601

  /** Refresh token */
  refreshToken?: string;

  /** Fecha de expiración del refresh token */
  refreshTokenExpiresAt?: string; // ISO 8601

  /** Cliente que solicitó el token */
  client?: IClient;

  /** Usuario asociado al token */
  user?: any; // IUsuario (any para evitar dependencias circulares)

  /** Scope del token (opcional) */
  scope?: string[];
}

/**
 * DTO para crear un token OAuth2
 */
export interface ICreateToken {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  client: IClient;
  user: any;
  scope?: string[];
}
