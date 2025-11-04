/**
 * Configuración de Lectura por Punto de Medición
 *
 * Define qué tipos de lecturas DEBE tener un punto de medición específico.
 * Permite configurar la operatoria esperada, frecuencias, y validaciones.
 *
 * Caso de uso:
 * - "Booster Hospital" debe tener lecturas de presión entrada, presión salida y caudal cada 5 min
 * - "Perforación Edén" debe tener lecturas de caudal cada 5 min y nivel cada 30 min
 * - Generar alertas si una lectura obligatoria no llega en el tiempo esperado
 */

import { TipoLectura } from '../datos/lectura';
import { IMetadatosAuditoria } from '../auxiliares/metadatos';

/**
 * Configuración de una lectura esperada para un punto de medición
 */
export interface IConfiguracionLecturaPunto {
  _id?: string;

  // Relación con punto de medición
  idPuntoMedicion: string;
  idCliente: string;

  // Tipo de lectura esperada
  tipoLectura: TipoLectura;

  // Configuración operativa
  frecuenciaEsperada: number; // minutos entre lecturas
  obligatoria: boolean; // true = generar alerta si falta

  // Validación de valores
  rangoValido?: {
    minimo?: number;
    maximo?: number;
    unidad: string;
  };

  // Tolerancias
  toleranciaRetraso?: number; // minutos de tolerancia antes de alertar (default: 2x frecuencia)
  umbralCalidadMinima?: 'válida' | 'sospechosa' | 'error'; // Calidad mínima aceptable

  // Estado de la configuración
  activa: boolean;
  fechaActivacion?: string;
  fechaDesactivacion?: string;

  // Notas operativas
  descripcion?: string;
  notas?: string;

  // Metadatos
  metadatosAuditoria?: IMetadatosAuditoria;

  // Virtuals (poblados por backend)
  puntoMedicion?: any; // IPuntoMedicion
}

/**
 * DTO para crear configuración de lectura
 */
export interface ICreateConfiguracionLecturaPunto extends Omit<
  Partial<IConfiguracionLecturaPunto>,
  '_id' | 'metadatosAuditoria' | 'puntoMedicion'
> {
  // Campos requeridos
  idPuntoMedicion: string;
  idCliente: string;
  tipoLectura: TipoLectura;
  frecuenciaEsperada: number;
  obligatoria: boolean;
}

/**
 * DTO para actualizar configuración de lectura
 */
export interface IUpdateConfiguracionLecturaPunto extends Omit<
  Partial<IConfiguracionLecturaPunto>,
  '_id' | 'idPuntoMedicion' | 'idCliente' | 'metadatosAuditoria' | 'puntoMedicion'
> {}
