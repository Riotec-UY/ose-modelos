import { IUbicacionGeografica } from './ubicacion-geografica';

/**
 * Estado de una estación climática virtual
 */
export type EstadoEstacionClimaticaVirtual =
  | 'activa'        // Polling operativo, datos actualizándose
  | 'pausada'       // Temporalmente desactivada (manual)
  | 'error'         // Error en última sincronización (API falló)
  | 'inactiva';     // Desactivada permanentemente (sin puntos asociados)


/**
 * Snapshot de última lectura climática
 *
 * Embebido en EstacionClimaticaVirtual para acceso instantáneo
 * sin consultar la colección DatoClimatico.
 *
 * Se actualiza automáticamente en cada polling horario.
 */
export interface ISnapshotClimatico {
  /** Timestamp de la lectura (ISO 8601) */
  timestamp: string;

  /** Temperatura ambiente (°C) */
  temperatura?: number;

  /** Humedad relativa (%) */
  humedad?: number;

  /** Precipitación acumulada última hora (mm) */
  precipitacion?: number;

  /** Presión atmosférica (hPa) */
  presionAtmosferica?: number;

  /** Velocidad del viento (km/h) */
  velocidadViento?: number;

  /** Dirección del viento (grados, 0=Norte, 90=Este, 180=Sur, 270=Oeste) */
  direccionViento?: number;

  /** Cobertura de nubes (%, 0-100) */
  coberturaNubes?: number;

  /** Índice UV (0-11+) */
  indiceUV?: number;

  /** Sensación térmica (°C) */
  sensacionTermica?: number;
}

/**
 * Estación Climática Virtual
 *
 * Punto lógico (NO físico) que agrupa datos climáticos para un área geográfica.
 * Se crea automáticamente para optimizar llamadas a APIs climáticas,
 * asignando un radio de cobertura (por defecto 15 km).
 *
 * Características:
 * - **Virtual**: No representa hardware físico, es un concepto lógico
 * - **Creación automática**: Se crea al agregar un PuntoMedicion sin estación cercana
 * - **Radio de acción**: 15 km por defecto (configurable según topografía)
 * - **Polling automático**: Cada hora, actualización proactiva de datos
 * - **Relación geográfica**: Asociación dinámica por proximidad (no hard-coded)
 * - **Optimización**: Reduce API calls en 98% (ej: 326 puntos → 4 estaciones)
 *
 * Diferencias con estación física (INUMET):
 * - No es hardware instalado en campo
 * - Es un punto de consulta a APIs externas (Visual Crossing, INUMET, etc.)
 * - Optimiza consumo de servicios meteorológicos
 * - Múltiples puntos de medición comparten una estación virtual
 *
 * Casos de uso:
 * - Zona urbana concentrada: 1 estación virtual → 100 puntos de medición
 * - Zona rural dispersa: 3 estaciones virtuales → 100 puntos de medición
 * - Ahorro: Piloto Maldonado 326 medidores: 7,824 → 96 API calls/día (98% reducción)
 *
 * Patrón MongoDB-optimized:
 * - Snapshot embebido (ultimaLectura): Acceso ultra-rápido
 * - Historial completo: Colección separada DatoClimatico
 * - Índices geoespaciales: Queries de proximidad eficientes
 *
 * @example Estación virtual para zona Edén
 * {
 *   nombre: "Estación Climática Virtual Pueblo Edén",
 *   codigo: "ECV-EDEN-001",
 *   ubicacion: {
 *     type: "Point",
 *     coordinates: [-54.7123, -34.6456]
 *   },
 *   radioCoberturaKm: 15,
 *   idFuenteDatos: "visual-crossing-api",
 *   frecuenciaPollingMinutos: 60,
 *   estado: "activa",
 *   creadoPor: "automatico",
 *   ultimaLectura: {
 *     timestamp: "2025-11-06T14:00:00Z",
 *     temperatura: 24,
 *     humedad: 65,
 *     precipitacion: 0
 *   }
 * }
 */
export interface IEstacionClimaticaVirtual {
  _id?: string;
  idCliente: string;               // Referencia a Cliente
  idDivision?: string;             // Referencia a División (opcional)
  idJefatura?: string;             // Referencia a Jefatura (opcional)

  // Identificación
  nombre: string;                  // ej: "Estación Climática Virtual Pueblo Edén"
  codigo?: string;                 // Código único (ej: "ECV-EDEN-001")
  descripcion?: string;            // Descripción adicional

  /**
   * Ubicación central de la estación virtual (punto de consulta API)
   *
   * Este punto se usa para:
   * - Consultar APIs climáticas externas
   * - Calcular distancias a puntos de medición
   * - Determinar qué puntos están dentro del radio de cobertura
   *
   * Generalmente coincide con la ubicación del primer PuntoMedicion
   * que causó la creación de esta estación.
   */
  ubicacion: IUbicacionGeografica;

