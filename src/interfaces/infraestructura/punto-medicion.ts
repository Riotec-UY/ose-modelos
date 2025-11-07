import { IUbicacionGeografica } from './ubicacion-geografica';
import { TipoLectura, CalidadDato } from '../datos/lectura';

/**
 * Tipos de Punto de Medición
 *
 * Clasificación NO restrictiva (usada para UX, filtros, iconos).
 * NO determina qué variables puede tener (eso es dinámico vía Lecturas).
 */

// CONSUMO
export type TipoPuntoConsumo =
  | 'residencial'     // Domicilio particular
  | 'comercial'       // Comercio, oficina
  | 'industrial'      // Industria, fábrica
  | 'institucional';  // Hospital, escuela, edificio público

// INFRAESTRUCTURA DE PRODUCCIÓN
export type TipoPuntoProduccion =
  | 'perforacion'           // Pozo de extracción
  | 'planta_tratamiento'    // Planta potabilizadora
  | 'entrada_externa';      // Compra a otro proveedor

// INFRAESTRUCTURA DE DISTRIBUCIÓN
export type TipoPuntoDistribucion =
  | 'booster'            // Estación de bombeo
  | 'deposito'           // Tanque de almacenamiento
  | 'camara_valvulas';   // Punto de control en red

// CONTROL
export type TipoPuntoControl =
  | 'punto_control_distrito'  // Entrada/salida distrito pitométrico
  | 'interconexion';          // Conexión entre zonas

// GENÉRICO
export type TipoPuntoGenerico = 'otro'; // Otros casos no clasificados

/**
 * Union type de todos los tipos de punto
 */
export type TipoPuntoMedicion =
  | TipoPuntoConsumo
  | TipoPuntoProduccion
  | TipoPuntoDistribucion
  | TipoPuntoControl
  | TipoPuntoGenerico;


/**
 * Función en Balance Hídrico
 *
 * Define el rol del punto en el cálculo del balance hídrico.
 */
export type FuncionBalanceHidrico =
  | 'entrada'    // Agua que INGRESA al sistema (perforaciones, entrada externa)
  | 'salida'     // Agua que SALE del sistema (consumo residencial, comercial, industrial)
  | 'control'    // Puntos intermedios de medición (boosters, depósitos, distritos)
  | 'no_aplica'; // No participa en balance (ej: sensores de calidad sin caudal)

/**
 * Estado operacional del punto
 */
export type EstadoPuntoMedicion =
  | 'operativo'      // Funcionando normalmente
  | 'mantenimiento'  // En mantenimiento programado
  | 'error'          // Con fallas técnicas
  | 'inactivo';      // Desactivado permanentemente

// ==========================================
// CONFIGURACIONES EMBEBIDAS
// ==========================================

/**
 * Configuración de lectura embebida en punto de medición
 *
 * Define qué tipo de lectura se espera, con qué frecuencia y validaciones.
 * Se embebe directamente en IPuntoMedicion (sin _id ni referencias redundantes).
 */
export interface IConfiguracionLectura {
  /** Tipo de lectura esperada */
  tipoLectura: TipoLectura;

  /** Frecuencia esperada en minutos entre lecturas */
  frecuenciaEsperada: number;

  /** Si es true, genera alerta cuando falta */
  obligatoria: boolean;

  /** Rango de valores válidos (opcional) */
  rangoValido?: {
    minimo?: number;
    maximo?: number;
    unidad: string;
  };

  /** Tolerancia en minutos antes de alertar (default: 2x frecuencia) */
  toleranciaRetraso?: number;

  /** Calidad mínima aceptable */
  umbralCalidadMinima?: CalidadDato;

  /** Estado de la configuración */
  activa: boolean;
  fechaActivacion?: string;
  fechaDesactivacion?: string;

  /** Notas operativas */
  descripcion?: string;
  notas?: string;
}

/**
 * Métodos de sincronización disponibles
 */
export type MetodoSincronizacion =
  | 'polling'     // Sistema RIOTEC consulta periódicamente
  | 'push'        // Sistema externo envía datos cuando cambian
  | 'on_change'   // Sistema externo notifica cambios (webhook/MQTT)
  | 'manual';     // Sincronización manual/bajo demanda


/**
 * Estados de una configuración de integración
 */
export type EstadoConfiguracionIntegracion =
  | 'activa'           // Sincronización operativa
  | 'pausada'          // Pausada temporalmente
  | 'error'            // Error en última sincronización
  | 'desactivada';     // Desactivada permanentemente


