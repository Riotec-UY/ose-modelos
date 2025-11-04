/**
 * Coordenadas geográficas (latitud, longitud)
 *
 * **IMPORTANTE**: Este formato es para compatibilidad y lectura humana.
 * Para almacenamiento en MongoDB y queries espaciales, usar IGeoJSON.
 *
 * **Diferencias clave**:
 * - ICoordenadas: { latitud, longitud } (orden natural)
 * - IGeoJSON: [longitud, latitud] (estándar GeoJSON/MongoDB)
 *
 * **Recomendación**: Preferir IGeoJSON para nuevas implementaciones.
 * Este tipo se mantiene para compatibilidad y casos donde se necesita
 * lectura/escritura simple sin queries espaciales.
 *
 * @see IGeoJSONPoint para el formato GeoJSON equivalente
 */
export interface ICoordenadas {
  /** Latitud (Norte-Sur): -90 a +90 */
  latitud: number;

  /** Longitud (Este-Oeste): -180 a +180 */
  longitud: number;

  /** Altitud en metros sobre nivel del mar (opcional) */
  altitud?: number;
}
