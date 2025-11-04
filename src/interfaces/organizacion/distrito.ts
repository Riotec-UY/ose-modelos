import { ICoordenadas, IMetadatosAuditoria } from '../auxiliares';

/**
 * Distrito Pitométrico - Zona de balance hídrico
 *
 * Representa un distrito pitométrico (DMA - District Metered Area).
 * Es la unidad básica de análisis de balance hídrico.
 *
 * Características:
 * - Pertenece a una Jefatura
 * - Contiene múltiples PuntoMedicion
 * - Tiene frontera geográfica definida (polígono o lista de puntos)
 * - Punto único de entrada de agua (generalmente)
 * - Permite calcular: Entrada - Salida = Pérdidas
 */
export interface IDistrito {
  _id?: string;
  idJefatura: string;                 // Referencia a Jefatura
  nombre: string;                     // ej: "Distrito Pueblo Edén"
  codigo?: string;                    // Código interno único
  descripcion?: string;               // Descripción del distrito
  activo?: boolean;                   // Estado operacional

  // Delimitación geográfica
  frontera?: {
    tipo: 'polygon' | 'circle' | 'points'; // Tipo de delimitación
    coordenadas?: ICoordenadas[];          // Puntos del polígono o lista de ubicaciones
    centro?: ICoordenadas;                 // Centro geográfico (para círculos)
    radio?: number;                        // Radio en metros (si tipo: 'circle')
    geojson?: Record<string, any>;         // GeoJSON completo (opcional)
  };

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

  metadatosAuditoria?: IMetadatosAuditoria;

  // Virtuals (populados por query)
  jefatura?: any; // IJefatura
}

/**
 * DTO para crear un distrito
 */
export interface ICreateDistrito extends Omit<Partial<IDistrito>, '_id' | 'jefatura'> {
  idJefatura: string; // Requerido
  nombre: string;     // Requerido
}

/**
 * DTO para actualizar un distrito
 */
export interface IUpdateDistrito extends Omit<Partial<IDistrito>, '_id' | 'jefatura'> {}