/**
 * Mapeo de una variable externa a un tipo de lectura canónico
 */
export interface IMapeoVariable {
  /** Tag/ID en sistema externo (ej: "ZEUS-BOOST-HOSP.PressureIn") */
  variableExterna: string;

  /** Tipo en sistema externo (opcional) */
  tipoVariableExterna?: string;

  /** A qué tipo de lectura canónica mapea */
  tipoLecturaDestino: TipoLectura;

  /** Expresión o fórmula de conversión (ej: "x * 0.1" para cambiar unidades) */
  transformacion?: string;

  /** Factor multiplicador simple (alternativa a transformación) */
  factorConversion?: number;

  /** Descripción del mapeo */
  descripcion?: string;

  /** Estado del mapeo */
  activo: boolean;
}

/**
 * Configuración de integración embebida en punto de medición
 *
 * Define CÓMO sincronizar datos desde sistemas externos (Zeus, ATLAS, etc).
 * Se embebe directamente en IPuntoMedicion (sin _id ni referencias redundantes).
 */
export interface IConfiguracionIntegracion {
  /** ID de la fuente de datos externa (para filtrar "todos los de Zeus") */
  idFuenteDatos: string;

  /** Mapeo de variables externas → tipos de lectura canónicos */
  mapaVariables: IMapeoVariable[];

  /** Método de sincronización */
  metodoSincronizacion: MetodoSincronizacion;

  /** Frecuencia en minutos (obligatorio si método es 'polling') */
  frecuenciaSincronizacion?: number;

  /** Configuración específica del protocolo */
  configuracionProtocolo?: {
    // Para OPC UA
    nodeId?: string;
    browsePath?: string;

    // Para API REST
    endpoint?: string;
    metodoHTTP?: 'GET' | 'POST';
    parametrosQuery?: Record<string, string>;

    // Para MQTT
    topic?: string;

    // Genérico
    parametrosAdicionales?: Record<string, any>;
  };

  /** Estado de la integración */
  estado: EstadoConfiguracionIntegracion;

  /** Timestamp de última sincronización exitosa */
  ultimaSincronizacionExitosa?: string;

  /** Timestamp de último intento (exitoso o no) */
  ultimaSincronizacionIntento?: string;

  /** Timestamp de próxima sincronización programada */
  proximaSincronizacionProgramada?: string;

  /** Información del último error */
  ultimoError?: {
    timestamp: string;
    mensaje: string;
    codigo?: string;
  };

  /** Contador de errores consecutivos */
  contadorErroresConsecutivos?: number;

  /** Metadatos operativos */
  descripcion?: string;
  notas?: string;
  activa: boolean;
  fechaActivacion?: string;
  fechaDesactivacion?: string;
}

/**
 * Resumen de última lectura por tipo
 *
 * Permite acceso rápido a la última lectura sin consultar la colección de lecturas.
 * Se actualiza automáticamente cuando llega una nueva lectura.
 */
export interface IResumenUltimaLectura {
  /** Timestamp de la lectura */
  timestamp: string;

  /** Valor principal (caudal, presión, consumo, etc.) */
  valor: any;

  /** Calidad del dato */
  calidadDato: CalidadDato;

  /** Valores secundarios relevantes (opcional) */
  valoresAdicionales?: Record<string, any>;
}

/**
 * Punto de Medición - LUGAR físico donde se realizan mediciones
 *
 * Concepto clave: Representa el LUGAR, NO el tipo de dato ni el dispositivo.
 * Un punto puede tener 1 o múltiples Lecturas asociadas.
 *
 * Características:
 * - Identificador canónico (UUID interno RIOTEC)
 * - Tipo clasificatorio (NO restrictivo)
 * - Función en balance hídrico
 * - Ubicación geográfica
 * - **Configuraciones embebidas** (qué lecturas esperar, cómo sincronizar) ⭐
 * - **Resumen de últimas lecturas** (acceso rápido sin consultar colección) ⭐
 * - Metadatos técnicos flexibles (varían según tipo)
 * - Estado operacional
 *
 * Patrón MongoDB-optimized:
 * - Configuraciones embebidas (metadata pequeño, cambia poco)
 * - Lecturas en colección separada (volumen alto, historial completo)
 * - Resumen de última lectura embebido (acceso ultra-rápido)
 *
 * Ejemplos:
 * - Domicilio residencial: 1 lugar → 1 lectura de consumo
 * - Estación booster: 1 lugar → múltiples lecturas (presión entrada, presión salida, caudal, estado)
 * - Perforación: 1 lugar → múltiples lecturas (caudal, nivel freático, calidad)
 */
