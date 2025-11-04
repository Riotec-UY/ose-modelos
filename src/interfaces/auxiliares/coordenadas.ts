/**
 * Coordenadas geográficas (latitud, longitud)
 * Usadas para ubicación de puntos de medición, distritos, etc.
 */
export interface ICoordenadas {
  latitud: number;   // -90 a 90
  longitud: number;  // -180 a 180
  altitud?: number;  // metros sobre nivel del mar (opcional)
}
