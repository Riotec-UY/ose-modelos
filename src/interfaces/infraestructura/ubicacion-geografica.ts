import { ICoordenadas, IGeoJSON } from '../auxiliares';

/**
 * Ubicación Geográfica - Posición física en el territorio
 *
 * Representa la ubicación completa de un punto o área (geometría + referencias espaciales).
 *
 * **Modelo híbrido GeoJSON + metadatos**:
 * - `geojson`: Geometría estándar GeoJSON (Point, Polygon, etc.) - PRINCIPAL
 * - `coordenadas`: Helper opcional para lectura simple (COMPATIBILIDAD)
 *
 * **Preferir GeoJSON** para:
 * - ✅ Queries espaciales en MongoDB ($geoNear, $geoWithin)
 * - ✅ Estándar de industria (RFC 7946)
 * - ✅ Interoperabilidad con mapas (Google Maps, OpenStreetMap, etc.)
 * - ✅ Soporte de polígonos, líneas, círculos
 *
 * **Usar coordenadas** solo para:
 * - Lectura/escritura simple sin queries espaciales
 * - Compatibilidad con código existente
 *
 * @see IGeoJSON para tipos de geometría soportados
 */
export interface IUbicacionGeografica {
  /**
   * Geometría GeoJSON (formato estándar MongoDB)
   *
   * Tipos soportados:
   * - IGeoJSONPoint: Ubicación puntual (medidor, booster, etc.)
   * - IGeoJSONPolygon: Área cerrada (distrito, jefatura, etc.)
   * - IGeoJSONCircle: Área circular (zona de cobertura)
   * - IGeoJSONLineString: Línea/tramo (red de cañerías)
   * - IGeoJSONMultiPolygon: Múltiples áreas (división multi-zona)
   *
   * **IMPORTANTE**: coordinates siempre [longitud, latitud], no [lat, lng]
   */
  geojson: IGeoJSON;

  /**
   * Coordenadas simples (opcional - solo para compatibilidad)
   *
   * @deprecated Preferir usar geojson para nuevas implementaciones
   *
   * Si se proporciona, debe ser consistente con geojson.coordinates
   * (si geojson es Point). Este campo existe para facilitar lectura
   * humana y compatibilidad con código existente.
   */
  coordenadas?: ICoordenadas;

  /** Dirección postal completa */
  direccionPostal?: string;          // ej: "Calle Principal 123, Pueblo Edén"

  /** Ciudad */
  ciudad?: string;                   // ej: "Maldonado"

  /** Departamento (provincia/estado) */
  departamento?: string;             // ej: "Maldonado"

  /** Barrio o localidad */
  barrio?: string;                   // ej: "Pueblo Edén"

  /** Código postal */
  codigoPostal?: string;

  /** Referencias adicionales para ubicación en terreno */
  referenciasAdicionales?: string;   // ej: "Frente a la plaza principal, portón verde"

  /**
   * Well-Known Text (opcional - legacy)
   *
   * @deprecated Preferir usar geojson en su lugar
   *
   * WKT es un formato texto para geometrías (ej: "POINT(-54.9333 -34.9167)").
   * Se mantiene para compatibilidad con sistemas GIS legacy.
   */
  wkt?: string;
}
