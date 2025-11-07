import { IMetadatosDeOrigen } from '../auxiliares';

/**
 * Tipos de Lectura (Discriminante)
 *
 * Define todos los tipos posibles de lecturas en el sistema.
 * Este tipo se usa como discriminante en el union type ILectura.
 */
export type TipoLectura =
  // Macromedidores
  | "Macromedidor Caudal"
  | "Macromedidor Presión"
  // Medidores Residenciales
  | "Medidor Residencial Consumo"
  // Sensores de Calidad
  | "Sensor Calidad Cloro"
  | "Sensor Calidad pH"
  | "Sensor Calidad Turbidez"
  // Boosters (Estaciones de Bombeo)
  | "Booster Presión Entrada"
  | "Booster Presión Salida"
  | "Booster Caudal"
  // Depósitos (Tanques)
  | "Depósito Nivel"
  // Perforaciones (Pozos)
  | "Perforación Caudal";


/**
 * Calidad del dato
 */
export type CalidadDato =
  | 'válida'       // Dato confiable, pasó todas las validaciones
  | 'sospechosa'   // Fuera de patrón normal pero en rango físico
  | 'error'        // Fuera de rango físico o error de comunicación
  | 'interpolada'  // Calculada para llenar gap
  | 'calculada';   // Derivada de otras lecturas

// ==========================================
// ESTRUCTURAS DE VALORES POR TIPO
// ==========================================

/**
 * Macromedidor - Caudal
 */
export interface IValoresMacromedidorCaudal {
  timestamp: string;              // REQUERIDO - ISO 8601
  caudal: number;                 // m³/h
  caudalAcumulado: number;        // m³
  presion?: number;               // bar (opcional)
}

/**
 * Macromedidor - Presión
 */
export interface IValoresMacromedidorPresion {
  timestamp: string;              // ISO 8601
  presion: number;                // bar
  caudal?: number;                // m³/h (opcional)
}

/**
 * Medidor Residencial - Consumo
 */
export interface IValoresMedidorResidencial {
  timestamp: string;              // ISO 8601
  consumoAcumulado: number;       // m³
  caudal?: number;                // l/h
  bateria?: number;               // %
  senal?: number;                 // % o dBm
  temperatura?: number;           // °C
}

/**
 * Sensor Calidad - Cloro
 */
export interface IValoresSensorCloro {
  timestamp: string;              // ISO 8601
  cloroResidual: number;          // ppm
  temperatura?: number;           // °C
}

/**
 * Sensor Calidad - pH
 */
export interface IValoresSensorPH {
  timestamp: string;              // ISO 8601
  ph: number;                     // 0-14
  temperatura?: number;           // °C
}

/**
 * Sensor Calidad - Turbidez
 */
export interface IValoresSensorTurbidez {
  timestamp: string;              // ISO 8601
  turbidez: number;               // NTU
  temperatura?: number;           // °C
}

/**
 * Booster - Presión (Entrada o Salida)
 */
export interface IValoresBoosterPresion {
  timestamp: string;              // ISO 8601
  presion: number;                // bar
  bombaActiva?: boolean;
  estadoBomba?: 'on' | 'off' | 'falla';
}

/**
 * Booster - Caudal
 */
export interface IValoresBoosterCaudal {
  timestamp: string;              // ISO 8601
  caudal: number;                 // m³/h
  potenciaConsumida?: number;     // kW
}

/**
 * Depósito - Nivel
 */
export interface IValoresDepositoNivel {
  timestamp: string;              // ISO 8601
  nivel: number;                  // metros
  volumen?: number;               // m³ calculado
  capacidad?: number;             // m³ total
  porcentajeLlenado?: number;     // %
}

/**
 * Perforación - Caudal
 */
export interface IValoresPerforacionCaudal {
  timestamp: string;              // ISO 8601
  caudal: number;                 // m³/h
  caudalAcumulado: number;        // m³
  horimetro?: number;             // horas de funcionamiento
  estadoBomba?: 'on' | 'off' | 'falla';
}

// ==========================================
// MAPA TYPE-SAFE: TIPO → VALORES
// ==========================================

/**
 * Mapeo type-safe: cada tipo de lectura tiene su estructura de valores
 *
 * TypeScript inferirá automáticamente el tipo correcto de valores
 * según el campo tipoLectura (discriminated union).
 */