export interface IPuntoMedicion {
  _id?: string;
  idCliente: string;               // Referencia a Cliente
  idDivision?: string;             // Referencia a División (opcional)
  idJefatura?: string;             // Referencia a Jefatura (opcional)
  idDistrito?: string;             // Referencia a Distrito pitométrico (opcional)

  // Identificación
  nombre: string;                  // Nombre descriptivo del punto
  codigo?: string;                 // Código interno único (ej: "ATL-MAL-ED-00123")

  // Clasificación
  tipo: TipoPuntoMedicion;         // Tipo de lugar (clasificatorio, NO restrictivo)
  funcionBalanceHidrico: FuncionBalanceHidrico; // Rol en balance hídrico

  // Ubicación
  ubicacion: IUbicacionGeografica; // Coordenadas y referencias espaciales

  // Estado y fechas
  estado: EstadoPuntoMedicion;     // Estado operacional
  fechaInstalacion?: string;       // ISO 8601
  fechaDesactivacion?: string;     // ISO 8601 (si está inactivo)

  // ⭐ CONFIGURACIONES EMBEBIDAS (MongoDB-optimized)
  /**
   * Configuraciones de lecturas esperadas
   *
   * Define qué tipos de lecturas debe tener este punto, con qué frecuencia,
   * validaciones y alertas.
   *
   * Embebido porque:
   * - Metadata pequeño (~3-5 configs por punto)
   * - Cambia poco (solo en instalación o reconfiguración)
   * - Siempre se consulta junto con el punto
   */
  configuracionesLectura: IConfiguracionLectura[];

  /**
   * Configuración de integración con sistemas externos
   *
   * Define CÓMO sincronizar datos desde Zeus, ATLAS, etc.
   * Incluye mapeo de variables externas → tipos de lectura canónicos.
   *
   * Embebido porque:
   * - Metadata pequeño (~1 config por punto)
   * - Cambia muy poco
   * - Permite filtrar fácilmente "todos los puntos de Zeus"
   */
  configuracionIntegracion?: IConfiguracionIntegracion;

  /**
   * Resumen de última lectura por tipo
   *
   * Permite acceso ultra-rápido a la última lectura sin consultar
   * la colección de lecturas (historial completo).
   *
   * Se actualiza automáticamente cuando llega una nueva lectura.
   *
   * Ejemplo:
   * {
   *   "Macromedidor Caudal": {
   *     timestamp: "2025-11-04T10:30:00Z",
   *     valor: 45.2,
   *     calidadDato: "válida"
   *   },
   *   "Macromedidor Presión": {
   *     timestamp: "2025-11-04T10:30:00Z",
   *     valor: 3.5,
   *     calidadDato: "válida"
   *   }
   * }
   */
  ultimaLecturaPorTipo?: Record<TipoLectura, IResumenUltimaLectura>;

  // Metadatos técnicos flexibles
  // Varían según tipo de punto (ver ejemplos en documentación)
  metadatosTecnicos?: Record<string, any>;

  // Auditoría
  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;  // Auto-generado (ISO 8601), inmutable

  // Virtuals (populados por query)
  cliente?: any;     // ICliente
  division?: any;    // IDivision
  jefatura?: any;    // IJefatura
  distrito?: any;    // IDistrito
}

/**
 * DTO para crear un punto de medición
 */
export interface ICreatePuntoMedicion extends Omit<
  Partial<IPuntoMedicion>,
  '_id' | 'cliente' | 'division' | 'jefatura' | 'distrito' | 'ultimaLecturaPorTipo' | 'fechaCreacion'
> {
  idCliente: string;                            // Requerido
  nombre: string;                               // Requerido
  tipo: TipoPuntoMedicion;                      // Requerido
  funcionBalanceHidrico: FuncionBalanceHidrico; // Requerido
  ubicacion: IUbicacionGeografica;              // Requerido
  estado: EstadoPuntoMedicion;                  // Requerido
  configuracionesLectura: IConfiguracionLectura[]; // Requerido (puede ser array vacío si aún no se configuró)
}

/**
 * DTO para actualizar un punto de medición
 */
export interface IUpdatePuntoMedicion extends Omit<
  Partial<IPuntoMedicion>,
  '_id' | 'cliente' | 'division' | 'jefatura' | 'distrito' | 'fechaCreacion'
> {}
