
/**
 * Tipo de transformación aplicable a un campo
 */
export type TipoTransformacion =
  | 'directo'               // Copia directa sin transformación
  | 'convertir_tipo'        // Convertir tipo de dato (string → number, etc.)
  | 'mapeo_valores'         // Mapear valores (ej: "booster" → "booster", "tank" → "deposito")
  | 'formula'               // Aplicar fórmula matemática
  | 'concatenar'            // Concatenar múltiples campos
  | 'extraer_subcadena'     // Extraer parte de un string
  | 'fecha_formato'         // Convertir formato de fecha
  | 'lookup'                // Buscar valor en tabla de referencia
  | 'constante'             // Valor constante (no viene del origen)
  | 'condicional'           // Condicional (if-then-else)
  | 'custom';               // Transformación custom (nombre de función)


/**
 * Tipo de validación aplicable
 */
export type TipoValidacion =
  | 'requerido'             // Campo obligatorio (not null)
  | 'tipo_dato'             // Tipo de dato correcto
  | 'rango'                 // Valor en rango numérico
  | 'longitud'              // Longitud de string
  | 'regex'                 // Expresión regular
  | 'valores_permitidos'    // Lista de valores válidos
  | 'unico'                 // Valor único (no duplicado)
  | 'referencia_existe'     // Referencia a otra entidad existe
  | 'custom';               // Validación custom


/**
 * Estrategia de actualización
 */
export type EstrategiaActualizacion =
  | 'create_only'           // Solo crear, nunca actualizar
  | 'update_only'           // Solo actualizar, nunca crear
  | 'create_or_update'      // Crear si no existe, actualizar si existe (upsert)
  | 'create_or_skip'        // Crear si no existe, skip si existe
  | 'manual';               // Requiere aprobación manual

/**
 * Array de estrategias (para iterar)
 */
export const ESTRATEGIAS_ACTUALIZACION: EstrategiaActualizacion[] = [
  'create_only',
  'update_only',
  'create_or_update',
  'create_or_skip',
  'manual'
];

/**
 * Mapeo de un campo individual
 */
export interface IMapaCampo {
  // Origen
  campoOrigen: string;                 // Nombre del campo en sistema externo (ej: "station_id")
  tipoDatoOrigen?: string;             // Tipo de dato en origen (ej: "string", "number")

  // Destino
  campoDestino: string;                // Ruta en modelo canónico (ej: "nombre", "ubicacion.geojson")
  tipoDatoDestino?: string;            // Tipo de dato esperado en destino

  // Transformación
  transformacion: TipoTransformacion;
  parametrosTransformacion?: Record<string, any>; // Parámetros de la transformación

  // Ejemplos de parametrosTransformacion:
  // - mapeo_valores: { "booster": "booster", "tank": "deposito" }
  // - formula: { "expresion": "$valor * 1000" }
  // - constante: { "valor": "operativo" }
  // - condicional: { "condicion": "$valor > 0", "siVerdad": "activo", "siFalso": "inactivo" }

  // Opcionalidad
  requerido?: boolean;                 // ¿Es obligatorio?
  valorPorDefecto?: any;               // Valor si no existe en origen

  // Condición de aplicación
  condicion?: string;                  // Aplicar solo si condición se cumple
                                       // ej: "tipo_estacion === 'booster'"
}

/**
 * Regla de validación
 */
export interface IReglaValidacion {
  tipo: TipoValidacion;
  campo: string;                       // Campo a validar (ruta en modelo canónico)
  parametros?: Record<string, any>;    // Parámetros de la validación

  // Ejemplos de parametros:
  // - rango: { "min": 0, "max": 100 }
  // - longitud: { "min": 3, "max": 50 }
  // - regex: { "patron": "^[A-Z]{3}-[0-9]{4}$" }
  // - valores_permitidos: { "valores": ["operativo", "mantenimiento", "inactivo"] }

  mensajeError?: string;               // Mensaje de error personalizado
  severidad?: 'error' | 'advertencia'; // Severidad (error = bloquea, advertencia = permite)
}

/**
 * Regla de Mapeo - Configuración declarativa de transformaciones
 *
 * Define cómo transformar datos desde un sistema externo al modelo canónico RIOTEC.
 *
 * Beneficios:
 * - Configuración sin código (no requiere recompilación)
 * - Documentación automática de transformaciones
 * - Facilita revisión por personal no técnico
 * - Permite cambios de mapeo sin deployment
 * - Trazabilidad de qué datos vienen de dónde
 *
 * Nota arquitectónica:
 * Esta entidad PUEDE vivir en el modelo (ose-modelos) O en api-integracion.
 * Se incluye aquí para homogeneidad, pero la implementación de la lógica
 * de transformación está en api-integracion.
 *
 * Ejemplos:
 * - Mapeo ATLAS → PuntoMedicion (tipo residencial)
 * - Mapeo Zeus → PuntoMedicion (tipo booster/perforacion)
 * - Mapeo Zeus Variables → Lectura (discriminated unions)
 */
export interface IReglaMapeo {
  _id?: string;

  // Identificación
  idCliente: string;                   // Cliente (multi-tenancy)
  idFuenteDatos: string;               // Fuente de datos específica
  nombre: string;                      // Nombre descriptivo (ej: "ATLAS → PuntoMedicion Residencial")
  descripcion?: string;                // Descripción detallada
  activo?: boolean;                    // ¿Regla activa?

  // Tipo de mapeo
  tipoOrigen: string;                  // Tipo de entidad en sistema origen (ej: "atlas_meter", "zeus_station")
  tipoDestino: string;                 // Tipo de entidad canónica (ej: "PuntoMedicion", "Lectura")

  // Mapeo de campos
  mapasCampos: IMapaCampo[];           // Mapeos individuales de campos

  // Validaciones
  validaciones?: IReglaValidacion[];   // Validaciones a aplicar

  // Estrategia de actualización
  estrategiaActualizacion: EstrategiaActualizacion;

  // Prioridad (para resolución de conflictos)
  prioridad?: number;                  // Mayor número = mayor prioridad (default: 100)

  // Configuración avanzada
  filtroOrigen?: string;               // Filtro para aplicar en origen (ej: "status === 'active'")
  campoIdentificador?: string;         // Campo usado para identificar entidad (ej: "meter_id")

  // Metadatos
  version?: string;                    // Versión de la regla (para control de cambios)
  ultimaActualizacion?: string;        // Última modificación (ISO 8601)
  creadoPor?: string;                  // Usuario que creó la regla
  actualizadoPor?: string;             // Usuario que modificó la regla

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;              // Auto-generado (ISO 8601), inmutable

  // Virtuals (populados por query)
  cliente?: any;        // ICliente
  fuenteDatos?: any;    // IFuenteDatos
}

/**
 * DTO para crear una regla de mapeo
 */
export interface ICreateReglaMapeo extends Omit<
  Partial<IReglaMapeo>,
  '_id' | 'cliente' | 'fuenteDatos' | 'fechaCreacion'
> {
  idCliente: string;                           // Requerido
  idFuenteDatos: string;                       // Requerido
  nombre: string;                              // Requerido
  tipoOrigen: string;                          // Requerido
  tipoDestino: string;                         // Requerido
  mapasCampos: IMapaCampo[];                   // Requerido
  estrategiaActualizacion: EstrategiaActualizacion; // Requerido
}

/**
 * DTO para actualizar una regla de mapeo
 */
export interface IUpdateReglaMapeo extends Omit<
  Partial<IReglaMapeo>,
  '_id' | 'idCliente' | 'idFuenteDatos' | 'cliente' | 'fuenteDatos' | 'fechaCreacion'
> {}