export type MapaValoresLectura = {
  "Macromedidor Caudal": IValoresMacromedidorCaudal;
  "Macromedidor Presión": IValoresMacromedidorPresion;
  "Medidor Residencial Consumo": IValoresMedidorResidencial;
  "Sensor Calidad Cloro": IValoresSensorCloro;
  "Sensor Calidad pH": IValoresSensorPH;
  "Sensor Calidad Turbidez": IValoresSensorTurbidez;
  "Booster Presión Entrada": IValoresBoosterPresion;
  "Booster Presión Salida": IValoresBoosterPresion;
  "Booster Caudal": IValoresBoosterCaudal;
  "Depósito Nivel": IValoresDepositoNivel;
  "Perforación Caudal": IValoresPerforacionCaudal;
};

// ==========================================
// INTERFAZ BASE GENÉRICA
// ==========================================

/**
 * Lectura Base - Estructura genérica para cualquier tipo de lectura
 *
 * Esta interfaz usa el patrón Discriminated Union para garantizar
 * type-safety entre el campo tipoLectura y el campo valores.
 *
 * @template T - Tipo de lectura específico (discriminante)
 */
export interface ILecturaBase<T extends TipoLectura> {
  _id?: string;

  // Identificación del punto de medición
  idPuntoMedicion: string;        // Referencia a PuntoMedicion

  // Multi-tenancy (plano - sin jerarquía)
  idCliente: string;              // Referencia a Cliente

  // Tipo discriminante ⭐
  // TypeScript usa este campo para inferir el tipo de valores
  tipoLectura: T;

  // Valores type-safe según el tipo ⭐
  // El tipo se infiere automáticamente desde tipoLectura
  valores: MapaValoresLectura[T];

  // Calidad del dato
  calidadDato: CalidadDato;

  // Metadatos de origen (embedded en el mismo documento)
  metadatosOrigen?: IMetadatosDeOrigen;

  // Auditoría
  fechaCreacion?: string;         // Cuándo se creó en RIOTEC (ISO 8601)
  expireAt?: string;              // TTL para expiración automática (ISO 8601)

  // Virtuals (populados por query)
  puntoMedicion?: any;            // IPuntoMedicion
  cliente?: any;                  // ICliente
}

// ==========================================
// UNION TYPE: TODAS LAS LECTURAS
// ==========================================

/**
 * ILectura - Union type discriminado de todas las lecturas posibles
 *
 * TypeScript infiere automáticamente el tipo de valores según tipoLectura.
 *
 * Ejemplo de uso:
 * ```typescript
 * function procesarLectura(lectura: ILectura) {
 *   if (lectura.tipoLectura === "Macromedidor Caudal") {
 *     // TypeScript sabe que valores es IValoresMacromedidorCaudal
 *     console.log(lectura.valores.caudal);
 *     console.log(lectura.valores.caudalAcumulado);
 *   }
 * }
 * ```
 */
export type ILectura =
  | ILecturaBase<"Macromedidor Caudal">
  | ILecturaBase<"Macromedidor Presión">
  | ILecturaBase<"Medidor Residencial Consumo">
  | ILecturaBase<"Sensor Calidad Cloro">
  | ILecturaBase<"Sensor Calidad pH">
  | ILecturaBase<"Sensor Calidad Turbidez">
  | ILecturaBase<"Booster Presión Entrada">
  | ILecturaBase<"Booster Presión Salida">
  | ILecturaBase<"Booster Caudal">
  | ILecturaBase<"Depósito Nivel">
  | ILecturaBase<"Perforación Caudal">;

// ==========================================
// DTOs
// ==========================================

/**
 * DTO para crear una lectura
 */
export interface ICreateLectura<T extends TipoLectura> extends Omit<
  ILecturaBase<T>,
  '_id' | 'puntoMedicion' | 'cliente' | 'fechaCreacion'
> {}

/**
 * DTO para actualizar una lectura (raro, generalmente son inmutables)
 */
export interface IUpdateLectura extends Omit<
  Partial<ILectura>,
  '_id' | 'puntoMedicion' | 'cliente' | 'idPuntoMedicion' | 'idCliente' | 'tipoLectura'
> {}
