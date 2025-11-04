
/**
 * Tipo de sistema externo
 */
export type TipoSistemaExterno =
  | 'scada'              // Sistema SCADA (Zeus, iFIX, WinCC, etc.)
  | 'telemetria'         // Sistema de telemetría (ATLAS, etc.)
  | 'gis'                // GIS (ArcGIS, QGIS, etc.)
  | 'erp'                // ERP / Sistema comercial
  | 'database'           // Base de datos externa
  | 'iot_platform'       // Plataforma IoT
  | 'otro';              // Otros

/**
 * Array de tipos de sistema (para iterar)
 */
export const TIPOS_SISTEMA_EXTERNO: TipoSistemaExterno[] = [
  'scada',
  'telemetria',
  'gis',
  'erp',
  'database',
  'iot_platform',
  'otro'
];

/**
 * Protocolos de comunicación soportados
 */
export type ProtocoloComunicacion =
  | 'api_rest'           // REST API (HTTP/HTTPS)
  | 'opc_ua'             // OPC UA (SCADA estándar)
  | 'opc_da'             // OPC DA (legacy)
  | 'mqtt'               // MQTT (IoT)
  | 'modbus'             // Modbus TCP/RTU
  | 'soap'               // SOAP Web Services
  | 'graphql'            // GraphQL API
  | 'websocket'          // WebSocket
  | 'database_direct'    // Conexión directa a BD (ODBC, JDBC)
  | 'file_based'         // Archivos (CSV, XML, JSON)
  | 'webhook'            // Webhooks / Push notifications
  | 'otro';              // Otro protocolo

/**
 * Array de protocolos (para iterar)
 */
export const PROTOCOLOS_COMUNICACION: ProtocoloComunicacion[] = [
  'api_rest',
  'opc_ua',
  'opc_da',
  'mqtt',
  'modbus',
  'soap',
  'graphql',
  'websocket',
  'database_direct',
  'file_based',
  'webhook',
  'otro'
];

/**
 * Estado del sistema externo (catálogo general)
 */
export type EstadoSistemaExterno =
  | 'disponible'         // Disponible para integración
  | 'en_uso'             // Actualmente en uso
  | 'mantenimiento'      // En mantenimiento
  | 'deprecado'          // Deprecado (no usar en nuevas integraciones)
  | 'discontinuado';     // Discontinuado (producto fuera de soporte)

/**
 * Array de estados (para iterar)
 */
export const ESTADOS_SISTEMA_EXTERNO: EstadoSistemaExterno[] = [
  'disponible',
  'en_uso',
  'mantenimiento',
  'deprecado',
  'discontinuado'
];

/**
 * Información de contacto/soporte
 */
export interface IContactoSoporte {
  nombre?: string;                // Persona/departamento de contacto
  email?: string;                 // Email de contacto
  telefono?: string;              // Teléfono de contacto
  horarioAtencion?: string;       // ej: "Lun-Vie 9-18hs"
  urlSoporte?: string;            // URL de portal de soporte
  nivelSoporte?: string;          // ej: "24/7", "Business Hours", "Best Effort"
}

/**
 * Sistema Externo - Catálogo de productos/sistemas
 *
 * Representa un PRODUCTO o PLATAFORMA de software externa (ej: "ATLAS", "Zeus", "iFIX").
 * NO es una instancia específica (esas son IFuenteDatos).
 *
 * Diferencia conceptual:
 * - ISistemaExterno = PRODUCTO (ej: "Zeus SCADA")
 * - IFuenteDatos = INSTANCIA (ej: "Zeus UGD Maldonado", "Zeus UGD Colonia")
 *
 * Beneficios:
 * - Estandarizar configuraciones por tipo de sistema
 * - Documentar capacidades y limitaciones
 * - Facilitar onboarding de nuevas instancias
 * - Mantener catálogo de sistemas soportados
 *
 * Ejemplos:
 * - "Zeus" (Microcom SCADA) → Múltiples instancias en diferentes UGDs
 * - "ATLAS" (Teleimpresores) → Una instancia por UGD
 * - "iFIX" (GE/Emerson SCADA) → Varias instancias en plantas
 */
export interface ISistemaExterno {
  _id?: string;

  // Identificación
  nombre: string;                      // ej: "Zeus SCADA", "ATLAS", "iFIX"
  nombreComercial?: string;            // Nombre comercial/marca
  codigo?: string;                     // Código interno único
  tipo: TipoSistemaExterno;

  // Proveedor
  proveedor: string;                   // ej: "Microcom", "Teleimpresores", "GE Digital"
  urlProveedor?: string;               // Website del proveedor
  version?: string;                    // Versión del producto (ej: "5.6.70+")
  versionesCompatibles?: string[];     // Versiones soportadas por RIOTEC

  // Capacidades técnicas
  protocolosSoportados: ProtocoloComunicacion[]; // Protocolos disponibles
  protocoloRecomendado?: ProtocoloComunicacion;  // Protocolo preferido para RIOTEC
  caracteristicas?: string[];          // Capacidades destacadas

  // Documentación
  urlDocumentacion?: string;           // URL de documentación oficial
  urlAPIDoc?: string;                  // URL de documentación de API
  ejemplosIntegracion?: string[];      // URLs de ejemplos de código
  notas?: string;                      // Notas técnicas para integradores

  // Soporte
  contactoSoporte?: IContactoSoporte;

  // Estado
  estado: EstadoSistemaExterno;
  fechaAgregado?: string;              // Cuándo se agregó al catálogo (ISO 8601)
  fechaDeprecacion?: string;           // Cuándo se deprecó (ISO 8601)

  // Metadatos técnicos
  requisitos?: {
    autenticacion?: string[];          // Tipos de auth requeridos
    redRequerida?: string;             // ej: "VPN", "Internet", "LAN"
    certificados?: boolean;            // ¿Requiere certificados SSL/TLS?
    firewall?: string[];               // Puertos/IPs a habilitar
  };

  // Limitaciones conocidas
  limitaciones?: string[];             // Limitaciones técnicas conocidas

  // Estadísticas de uso
  cantidadInstancias?: number;         // Cantidad de IFuenteDatos de este sistema

  // Metadatos adicionales
  metadatos?: Record<string, any>;     // Información específica por tipo

  // Auditoría simple (patrón GAS/INSIDE)
  fechaCreacion?: string;              // Auto-generado (ISO 8601), inmutable
}

/**
 * DTO para crear un sistema externo
 */
export interface ICreateSistemaExterno extends Omit<
  Partial<ISistemaExterno>,
  '_id' | 'fechaCreacion' | 'cantidadInstancias'
> {
  nombre: string;                      // Requerido
  tipo: TipoSistemaExterno;            // Requerido
  proveedor: string;                   // Requerido
  protocolosSoportados: ProtocoloComunicacion[]; // Requerido
  estado: EstadoSistemaExterno;        // Requerido
}

/**
 * DTO para actualizar un sistema externo
 */
export interface IUpdateSistemaExterno extends Omit<
  Partial<ISistemaExterno>,
  '_id' | 'fechaCreacion' | 'cantidadInstancias'
> {}
