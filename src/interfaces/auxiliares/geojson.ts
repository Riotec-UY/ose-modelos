/**
 * GeoJSON Types - Representación geográfica estándar
 *
 * Basado en RFC 7946 (https://tools.ietf.org/html/rfc7946)
 * Compatible con MongoDB GeoJSON queries ($geoNear, $geoWithin, etc.)
 *
 * IMPORTANTE: coordinates siempre en orden [longitud, latitud]
 * (NO [latitud, longitud] como es común en otras APIs)
 *
 * Patrón adaptado desde IRIX (producción probada)
 * Ver: https://www.mongodb.com/docs/manual/reference/geojson/
 */

/**
 * Union type de todos los tipos de geometría GeoJSON soportados
 *
 * Uso en MongoDB:
 * - Crear índice: db.collection.createIndex({ geojson: "2dsphere" })
 * - Query espacial: db.collection.find({ geojson: { $geoWithin: { ... } } })
 */
export type IGeoJSON =
  | IGeoJSONPoint
  | IGeoJSONCircle
  | IGeoJSONLineString
  | IGeoJSONPolygon
  | IGeoJSONMultiPolygon;

/**
 * 🗺️ GeoJSON Point - Punto geográfico único
 *
 * Representa una ubicación específica (coordenada única).
 *
 * Uso típico:
 * - Punto de medición (medidor, booster, perforación)
 * - Ubicación de un activo
 * - Posición GPS
 *
 * **IMPORTANTE**: Orden de coordenadas [longitud, latitud]
 *
 * @example
 * {
 *   type: "Point",
 *   coordinates: [-54.9333, -34.9167]  // Maldonado, Uruguay
 * }                 ^^^^^^   ^^^^^^^
 *                   lng      lat
 */
export interface IGeoJSONPoint {
  /** Tipo de geometría (siempre "Point") */
  type: "Point";

  /**
   * Coordenadas del punto: [longitud, latitud]
   *
   * - coordinates[0] = longitud (Este-Oeste, -180 a +180)
   * - coordinates[1] = latitud (Norte-Sur, -90 a +90)
   *
   * Opcionalmente puede incluir altitud como tercer elemento:
   * - coordinates[2] = altitud en metros (opcional)
   */
  coordinates: [number, number] | [number, number, number];
}

/**
 * 🗺️ GeoJSON Circle - Círculo geográfico (extensión no-estándar)
 *
 * Representa un área circular alrededor de un punto central.
 *
 * **NOTA**: No es parte del estándar GeoJSON RFC 7946, pero es soportado
 * por MongoDB para queries espaciales como $geoWithin con $centerSphere.
 *
 * Uso típico:
 * - Área de cobertura de un booster
 * - Radio de influencia de una perforación
 * - Zona de alerta alrededor de un punto crítico
 *
 * @example
 * {
 *   type: "Point",
 *   coordinates: [-54.9333, -34.9167],
 *   radius: 500  // 500 metros de radio
 * }
 */
export interface IGeoJSONCircle {
  /** Tipo de geometría (siempre "Point" para círculos) */
  type: "Point";

  /** Coordenadas del centro: [longitud, latitud] */
  coordinates: [number, number] | [number, number, number];

  /** Radio del círculo en metros */
  radius: number;
}

/**
 * 🗺️ GeoJSON LineString - Línea geográfica
 *
 * Representa una secuencia de puntos conectados formando una línea.
 *
 * Uso típico:
 * - Red de cañerías (tubería entre dos puntos)
 * - Recorrido de vehículos
 * - Tramo de red de distribución
 *
 * **Mínimo**: 2 puntos
 *
 * @example
 * {
 *   type: "LineString",
 *   coordinates: [
 *     [-54.9333, -34.9167],  // Punto A
 *     [-54.9400, -34.9200],  // Punto B
 *     [-54.9500, -34.9250]   // Punto C
 *   ]
 * }
 */
export interface IGeoJSONLineString {
  /** Tipo de geometría (siempre "LineString") */
  type: "LineString";

  /**
   * Array de coordenadas que forman la línea: [[lng, lat], [lng, lat], ...]
   *
   * - Mínimo 2 puntos
   * - coordinates[n][0] = longitud del punto n
   * - coordinates[n][1] = latitud del punto n
   */
  coordinates: [number, number][];
}

