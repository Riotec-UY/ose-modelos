
/**
 * Sistemas externos conocidos y soportados por RIOTEC
 *
 * Cada sistema requiere implementación específica de integración.
 * NO son entidades CRUD - son constantes que representan sistemas
 * con lógica de negocio y adaptadores ya desarrollados.
 */
export type SistemaExternoConocido =
  | 'zeus-scada'           // Sistema SCADA Zeus (Microcom) - Integración OPC UA
  | 'atlas-telemetria';    // Sistema ATLAS (Teleimpresores) - Telemetría
