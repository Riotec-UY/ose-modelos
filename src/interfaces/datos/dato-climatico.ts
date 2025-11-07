import { CalidadDato } from './lectura';

/**
 * Tipos de dato climático
 */
export type TipoDatoClimatico =
  | 'observado'     // Dato actual o histórico real (weather)
  | 'pronostico'    // Predicción futura (forecast)
  | 'estadistico';  // Promedio histórico, climatología

/**
 * Array de tipos para iteración en UIs
 */
export const TIPOS_DATO_CLIMATICO: TipoDatoClimatico[] = [
  'observado',
  'pronostico',
  'estadistico',
];

/**
 * Dato Climático
 *
 * Registro individual de observación o pronóstico meteorológico
 * asociado a una EstacionClimaticaVirtual.
 *
 * Características:
 * - **Almacenamiento en serie temporal**: Historial completo de datos climáticos
 * - **Referencia a estación virtual**: NO a punto de medición individual
 * - **Tipos de dato**: Observado (actual/histórico), Pronóstico (futuro), Estadístico (climatología)
 * - **Origen multiple**: Visual Crossing, INUMET, OpenWeatherMap, etc.
 *
 * Patrón de uso:
 * - **EstacionClimaticaVirtual.ultimaLectura**: Acceso rápido (snapshot embebido)
 * - **DatoClimatico** (colección): Historial completo, queries temporales
 *
 * Diferencias con ILectura (lecturas de agua):
 * - ILectura: Datos de infraestructura hídrica (caudal, presión, consumo)
 * - IDatoClimatico: Datos meteorológicos (temperatura, precipitación, humedad)
 *
 * Casos de uso:
 * - Correlación consumo vs temperatura: "Cuando temp > 30°C, consumo aumenta 18%"
 * - Alertas proactivas: "Pronóstico de ola de calor, activar reservas"
 * - Análisis histórico: "Sequía 2023 causó aumento de extracción en perforaciones"
 * - Balance ajustado: "Precipitación alta explica menor consumo residencial"
 *
 * Optimización MongoDB:
 * - Índice compuesto: { idEstacionClimaticaVirtual: 1, timestamp: -1 }
 * - TTL index opcional: Auto-eliminar datos > 1 año
 * - Particionado temporal si volumen es muy alto
 *
 * @example Dato observado actual
 * {
 *   idEstacionClimaticaVirtual: "ecv-eden-001",
 *   timestamp: "2025-11-06T14:00:00Z",
 *   temperatura: 28,
 *   humedad: 65,
 *   precipitacion: 0,
 *   velocidadViento: 15,
 *   tipoDato: "observado",
 *   calidadDato: "válida",
 *   idFuenteDatos: "visual-crossing-api"
 * }
 *
 * @example Pronóstico 7 días
 * {
 *   idEstacionClimaticaVirtual: "ecv-eden-001",
 *   timestamp: "2025-11-13T12:00:00Z",  // 7 días adelante
 *   temperaturaMinima: 18,
 *   temperaturaMaxima: 32,
 *   probabilidadPrecipitacion: 80,
 *   tipoDato: "pronostico",
 *   calidadDato: "válida",
 *   idFuenteDatos: "visual-crossing-api"
 * }
 */
export interface IDatoClimatico {
  _id?: string;
  idCliente: string;                    // Referencia a Cliente
  idEstacionClimaticaVirtual: string;   // Referencia a EstacionClimaticaVirtual

  /**
   * Timestamp del dato (ISO 8601)
   *
   * Para datos observados: Momento de la medición
   * Para pronósticos: Momento futuro predicho
   * Para estadísticos: Fecha representativa del promedio histórico
   */
  timestamp: string;

  // ==========================================
  // VARIABLES METEOROLÓGICAS BÁSICAS
  // ==========================================

  /**
   * Temperatura ambiente (°C)
   *
   * Temperatura del aire a 2 metros del suelo (estándar meteorológico).
   * Rango típico Uruguay: -5°C a 40°C
   */
  temperatura?: number;

  /**
   * Humedad relativa (%)
   *
   * Porcentaje de saturación de humedad en el aire.
   * Rango: 0-100%
   * Importante para cálculo de evaporación en depósitos abiertos.
   */
  humedad?: number;

  /**
   * Precipitación acumulada (mm)
   *
   * Para datos horarios: Acumulado en esa hora
   * Para datos diarios: Acumulado en ese día
   *
   * Relevante para:
   * - Recarga de acuíferos (perforaciones)
   * - Reducción de consumo de riego
   * - Incremento de caudal en red por infiltración
   */
  precipitacion?: number;

  /**
   * Presión atmosférica (hPa)
   *
   * Presión al nivel del mar (normalizada).
   * Rango típico Uruguay: 990-1030 hPa
   * Útil para pronósticos meteorológicos.
   */
  presionAtmosferica?: number;

