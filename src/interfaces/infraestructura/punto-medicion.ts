import { IMetadatosAuditoria, IMetadatosTecnicos } from '../auxiliares';
import { IUbicacionGeografica } from './ubicacion-geografica';

/**
 * Tipos de Punto de Medición
 *
 * Clasificación NO restrictiva (usada para UX, filtros, iconos).
 * NO determina qué variables puede tener (eso es dinámico vía Lecturas).
 */

// CONSUMO
export type TipoPuntoConsumo =
  | 'residencial'     // Domicilio particular
  | 'comercial'       // Comercio, oficina
  | 'industrial'      // Industria, fábrica
  | 'institucional';  // Hospital, escuela, edificio público

// INFRAESTRUCTURA DE PRODUCCIÓN
export type TipoPuntoProduccion =
  | 'perforacion'           // Pozo de extracción
  | 'planta_tratamiento'    // Planta potabilizadora
  | 'entrada_externa';      // Compra a otro proveedor

// INFRAESTRUCTURA DE DISTRIBUCIÓN
export type TipoPuntoDistribucion =
  | 'booster'            // Estación de bombeo
  | 'deposito'           // Tanque de almacenamiento
  | 'camara_valvulas';   // Punto de control en red

// CONTROL
export type TipoPuntoControl =
  | 'punto_control_distrito'  // Entrada/salida distrito pitométrico
  | 'interconexion';          // Conexión entre zonas

// GENÉRICO
export type TipoPuntoGenerico = 'otro'; // Otros casos no clasificados

/**
 * Union type de todos los tipos de punto
 */
export type TipoPuntoMedicion =
  | TipoPuntoConsumo
  | TipoPuntoProduccion
  | TipoPuntoDistribucion
  | TipoPuntoControl
  | TipoPuntoGenerico;

/**
 * Array de todos los tipos (para iteración en UIs)
 */
export const TIPOS_PUNTO_MEDICION: TipoPuntoMedicion[] = [
  // Consumo
  'residencial',
  'comercial',
  'industrial',
  'institucional',
  // Producción
  'perforacion',
  'planta_tratamiento',
  'entrada_externa',
  // Distribución
  'booster',
  'deposito',
  'camara_valvulas',
  // Control
  'punto_control_distrito',
  'interconexion',
  // Genérico
  'otro',
];

/**
 * Función en Balance Hídrico
 *
 * Define el rol del punto en el cálculo del balance hídrico.
 */
export type FuncionBalanceHidrico =
  | 'entrada'    // Agua que INGRESA al sistema (perforaciones, entrada externa)
  | 'salida'     // Agua que SALE del sistema (consumo residencial, comercial, industrial)
  | 'control'    // Puntos intermedios de medición (boosters, depósitos, distritos)
  | 'no_aplica'; // No participa en balance (ej: sensores de calidad sin caudal)

/**
 * Estado operacional del punto
 */
export type EstadoPuntoMedicion =
  | 'operativo'      // Funcionando normalmente
  | 'mantenimiento'  // En mantenimiento programado
  | 'error'          // Con fallas técnicas
  | 'inactivo';      // Desactivado permanentemente

/**
 * Punto de Medición - LUGAR físico donde se realizan mediciones
 *
 * Concepto clave: Representa el LUGAR, NO el tipo de dato ni el dispositivo.
 * Un punto puede tener 1 o múltiples Lecturas asociadas.
 *
 * Características:
 * - Identificador canónico (UUID interno RIOTEC)
 * - Tipo clasificatorio (NO restrictivo)
 * - Función en balance hídrico
 * - Ubicación geográfica
 * - Metadatos técnicos flexibles (varían según tipo)
 * - Estado operacional
 *
 * Ejemplos:
 * - Domicilio residencial: 1 lugar → 1 lectura de consumo
 * - Estación booster: 1 lugar → múltiples lecturas (presión entrada, presión salida, caudal, estado)
 * - Perforación: 1 lugar → múltiples lecturas (caudal, nivel freático, calidad)
 */
export interface IPuntoMedicion {
  _id?: string;
  idCliente: string;               // Referencia a Cliente
  idDivision?: string;             // Referencia a División (opcional)
  idJefatura?: string;             // Referencia a Jefatura (opcional)
  idDistrito?: string;             // Referencia a Distrito pitométrico (opcional)

  // Identificación
  nombre: string;                  // Nombre descriptivo del punto
  codigo?: string;                 // Código interno único (ej: "ATL-MAL-ED-00123")

  // Clasificación
  tipo: TipoPuntoMedicion;         // Tipo de lugar (clasificatorio, NO restrictivo)
  funcionBalanceHidrico: FuncionBalanceHidrico; // Rol en balance hídrico

  // Ubicación
  ubicacion: IUbicacionGeografica; // Coordenadas y referencias espaciales

  // Estado y fechas
  estado: EstadoPuntoMedicion;     // Estado operacional
  fechaInstalacion?: string;       // ISO 8601
  fechaDesactivacion?: string;     // ISO 8601 (si está inactivo)

  // Metadatos técnicos flexibles
  // Varían según tipo de punto (ver ejemplos en documentación)
  metadatosTecnicos?: IMetadatosTecnicos;

  // Auditoría
  metadatosAuditoria?: IMetadatosAuditoria;

  // Virtuals (populados por query)
  cliente?: any;     // ICliente
  division?: any;    // IDivision
  jefatura?: any;    // IJefatura
  distrito?: any;    // IDistrito
}

/**
 * DTO para crear un punto de medición
 */
export interface ICreatePuntoMedicion extends Omit<
  Partial<IPuntoMedicion>,
  '_id' | 'cliente' | 'division' | 'jefatura' | 'distrito'
> {
  idCliente: string;                      // Requerido
  nombre: string;                         // Requerido
  tipo: TipoPuntoMedicion;                // Requerido
  funcionBalanceHidrico: FuncionBalanceHidrico; // Requerido
  ubicacion: IUbicacionGeografica;        // Requerido
  estado: EstadoPuntoMedicion;            // Requerido
}

/**
 * DTO para actualizar un punto de medición
 */
export interface IUpdatePuntoMedicion extends Omit<
  Partial<IPuntoMedicion>,
  '_id' | 'cliente' | 'division' | 'jefatura' | 'distrito'
> {}
