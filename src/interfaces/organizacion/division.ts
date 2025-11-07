/**
 * Tipo de división
 * - region: División organizacional estándar
 * - ugd: Unidad de Gestión Descentralizada (con mayor autonomía)
 */
export type TipoDivision = 'region' | 'ugd';

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
 *
 * Auditoría:
 * - fechaCreacion: Auto-generado en creación (inmutable)
 * - Cambios auditados en colección separada IAuditoria (patrón GAS/INSIDE)
 */
export interface IDivision {
  _id?: string;
  idCliente: string;                 // Referencia a Cliente
  tipo: TipoDivision;                // Tipo: 'region' o 'ugd'
  nombre: string;                    // ej: "UGD Maldonado"
  codigo?: string;                   // Código interno único
  descripcion?: string;              // Descripción de la división
  activo?: boolean;                  // Estado operacional
  configuracion?: Record<string, any>; // Configs específicas (horarios, umbrales, etc.)

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;            // Auto-generado (ISO 8601), inmutable

  // Virtuals (populados por query)
  cliente?: any; // ICliente (evitamos import circular)
}

/**
 * DTO para crear una división
 */
export interface ICreateDivision extends Omit<Partial<IDivision>, '_id' | 'cliente' | 'fechaCreacion'> {
  idCliente: string; // Requerido
  tipo: TipoDivision; // Requerido
  nombre: string;    // Requerido
}

/**
 * DTO para actualizar una división
 */
export interface IUpdateDivision extends Omit<Partial<IDivision>, '_id' | 'cliente' | 'fechaCreacion'> {}
