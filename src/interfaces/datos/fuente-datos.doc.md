# Fuente de Datos

**Entidad:** `IFuenteDatos`
**Contexto:** Datos / Integración
**Versión:** 1.0.0

---

## 🎯 ¿Qué es?

Representa un **sistema externo** que provee datos al sistema RIOTEC. Es la abstracción de sistemas como ATLAS, Zeus SCADA, GIS, etc.

---

## 📋 Información que contiene

| Campo | Qué representa | Ejemplo |
|-------|----------------|---------|
| `nombre` | Nombre descriptivo | "ATLAS Maldonado" |
| `codigo` | Código identificador | "ATLAS-MALD" |
| `tipo` | Tipo de sistema | "scada" / "gestion_comercial" / "gis" / etc. |
| `configuracion` | Parámetros de conexión | URL, autenticación, frecuencia |
| `estado` | Estado operacional | "activa" / "error" / "mantenimiento" |
| `ultimaSincronizacion` | Cuándo sincronizó por última vez | "2025-11-04T14:35:00Z" |

---

## 💡 Ejemplo 1: ATLAS Maldonado

```yaml
Fuente de Datos:
  ID: atlas-maldonado
  Cliente: OSE Uruguay

  Nombre: "ATLAS Maldonado"
  Código: "ATLAS-MALD"
  Tipo: gestion_comercial

  Configuración:
    url: "https://api.atlas.maldonado.ose.uy"
    tipoAutenticacion: "bearer"
    metodoIntegracion: "api_rest"
    frecuenciaSincronizacion: 15 minutos
    ultimaSincronizacion: hace 12 minutos
    proximaSincronizacion: en 3 minutos

  Estado: activa
  Mensaje Estado: "Operando normalmente"

  Errores Recientes: []  # Sin errores
```

---

## 💡 Ejemplo 2: Zeus SCADA Maldonado

```yaml
Fuente de Datos:
  ID: zeus-maldonado
  Cliente: OSE Uruguay

  Nombre: "Zeus SCADA Maldonado"
  Código: "ZEUS-MALD"
  Tipo: scada

  Configuración:
    url: "opc.tcp://scada.maldonado.ose.uy:4840"
    tipoAutenticacion: "basic"
    metodoIntegracion: "opc_ua"
    frecuenciaSincronizacion: 5 minutos
    ultimaSincronizacion: hace 3 minutos

  Estado: activa
```

---

## 🔗 Se relaciona con

- **Configuración de Integración** (`IConfiguracionIntegracionPunto`): Define cómo cada punto sincroniza desde esta fuente
- **Referencia Externa** (`IReferenciaExterna`): Mapea IDs de esta fuente a entidades canónicas
- **Metadatos de Origen** (`IMetadatosDeOrigen`): Traza el origen de cada dato

---

## ⚙️ Tipos de Fuentes

| Tipo | Descripción | Ejemplo OSE |
|------|-------------|-------------|
| `scada` | Sistemas de control y adquisición | Zeus, iFIX |
| `gestion_comercial` | Sistemas comerciales/facturación | ATLAS |
| `gis` | Sistemas de información geográfica | ArcGIS |
| `sensor_iot` | Sensores IoT directos | Sensores LoRa |
| `manual` | Carga manual de datos | Planillas Excel |

---

## 👥 ¿Quién la usa?

**Administradores RIOTEC:** Configuran fuentes al integrar nuevos sistemas

**Sistema de Sincronización:** Consulta configuración para ejecutar sincronizaciones

**Dashboard de Monitoreo:** Muestra estado de salud de integraciones

---

**Ver:** `fuente-datos.ts` para definición técnica completa
