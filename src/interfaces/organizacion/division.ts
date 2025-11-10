import { IGeoJSON } from '../auxiliares/geojson';

/**
 * Tipo de división
 * - region: División organizacional estándar
 * - ugd: Unidad de Gestión Descentralizada (con mayor autonomía)
 */
export type TipoDivision = 'region' | 'ugd';

/**
 * Dirección administrativa estructurada
 */
export interface IDireccionAdministrativa {
  calle?: string;                    // Calle y número
  ciudad?: string;                   // Ciudad
  departamento?: string;             // Departamento/Provincia/Estado
  codigoPostal?: string;             // Código postal
  pais?: string;                     // País
  referencia?: string;               // Referencias adicionales
  coordenadas?: {                    // Coordenadas del punto administrativo
    lat: number;
    lng: number;
  };
}

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
 * - Define zona geográfica de incumbencia (polígono)
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
  color?: string;                    // Color de visualización en mapas (formato hex: #RRGGBB)
  configuracion?: Record<string, any>; // Configs específicas (horarios, umbrales, etc.)

  /**
   * Zona geográfica de incumbencia (GeoJSON)
   *
   * Define el área territorial que administra esta división.
   * Típicamente un Polygon con las fronteras administrativas.
   *
   * @example
   * {
   *   type: "Polygon",
   *   coordinates: [
   *     [
   *       [-54.9300, -34.9100],
   *       [-54.9400, -34.9100],
   *       [-54.9400, -34.9200],
   *       [-54.9300, -34.9200],
   *       [-54.9300, -34.9100]  // Cierre del polígono
   *     ]
   *   ]
   * }
   */
  zonaGeografica?: IGeoJSON;

  /**
   * Dirección administrativa de la sede/oficina
   * Dirección física donde se encuentra la administración de la división
   */
  direccionAdministrativa?: IDireccionAdministrativa;

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