  /**
   * Radio de cobertura en kilómetros
   *
   * Define el área de influencia de la estación virtual.
   * Todos los puntos de medición dentro de este radio compartirán
   * los datos climáticos de esta estación.
   *
   * Valores típicos:
   * - Zona plana: 15-20 km (por defecto 15 km)
   * - Zona montañosa: 5-10 km (microclimas)
   * - Zona costera: 10-15 km (influencia marítima)
   *
   * Se usa en queries geoespaciales MongoDB ($geoWithin, $nearSphere)
   */
  radioCoberturaKm: number;

  // Configuración de integración con API climática
  idFuenteDatos: string;           // Referencia a FuenteDatos (ej: "visual-crossing-api")

  /**
   * Frecuencia de polling en minutos
   *
   * Define cada cuántos minutos se actualiza la estación.
   * Valor típico: 60 (cada hora)
   *
   * Consideraciones:
   * - Muy frecuente (<30 min): Mayor costo API, datos más actuales
   * - Moderado (60 min): Balance óptimo para la mayoría de casos
   * - Poco frecuente (>120 min): Menor costo, puede perder eventos climáticos
   */
  frecuenciaPollingMinutos: number;

  /** Timestamp última actualización exitosa (ISO 8601) */
  ultimaActualizacion?: string;

  /** Timestamp próxima actualización programada (ISO 8601) */
  proximaActualizacionProgramada?: string;

  /**
   * Snapshot de última lectura climática
   *
   * Permite acceso ultra-rápido sin consultar colección DatoClimatico.
   * Se actualiza automáticamente en cada polling exitoso.
   *
   * Para historial completo o consultas temporales, usar colección DatoClimatico.
   */
  ultimaLectura?: ISnapshotClimatico;

  // Estado operacional
  estado: EstadoEstacionClimaticaVirtual;

  /**
   * Metadata de creación
   *
   * - 'automatico': Creada automáticamente al agregar un PuntoMedicion
   * - 'manual': Creada manualmente por usuario (casos especiales)
   */
  creadoPor: 'automatico' | 'manual';

  /**
   * ID del punto de medición que originó la creación automática
   *
   * Solo presente si creadoPor = 'automatico'.
   * Útil para auditoría y trazabilidad.
   */
  idPuntoMedicionOrigen?: string;

  /**
   * Información del último error de API
   *
   * Se registra cuando el polling falla.
   * Útil para debugging y alertas.
   */
  ultimoErrorApi?: {
    timestamp: string;
    mensaje: string;
    codigo?: string;
  };

  /**
   * Contador de errores consecutivos
   *
   * Se resetea a 0 cuando una sincronización es exitosa.
   * Si supera cierto umbral (ej: 5), se puede marcar estado = 'error'.
   */
  contadorErroresConsecutivos?: number;

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;          // Auto-generado (ISO 8601), inmutable
  fechaDesactivacion?: string;     // ISO 8601 (si estado = 'inactiva')

  // Virtuals (poblados por backend en queries)
  cliente?: any;                   // ICliente
  division?: any;                  // IDivision
  jefatura?: any;                  // IJefatura
  fuenteDatos?: any;               // IFuenteDatos

  /**
   * Cantidad de puntos de medición asociados (virtual, calculado)
   *
   * Se calcula con query geoespacial:
   * Contar PuntoMedicion dentro del radioCoberturaKm.
   *
   * Útil para:
   * - Detectar estaciones "huérfanas" (count = 0, candidatas a eliminación)
   * - Estadísticas de cobertura
   * - Optimización de grid de estaciones
   */
  puntosAsociadosCount?: number;
}

/**
 * DTO para crear estación climática virtual
 */
export interface ICreateEstacionClimaticaVirtual extends Omit<
  Partial<IEstacionClimaticaVirtual>,
  '_id' | 'ultimaLectura' | 'puntosAsociadosCount' | 'ultimoErrorApi' |
  'contadorErroresConsecutivos' | 'fechaCreacion' | 'fechaDesactivacion' |
  'cliente' | 'division' | 'jefatura' | 'fuenteDatos'
> {
  // Campos requeridos
  idCliente: string;
  nombre: string;
  ubicacion: IUbicacionGeografica;
  radioCoberturaKm: number;
  idFuenteDatos: string;
  frecuenciaPollingMinutos: number;
  estado: EstadoEstacionClimaticaVirtual;
  creadoPor: 'automatico' | 'manual';
}

/**
 * DTO para actualizar estación climática virtual
 */
export interface IUpdateEstacionClimaticaVirtual extends Omit<
  Partial<IEstacionClimaticaVirtual>,
  '_id' | 'puntosAsociadosCount' | 'fechaCreacion' |
  'cliente' | 'division' | 'jefatura' | 'fuenteDatos'
> {}
