/**
 * Metadatos de origen para trazabilidad de datos
 *
 * Documentan desde qué sistema y cuándo se ingirió un dato.
 * Usado principalmente en ILectura para rastrear la fuente de los datos.
 */
export interface IMetadatosDeOrigen {
  fuente: string;              // ID de FuenteDatos (ej: "SCADA Zeus", "ATLAS")
  timestampIngesta: string;    // Cuándo se ingirió a RIOTEC (ISO 8601)
  timestampOrigen?: string;    // Timestamp del sistema de origen (si difiere)
  metodoIntegracion?: string;  // 'api_rest' | 'opc_ua' | 'csv' | 'manual'
  camposEspecificos?: Record<string, any>; // Campos específicos del sistema origen
}

/**
 * Metadatos técnicos flexibles
 *
 * Usados para almacenar información específica por tipo de entidad
 * sin crear campos rígidos en el modelo.
 *
 * Ejemplos:
 * - PuntoMedicion tipo 'booster': { capacidadBombeo: 100, potencia: 50 }
 * - PuntoMedicion tipo 'deposito': { capacidadAlmacenamiento: 1000, materialTanque: 'acero' }
 * - PuntoMedicion tipo 'residencial': { diametro: 13, fabricante: 'Elster', modelo: 'V100' }
 */
export type IMetadatosTecnicos = Record<string, any>;
