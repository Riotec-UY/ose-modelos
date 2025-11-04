import { IMetadatosAuditoria } from '../auxiliares';

/**
 * Cliente - Raíz del multi-tenancy
 *
 * Representa la organización principal del sistema.
 * En el contexto OSE: "OSE Uruguay" es el cliente raíz.
 *
 * Notas:
 * - Algunos clientes son "semilla" (tenantSemilla: true)
 * - El cliente semilla contiene configuraciones maestras
 */
export interface ICliente {
  _id?: string;
  nombre: string;                    // ej: "OSE Uruguay"
  codigo?: string;                   // Código interno único
  tenantSemilla?: boolean;           // true si es cliente maestro/semilla
  activo?: boolean;                  // Estado del cliente
  configuracion?: Record<string, any>; // Configuraciones específicas del cliente
  metadatosAuditoria?: IMetadatosAuditoria;
}

/**
 * DTO para crear un cliente
 */
export interface ICreateCliente extends Omit<Partial<ICliente>, '_id'> {
  nombre: string; // Requerido
}

/**
 * DTO para actualizar un cliente
 */
export interface IUpdateCliente extends Omit<Partial<ICliente>, '_id'> {}
