import { IPaginacion } from './queryParams';

/**
 * Respuesta estándar para operaciones exitosas
 */
export interface ISuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Respuesta estándar para errores
 */
export interface IErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: string;
}

/**
 * Respuesta para listados con paginación
 */
export interface IListResponse<T = any> {
  success: true;
  data: T[];
  paginacion: IPaginacion;
  timestamp?: string;
}

/**
 * Union type para respuestas HTTP
 */
export type IApiResponse<T = any> = ISuccessResponse<T> | IErrorResponse;
