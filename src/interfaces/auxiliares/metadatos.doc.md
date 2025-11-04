# Metadatos

**Entidad:** `IMetadatosDeOrigen`, `IMetadatosAuditoria`, `IMetadatosTecnicos`
**Contexto:** Auxiliares
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa información **sobre los datos** (no los datos en sí). Existen tres tipos de metadatos en el sistema:

---

## 📋 1. Metadatos de Origen (`IMetadatosDeOrigen`)

**Propósito:** Trazabilidad - ¿De dónde vino este dato?

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `fuente` | Sistema de origen | "zeus-maldonado" |
| `timestampIngesta` | Cuándo entró a RIOTEC | "2025-11-04T14:30:00Z" |
| `timestampOrigen` | Timestamp del sistema origen | "2025-11-04T14:29:55Z" |
| `metodoIntegracion` | Cómo se integró | "opc_ua" / "api_rest" |
| `camposEspecificos` | Datos específicos del origen | {...} |

**Ejemplo:**
```yaml
Lectura de Caudal:
  valor: 42 m³/h
  timestamp: 2025-11-04 14:30:00

  Metadatos de Origen:
    fuente: zeus-maldonado
    timestampIngesta: 2025-11-04T14:30:05Z  # 5 segundos después
    timestampOrigen: 2025-11-04T14:30:00Z
    metodoIntegracion: opc_ua
    camposEspecificos:
      tag: "ZEUS.BOOST.HOSP.FLOW_IN"
      calidad: "good"
```

---

## 📋 2. Metadatos de Auditoría (`IMetadatosAuditoria`)

**Propósito:** Auditoría - ¿Quién y cuándo modificó esto?

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `fechaCreacion` | Cuándo se creó | "2025-11-04T10:00:00Z" |
| `fechaUltimaModificacion` | Última modificación | "2025-11-04T15:30:00Z" |
| `creadoPor` | Usuario/sistema creador | "sistema.integracion" |
| `modificadoPor` | Usuario/sistema modificador | "operador.rodriguez" |
| `version` | Número de versión | 3 |

**Ejemplo:**
```yaml
Distrito Pitométrico Edén:
  nombre: "Distrito Pitométrico Edén"
  estado: operativo

  Metadatos de Auditoría:
    fechaCreacion: 2025-01-15T10:00:00Z
    fechaUltimaModificacion: 2025-11-04T15:30:00Z
    creadoPor: tecnico.lopez@ose.com.uy
    modificadoPor: operador.rodriguez@ose.com.uy
    version: 3  # Ha sido modificado 3 veces
```

---

## 📋 3. Metadatos Técnicos (`IMetadatosTecnicos`)

**Propósito:** Flexibilidad - Información específica por tipo de entidad

**Tipo:** `Record<string, any>` - Totalmente flexible

**Ejemplos por tipo de Punto de Medición:**

```yaml
Booster Hospital:
  tipo: booster
  metadatosTecnicos:
    capacidadBombeo: 100  # m³/h
    potencia: 50          # kW
    cantidadBombas: 2
    variadorFrecuencia: true

Depósito Principal:
  tipo: deposito
  metadatosTecnicos:
    capacidadAlmacenamiento: 1000  # m³
    materialTanque: "acero inoxidable"
    diametro: 15  # metros
    altura: 6     # metros

Medidor Residencial:
  tipo: residencial
  metadatosTecnicos:
    diametro: 13          # mm
    fabricante: "Elster"
    modelo: "V100"
    numeroSerie: "ELS-2024-12345"
    añoInstalacion: 2024
```

---

## 💡 Ventajas del Patrón de Metadatos

**Trazabilidad Completa:**
- Saber exactamente de dónde viene cada dato
- Auditar todas las modificaciones
- Cumplir requisitos regulatorios

**Flexibilidad:**
- Metadatos técnicos se adaptan a cada tipo de entidad
- No requiere cambios en el modelo para agregar campos específicos

**Debugging:**
- Si un dato parece incorrecto, revisar metadatos de origen
- Si algo cambió inesperadamente, revisar metadatos de auditoría

---

## 🔗 Se relaciona con

- **Todas las entidades del sistema**: Todas pueden tener metadatos
- **Lectura**: Incluye metadatos de origen para trazabilidad
- **Fuente de Datos**: Define el origen referenciado en metadatos

---

**Ver:** `metadatos.ts` para definición técnica completa
