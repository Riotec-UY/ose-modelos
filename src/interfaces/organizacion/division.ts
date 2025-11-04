import { IMetadatosAuditoria } from '../auxiliares';

/**
 * División - Unidad operacional del cliente
 *
 * Representa una división operativa dentro del cliente.
 * En el contexto OSE: "UGD Maldonado", "UGD Montevideo", etc.
 *
 * Características:
 * - Pertenece a un Cliente
 * - Contiene múltiples Jefaturas
 * - Puede tener configuraciones operacionales específicas
 */
export interface IDivision {
  _id?: string;
  idCliente: string;                 // Referencia a Cliente
  nombre: string;                    // ej: "UGD Maldonado"
  codigo?: string;                   // Código interno único
  descripcion?: string;              // Descripción de la división
  activo?: boolean;                  // Estado operacional
  configuracion?: Record<string, any>; // Configs específicas (horarios, umbrales, etc.)
  metadatosAuditoria?: IMetadatosAuditoria;

  // Virtuals (populados por query)
  cliente?: any; // ICliente (evitamos import circular)
}

/**
 * DTO para crear una división
 */
export interface ICreateDivision extends Omit<Partial<IDivision>, '_id' | 'cliente'> {
  idCliente: string; // Requerido
  nombre: string;    // Requerido
}

/**
 * DTO para actualizar una división
 */
export interface IUpdateDivision extends Omit<Partial<IDivision>, '_id' | 'cliente'> {}
