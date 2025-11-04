
/**
 * Jefatura - Unidad territorial dentro de una División
 *
 * Representa una jefatura territorial que agrupa distritos.
 * En el contexto OSE: "Jefatura Maldonado-Península", "Jefatura Punta del Este", etc.
 *
 * Características:
 * - Pertenece a una División
 * - Contiene múltiples Distritos pitométricos
 * - Define zona geográfica operacional
 */
export interface IJefatura {
  _id?: string;
  idDivision: string;                // Referencia a División
  nombre: string;                    // ej: "Jefatura Maldonado-Península"
  codigo?: string;                   // Código interno único
  descripcion?: string;              // Descripción de la jefatura
  activo?: boolean;                  // Estado operacional
  configuracion?: Record<string, any>; // Configs específicas
  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;            // Auto-generado (ISO 8601), inmutable

  // Virtuals (populados por query)
  division?: any; // IDivision
}

/**
 * DTO para crear una jefatura
 */
export interface ICreateJefatura extends Omit<Partial<IJefatura>, '_id' | 'division' | 'fechaCreacion'> {
  idDivision: string; // Requerido
  nombre: string;     // Requerido
}

/**
 * DTO para actualizar una jefatura
 */
export interface IUpdateJefatura extends Omit<Partial<IJefatura>, '_id' | 'division' | 'fechaCreacion'> {}
