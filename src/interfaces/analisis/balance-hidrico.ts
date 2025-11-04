import { IMetadatosAuditoria } from '../auxiliares';

/**
 * Período del balance hídrico
 */
export type PeriodoBalance =
  | 'horario'   // Detección temprana
  | 'diario'    // Gestión operativa
  | 'semanal'   // Tendencias
  | 'mensual';  // Reporting

/**
 * Estado del balance hídrico
 */
export type EstadoBalance =
  | 'calculado'  // Recién calculado, pendiente de validación
  | 'validado'   // Revisado y aprobado por operador
  | 'publicado'  // Disponible para reporting público
  | 'rechazado'  // Rechazado por inconsistencias
  | 'archivado'; // Archivado (histórico)

/**
 * Balance Hídrico - Cálculo de agua entrada vs salida
 *
 * Representa el cálculo del balance hídrico en un distrito pitométrico
 * para un período específico.
 *
 * Fórmula básica:
 * Pérdidas = Entrada - Salida - Consumo_Autorizado_No_Medido
 * Eficiencia (%) = (Salida / Entrada) × 100
 *
 * Características:
 * - Se calcula por distrito y período
 * - Pasa por estados de validación
 * - Incluye metadata de trazabilidad
 */
export interface IBalanceHidrico {
  _id?: string;
  idCliente: string;               // Referencia a Cliente
  idDistrito: string;              // Referencia a Distrito

  // Período
  periodo: PeriodoBalance;
  fechaInicio: string;             // ISO 8601
  fechaFin: string;                // ISO 8601

  // Volúmenes (en m³)
  volumenEntrada: number;          // Agua que ingresó al distrito
  volumenSalida: number;           // Agua consumida medida
  consumoAutorizadoNoMedido: number; // Estimación de consumo sin medidor (ej: bocas de incendio)

  // Resultados calculados
  perdidasCalculadas: number;      // m³ perdidos
  porcentajePerdidas: number;      // % de pérdidas
  porcentajeEficiencia: number;    // % de eficiencia (100 - pérdidas)

  // Estado y validación
  estado: EstadoBalance;
  fechaCalculo: string;            // ISO 8601 - cuándo se calculó
  usuarioValidador?: string;       // ID de usuario que validó
  fechaValidacion?: string;        // ISO 8601 - cuándo se validó
  notas?: string;                  // Notas del validador

  // Detalles adicionales
  detalles?: {
    cantidadPuntosEntrada?: number;    // Cantidad de puntos de entrada considerados
    cantidadPuntosSalida?: number;     // Cantidad de puntos de salida considerados
    puntosConError?: string[];         // IDs de puntos con datos erróneos
    metodoCalculo?: 'simple' | 'avanzado'; // Método usado para el cálculo
  };

  // Auditoría
  metadatosAuditoria?: IMetadatosAuditoria;

  // Virtuals
  cliente?: any;    // ICliente
  distrito?: any;   // IDistrito
}

/**
 * DTO para crear un balance hídrico
 */
export interface ICreateBalanceHidrico extends Omit<
  Partial<IBalanceHidrico>,
  '_id' | 'cliente' | 'distrito'
> {
  idCliente: string;                 // Requerido
  idDistrito: string;                // Requerido
  periodo: PeriodoBalance;           // Requerido
  fechaInicio: string;               // Requerido
  fechaFin: string;                  // Requerido
  volumenEntrada: number;            // Requerido
  volumenSalida: number;             // Requerido
  consumoAutorizadoNoMedido: number; // Requerido
  perdidasCalculadas: number;        // Requerido
  porcentajePerdidas: number;        // Requerido
  porcentajeEficiencia: number;      // Requerido
  estado: EstadoBalance;             // Requerido
  fechaCalculo: string;              // Requerido
}

/**
 * DTO para actualizar un balance hídrico
 */
export interface IUpdateBalanceHidrico extends Omit<
  Partial<IBalanceHidrico>,
  '_id' | 'cliente' | 'distrito'
> {}