/**
 * 🗺️ GeoJSON Polygon - Polígono geográfico cerrado
 *
 * Representa un área geográfica cerrada (región delimitada).
 *
 * Uso típico:
 * - **Distrito pitométrico** (zona de balance hídrico) ⭐
 * - Jefatura territorial (área administrativa)
 * - Zona de cobertura de red
 * - Área de influencia
 *
 * Estructura:
 * - coordinates[0] = anillo exterior (borde del polígono)
 * - coordinates[1...n] = anillos interiores (huecos/islas) - OPCIONAL
 *
 * **Reglas**:
 * - El primer y último punto DEBEN ser idénticos (cerrar el polígono)
 * - Anillo exterior debe ser antihorario (counterclockwise)
 * - Anillos interiores (huecos) deben ser horarios (clockwise)
 * - Mínimo 4 puntos (triángulo + punto de cierre)
 *
 * @example
 * // Distrito pitométrico Pueblo Edén
 * {
 *   type: "Polygon",
 *   coordinates: [
 *     [  // Anillo exterior (borde del distrito)
 *       [-54.9300, -34.9100],  // Punto 1
 *       [-54.9400, -34.9100],  // Punto 2
 *       [-54.9400, -34.9200],  // Punto 3
 *       [-54.9300, -34.9200],  // Punto 4
 *       [-54.9300, -34.9100]   // Cierre (igual a punto 1)
 *     ]
 *     // Opcional: anillos interiores (zonas excluidas)
 *   ]
 * }
 */
export interface IGeoJSONPolygon {
  /** Tipo de geometría (siempre "Polygon") */
  type: "Polygon";

  /**
   * Array de anillos (exterior + interiores opcionales)
   *
   * - coordinates[0] = anillo exterior (array de puntos)
   * - coordinates[0][n][0] = longitud del punto n
   * - coordinates[0][n][1] = latitud del punto n
   * - coordinates[1...] = anillos interiores (huecos) - OPCIONAL
   *
   * IMPORTANTE: Primer y último punto deben ser idénticos
   */
  coordinates: [[number, number][]];
}

/**
 * 🗺️ GeoJSON MultiPolygon - Múltiples polígonos geográficos
 *
 * Representa una colección de polígonos que forman una sola geometría.
 *
 * Uso típico:
 * - División territorial con múltiples áreas no contiguas
 * - Jefatura con zonas separadas
 * - Cliente con múltiples zonas de servicio
 *
 * @example
 * {
 *   type: "MultiPolygon",
 *   coordinates: [
 *     [  // Polígono 1
 *       [  // Anillo exterior polígono 1
 *         [-54.9300, -34.9100],
 *         [-54.9400, -34.9100],
 *         [-54.9400, -34.9200],
 *         [-54.9300, -34.9100]
 *       ]
 *     ],
 *     [  // Polígono 2
 *       [  // Anillo exterior polígono 2
 *         [-54.9500, -34.9300],
 *         [-54.9600, -34.9300],
 *         [-54.9600, -34.9400],
 *         [-54.9500, -34.9300]
 *       ]
 *     ]
 *   ]
 * }
 */
export interface IGeoJSONMultiPolygon {
  /** Tipo de geometría (siempre "MultiPolygon") */
  type: "MultiPolygon";

  /**
   * Array de polígonos
   *
   * - coordinates[i] = polígono i (array de anillos)
   * - coordinates[i][j] = anillo j del polígono i (array de puntos)
   * - coordinates[i][j][k][0] = longitud del punto k del anillo j del polígono i
   * - coordinates[i][j][k][1] = latitud del punto k del anillo j del polígono i
   */
  coordinates: number[][][][];
}

/**
 * Helper: Crear un Point GeoJSON desde lat/lng
 *
 * **CUIDADO**: Invierte el orden (latitud, longitud) → [longitud, latitud]
 */
export const crearGeoJSONPoint = (latitud: number, longitud: number, altitud?: number): IGeoJSONPoint => {
  const coordinates: [number, number] | [number, number, number] = altitud !== undefined
    ? [longitud, latitud, altitud]
    : [longitud, latitud];

  return {
    type: "Point",
    coordinates
  };
};

/**
 * Helper: Extraer lat/lng de un Point GeoJSON
 *
 * **CUIDADO**: Invierte el orden [longitud, latitud] → { latitud, longitud }
 */
export const extraerLatLngDePoint = (point: IGeoJSONPoint): { latitud: number; longitud: number; altitud?: number } => {
  return {
    longitud: point.coordinates[0],
    latitud: point.coordinates[1],
    altitud: point.coordinates[2]
  };
};
