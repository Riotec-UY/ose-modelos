import { IGeoJSON } from '../auxiliares/geojson';

/**
 * Distrito Pitométrico - Zona de balance hídrico
 *
 * Representa un distrito pitométrico (DMA - District Metered Area).
 * Es la unidad básica de análisis de balance hídrico.
 *
 * Características:
 * - Pertenece a una Jefatura
 * - Contiene múltiples PuntoMedicion
 * - Tiene frontera geográfica definida como Polygon o Circle (GeoJSON)
 * - Punto único de entrada de agua (generalmente)
 * - Permite calcular: Entrada - Salida = Pérdidas
 *
 * **Frontera GeoJSON**:
 * - Polygon: Distrito con forma irregular (más común)
 * - Circle: Distrito circular (más simple, área de cobertura)
 */
export interface IDistrito {
  _id?: string;
  idJefatura: string;                 // Referencia a Jefatura
  nombre: string;                     // ej: "Distrito Pueblo Edén"
  codigo?: string;                    // Código interno único
  descripcion?: string;               // Descripción del distrito
  activo?: boolean;                   // Estado operacional

  /**
   * Delimitación geográfica del distrito (GeoJSON)
   *
   * Tipos típicos:
   * - IGeoJSONPolygon: Distrito con frontera irregular (más común)
   * - IGeoJSONCircle: Distrito circular (área de cobertura simple)
   *
   * El polígono define la zona de balance hídrico donde:
   * - Se contabilizan todos los puntos de entrada (boosters, perforaciones)
   * - Se contabilizan todos los puntos de salida (consumo residencial)
   * - Se calcula: Balance = Entrada - Salida
   *
   * @example Distrito con polígono
   * {
   *   type: "Polygon",
   *   coordinates: [
   *     [
   *       [-54.9300, -34.9100],
   *       [-54.9400, -34.9100],
   *       [-54.9400, -34.9200],
   *       [-54.9300, -34.9200],
   *       [-54.9300, -34.9100]  // Cierre
   *     ]
   *   ]
   * }
   *
   * @example Distrito circular
   * {
   *   type: "Point",
   *   coordinates: [-54.9350, -34.9150],
   *   radius: 500  // 500 metros
   * }
   */
  frontera?: IGeoJSON;

  // Características operacionales
  poblacion?: number;                 // Población servida
  conexiones?: number;                // Número de conexiones
  redKm?: number;                     // Kilómetros de red

  // Configuración del balance
  configuracionBalance?: {
    horaInicioBalance?: string;       // ej: "00:00" (hora del día para balance diario)
    periodoBalance?: 'diario' | 'semanal' | 'mensual';
    umbralPerdidas?: number;          // % umbral de alerta de pérdidas
    metodoCalculo?: 'simple' | 'avanzado'; // Método de cálculo del balance
  };

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;            // Auto-generado (ISO 8601), inmutable

  // Virtuals (populados por query)
  jefatura?: any; // IJefatura
}

/**
 * DTO para crear un distrito
 */
export interface ICreateDistrito extends Omit<Partial<IDistrito>, '_id' | 'jefatura' | 'fechaCreacion'> {
  idJefatura: string; // Requerido
  nombre: string;     // Requerido
}

/**
 * DTO para actualizar un distrito
 */
export interface IUpdateDistrito extends Omit<Partial<IDistrito>, '_id' | 'jefatura' | 'fechaCreacion'> {}
