
/**
 * Tipo de entidad canónica referenciada
 */
export type TipoEntidadCanonica =
  | 'Cliente'
  | 'Division'
  | 'Jefatura'
  | 'Distrito'
  | 'PuntoMedicion'
  | 'Lectura'
  | 'BalanceHidrico'
  | 'Anomalia';

/**
 * Estado de la referencia externa
 */
export type EstadoReferenciaExterna =
  | 'activa'    // Vigente y válida
  | 'obsoleta'  // Ya no existe en sistema origen
  | 'error';    // Error al verificar

/**
 * Referencia Externa - Mapeo entre IDs externos y entidades canónicas
 *
 * Permite mantener la trazabilidad entre sistemas externos (ATLAS, Zeus, GIS)
 * y las entidades canónicas de RIOTEC.
 *
 * Características:
 * - Una entidad canónica puede tener N referencias externas (una por fuente)
 * - Un ID externo puede mapear a SOLO UNA entidad canónica
 * - La referencia es bidireccional para búsquedas rápidas
 *
 * Ejemplos:
 * - ATLAS medidor "ATL-123" → PuntoMedicion "pm-res-001"
 * - Zeus station "ZEUS-BOOST-01" → PuntoMedicion "pm-boost-001"
 * - GIS feature "layer:boosters/feature:42" → PuntoMedicion "pm-boost-001"
 */
export interface IReferenciaExterna {
  _id?: string;

  // Entidad canónica (lado RIOTEC)
  entidadCanonica: {
    id: string;                      // ID de la entidad canónica
    tipo: TipoEntidadCanonica;       // Tipo de entidad
  };

  // Sistema externo
  fuenteDatos: string;               // ID de FuenteDatos (ej: "ATLAS Maldonado")
  idExterno: string;                 // ID en el sistema externo
  tipoExterno?: string;              // Tipo de entidad en sistema externo (ej: "medidor", "station")

  // Estado y validación
  estado: EstadoReferenciaExterna;
  fechaUltimaVerificacion?: string;  // ISO 8601 (última vez que se verificó la existencia)

  // Metadatos adicionales
  metadatosAdicionales?: Record<string, any>; // Información extra del mapeo

  // Auditoría
  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;  // Auto-generado (ISO 8601), inmutable

  // Virtuals
  // fuente?: IFuenteDatos;
}

/**
 * DTO para crear una referencia externa
 */
export interface ICreateReferenciaExterna extends Omit<
  Partial<IReferenciaExterna>,
  '_id' | 'fechaCreacion'
> {
  entidadCanonica: {                 // Requerido
    id: string;
    tipo: TipoEntidadCanonica;
  };
  fuenteDatos: string;               // Requerido
  idExterno: string;                 // Requerido
  estado: EstadoReferenciaExterna;   // Requerido
}

/**
 * DTO para actualizar una referencia externa
 */
export interface IUpdateReferenciaExterna extends Omit<
  Partial<IReferenciaExterna>,
  '_id' | 'fechaCreacion'
> {}
