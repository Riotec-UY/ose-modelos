
/**
 * Tipo de anomalía detectada
 */
export type TipoAnomalia =
  | 'fuga'                 // Fuga de agua detectada
  | 'consumo_anormal'      // Consumo fuera de patrón
  | 'caida_presion'        // Caída anormal de presión
  | 'caida_cloro'          // Cloro por debajo del mínimo
  | 'sin_comunicacion'     // Pérdida de comunicación con dispositivo
  | 'error_medidor'        // Error en medidor/sensor
  | 'otra';                // Otro tipo de anomalía

/**
 * Severidad de la anomalía
 */
export type SeveridadAnomalia =
  | 'baja'      // Respuesta <24h, resolución <1 semana
  | 'media'     // Respuesta <4h, resolución <3 días
  | 'alta'      // Respuesta <1h, resolución <24h
  | 'crítica';  // Respuesta <15 min, resolución <2h

/**
 * Estado del ciclo de vida de la anomalía
 */
export type EstadoAnomalia =
  | 'detectada'      // Recién detectada por el sistema
  | 'investigando'   // En proceso de investigación
  | 'confirmada'     // Confirmada como anomalía real
  | 'falsa_alarma'   // Descartada como falsa alarma
  | 'resuelta';      // Resuelta exitosamente

/**
 * Anomalía - Situación anormal que requiere atención
 *
 * Representa una anomalía detectada automáticamente o reportada manualmente
 * que requiere investigación y posible intervención.
 *
 * Características:
 * - Ciclo de vida: detectada → investigando → confirmada → resuelta
 * - SLAs definidos por severidad
 * - Trazabilidad completa de acciones
 */
export interface IAnomalia {
  _id?: string;
  idCliente: string;               // Referencia a Cliente
  idDivision?: string;             // Referencia a División (opcional)
  idJefatura?: string;             // Referencia a Jefatura (opcional)
  idDistrito?: string;             // Referencia a Distrito (opcional)
  idPuntoMedicion?: string;        // Referencia a PuntoMedicion (opcional)

  // Clasificación
  tipo: TipoAnomalia;
  severidad: SeveridadAnomalia;
  estado: EstadoAnomalia;

  // Detección
  momentoDeteccion: string;        // ISO 8601
  descripcion: string;             // Descripción de la anomalía
  metodoDeteccion?: 'automatico' | 'manual' | 'reporte_ciudadano';

  // Localización
  ubicacionEstimada?: ICoordenadas; // Ubicación estimada de la anomalía
  referenciaUbicacion?: string;    // Referencia textual (ej: "Calle X esquina Y")

  // Impacto
  perdidaEstimada?: number;        // m³ perdidos estimados
  poblacionAfectada?: number;      // Cantidad de personas afectadas

  // Gestión
  usuarioAsignado?: string;        // ID de usuario responsable
  fechaAsignacion?: string;        // ISO 8601
  fechaResolucion?: string;        // ISO 8601
  notasResolucion?: string;        // Notas sobre cómo se resolvió

  // Seguimiento
  historialAcciones?: {
    timestamp: string;             // ISO 8601
    usuario: string;               // ID de usuario
    accion: string;                // Descripción de la acción
    estadoAnterior?: EstadoAnomalia;
    estadoNuevo?: EstadoAnomalia;
  }[];

  // Auditoría
  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;  // Auto-generado (ISO 8601), inmutable

  // Virtuals
  cliente?: any;         // ICliente
  division?: any;        // IDivision
  jefatura?: any;        // IJefatura
  distrito?: any;        // IDistrito
  puntoMedicion?: any;   // IPuntoMedicion
}

/**
 * DTO para crear una anomalía
 */
export interface ICreateAnomalia extends Omit<
  Partial<IAnomalia>,
  '_id' | 'cliente' | 'division' | 'jefatura' | 'distrito' | 'puntoMedicion' | 'fechaCreacion'
> {
  idCliente: string;               // Requerido
  tipo: TipoAnomalia;              // Requerido
  severidad: SeveridadAnomalia;    // Requerido
  estado: EstadoAnomalia;          // Requerido
  momentoDeteccion: string;        // Requerido
  descripcion: string;             // Requerido
}

/**
 * DTO para actualizar una anomalía
 */
export interface IUpdateAnomalia extends Omit<
  Partial<IAnomalia>,
  '_id' | 'cliente' | 'division' | 'jefatura' | 'distrito' | 'puntoMedicion' | 'fechaCreacion'
> {}
