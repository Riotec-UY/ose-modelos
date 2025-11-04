import { ICoordenadas } from '../auxiliares';

/**
 * Ubicación Geográfica - Posición física en el territorio
 *
 * Representa la ubicación completa de un punto (coordenadas + referencias espaciales).
 * Puede incluir datos de referencia adicionales como ciudad, barrio, etc.
 */
export interface IUbicacionGeografica {
  coordenadas: ICoordenadas;         // Lat/Lng/Altitud
  direccionPostal?: string;          // ej: "Calle Principal 123, Pueblo Edén"
  ciudad?: string;                   // ej: "Maldonado"
  departamento?: string;             // ej: "Maldonado"
  barrio?: string;                   // ej: "Pueblo Edén"
  codigoPostal?: string;             // Código postal
  referenciasAdicionales?: string;   // ej: "Frente a la plaza principal"
  wkt?: string;                      // Well-Known Text (para geometrías complejas)
  geojson?: Record<string, any>;     // GeoJSON completo (opcional)
}