  /**
   * Velocidad del viento (km/h)
   *
   * Velocidad promedio del viento.
   * Relevante para cálculo de evaporación.
   */
  velocidadViento?: number;

  /**
   * Dirección del viento (grados)
   *
   * Convención meteorológica:
   * - 0° = Norte
   * - 90° = Este
   * - 180° = Sur
   * - 270° = Oeste
   *
   * Rango: 0-360°
   */
  direccionViento?: number;

  /**
   * Cobertura de nubes (%)
   *
   * Porcentaje del cielo cubierto por nubes.
   * Rango: 0-100%
   * - 0-25%: Despejado
   * - 25-75%: Parcialmente nublado
   * - 75-100%: Nublado
   */
  coberturaNubes?: number;

  /**
   * Índice UV (0-11+)
   *
   * Índice de radiación ultravioleta.
   * - 0-2: Bajo
   * - 3-5: Moderado
   * - 6-7: Alto
   * - 8-10: Muy alto
   * - 11+: Extremo
   */
  indiceUV?: number;

  /**
   * Visibilidad (km)
   *
   * Distancia máxima de visibilidad horizontal.
   * Rango típico: 0-50 km
   */
  visibilidad?: number;

  /**
   * Punto de rocío (°C)
   *
   * Temperatura a la que el aire se satura de humedad.
   * Útil para:
   * - Cálculo de evaporación
   * - Predicción de niebla
   * - Comfort térmico
   */
  puntoRocio?: number;

  /**
   * Sensación térmica (°C)
   *
   * Temperatura percibida considerando viento y humedad.
   * Más relevante que temperatura real para correlaciones de consumo.
   */
  sensacionTermica?: number;

  // ==========================================
  // VARIABLES ESPECÍFICAS PARA PRONÓSTICOS
  // ==========================================

  /**
   * Probabilidad de precipitación (%)
   *
   * Solo para tipoDato = 'pronostico'
   * Rango: 0-100%
   *
   * Útil para alertas operacionales:
   * - > 70%: Alta probabilidad de lluvia, ajustar operación
   */
  probabilidadPrecipitacion?: number;

  /**
   * Temperatura mínima del día (°C)
   *
   * Solo para pronósticos diarios.
   * Útil para planificación operativa.
   */
  temperaturaMinima?: number;

  /**
   * Temperatura máxima del día (°C)
   *
   * Solo para pronósticos diarios.
   * Crítica para alertas de consumo:
   * - > 35°C: Ola de calor, esperar aumento 15-20% consumo
   */
  temperaturaMaxima?: number;

  // ==========================================
  // METADATA
  // ==========================================

  /**
   * Tipo de dato climático
   *
   * - 'observado': Dato real actual o histórico
   * - 'pronostico': Predicción futura (1-15 días adelante)
   * - 'estadistico': Promedio histórico, climatología
   */
  tipoDato: TipoDatoClimatico;

  /**
   * Calidad del dato
   *
   * - 'válida': Dato confiable
   * - 'sospechosa': Fuera de patrón pero en rango físico
   * - 'error': Fuera de rango físico o error de comunicación
   * - 'interpolada': Calculada para llenar gap
   * - 'calculada': Derivada de otras lecturas
   */
  calidadDato: CalidadDato;

  /**
   * Fuente de datos climáticos
   *
   * Referencia a FuenteDatos (tipo 'clima')
   * Ejemplos:
   * - "visual-crossing-api"
   * - "inumet-api"
   * - "openweathermap-api"
   */
  idFuenteDatos: string;

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;               // Auto-generado (ISO 8601), inmutable

  // Virtuals (poblados por backend en queries)
  estacionClimaticaVirtual?: any;       // IEstacionClimaticaVirtual
  fuenteDatos?: any;                    // IFuenteDatos
}

/**
 * DTO para crear dato climático
 */
export interface ICreateDatoClimatico extends Omit<
  Partial<IDatoClimatico>,
  '_id' | 'fechaCreacion' | 'estacionClimaticaVirtual' | 'fuenteDatos'
> {
  // Campos requeridos
  idCliente: string;
  idEstacionClimaticaVirtual: string;
  timestamp: string;
  tipoDato: TipoDatoClimatico;
  calidadDato: CalidadDato;
  idFuenteDatos: string;
}

/**
 * DTO para actualizar dato climático
 */
export interface IUpdateDatoClimatico extends Omit<
  Partial<IDatoClimatico>,
  '_id' | 'idCliente' | 'idEstacionClimaticaVirtual' | 'fechaCreacion' |
  'estacionClimaticaVirtual' | 'fuenteDatos'
> {}
